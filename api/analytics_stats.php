<?php
include 'jwt_helper.php';
include 'db.php';

// List of allowed origins
$allowed_origins = [
    'http://localhost:5173',        // Vite dev server (web admin)
    'http://localhost:5174',        // Vite dev server alternative port
    'http://localhost:8081',        // React Native web/Expo web
    'http://192.168.254.183:8081',  // IP access for web
    'exp://192.168.254.183:8081',   // Expo mobile app
    'http://192.168.254.183',       // Direct IP access
    // Add your production domains here when ready
    'https://yourproductiondomain.com',
];

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if the origin is in the allowed list
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: *");
}

// Essential CORS headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get JWT token from request
$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit();
}

// Validate JWT token
$payload = validateJWT($token);
if (!$payload) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
    exit();
}

// Check if user has admin or inspector role
if ($payload['role'] !== 'admin' && $payload['role'] !== 'inspector') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Admin or BFP personnel access required']);
    exit();
}

// Get time range parameter
$range = isset($_GET['range']) ? $_GET['range'] : '30d';

// Get months parameter for trends
$months = isset($_GET['months']) ? (int)$_GET['months'] : 12;

// Calculate date range
$now = new DateTime();
switch ($range) {
    case '7d':
        $startDate = $now->modify('-7 days')->format('Y-m-d H:i:s');
        break;
    case '30d':
        $startDate = $now->modify('-30 days')->format('Y-m-d H:i:s');
        break;
    case '90d':
        $startDate = $now->modify('-90 days')->format('Y-m-d H:i:s');
        break;
    case '1y':
        $startDate = $now->modify('-1 year')->format('Y-m-d H:i:s');
        break;
    default:
        $startDate = $now->modify('-30 days')->format('Y-m-d H:i:s');
}

try {
    $data = [];

    // Total reports
    $query = "SELECT COUNT(*) as total FROM hazard_reports WHERE created_at >= '$startDate'";
    $result = $conn->query($query);
    $data['totalReports'] = $result->fetch_assoc()['total'];

    // Resolved reports
    $query = "SELECT COUNT(*) as total FROM hazard_reports WHERE status = 'resolved' AND created_at >= '$startDate'";
    $result = $conn->query($query);
    $data['resolvedReports'] = $result->fetch_assoc()['total'];

    // Resolution rate
    $data['resolutionRate'] = $data['totalReports'] > 0 ? round(($data['resolvedReports'] / $data['totalReports']) * 100, 1) : 0;

    // Active cases
    $query = "SELECT COUNT(*) as total FROM hazard_reports WHERE status IN ('pending', 'in_progress') AND created_at >= '$startDate'";
    $result = $conn->query($query);
    $data['activeCases'] = $result->fetch_assoc()['total'];

    // Average response time (in hours)
    // This calculates the time from creation to the first time it was marked 'in_progress'
    $query = "SELECT AVG(TIMESTAMPDIFF(HOUR, hr.created_at, sh.created_at)) as avg_time
              FROM hazard_reports hr
              JOIN status_history sh ON hr.id = sh.report_id
              WHERE sh.new_status = 'in_progress'
              AND sh.id = (SELECT MIN(id) FROM status_history WHERE report_id = hr.id AND new_status = 'in_progress')
              AND hr.created_at >= '$startDate'";
    $result = $conn->query($query);
    $avgTime = $result->fetch_assoc()['avg_time'];
    $data['avgResponseTime'] = $avgTime !== null ? round($avgTime, 1) : 0;

    // Average resolution time (in hours)
    // This calculates the time from creation to resolution for resolved reports
    $query = "SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_time
              FROM hazard_reports
              WHERE status = 'resolved' AND created_at >= '$startDate'";
    $result = $conn->query($query);
    $avgResolutionTime = $result->fetch_assoc()['avg_time'];
    $data['avgResolutionTime'] = $avgResolutionTime !== null ? round($avgResolutionTime, 1) : 0;

    // Reports by location (using location_address as barangay)
    $query = "SELECT location_address as barangay, COUNT(*) as count FROM hazard_reports WHERE created_at >= '$startDate' AND location_address IS NOT NULL AND location_address != '' GROUP BY location_address ORDER BY count DESC LIMIT 10";
    $result = $conn->query($query);
    $data['reportsByBarangay'] = [];
    while ($row = $result->fetch_assoc()) {
        $data['reportsByBarangay'][] = ['label' => $row['barangay'], 'value' => (int)$row['count']];
    }

    // Reports by category (joining with categories table for hazard type)
    $query = "SELECT c.name as hazard_type, COUNT(*) as count
              FROM hazard_reports hr
              LEFT JOIN categories c ON hr.category_id = c.id
              WHERE hr.created_at >= '$startDate'
              GROUP BY c.name
              ORDER BY count DESC";
    $result = $conn->query($query);
    $data['reportsByHazardType'] = [];
    while ($row = $result->fetch_assoc()) {
        $data['reportsByHazardType'][] = ['label' => $row['hazard_type'] ?: 'Uncategorized', 'value' => (int)$row['count']];
    }

    // Response time analytics (distribution)
    $query = "SELECT
        CASE
            WHEN TIMESTAMPDIFF(HOUR, created_at, updated_at) <= 1 THEN '0-1h'
            WHEN TIMESTAMPDIFF(HOUR, created_at, updated_at) <= 6 THEN '1-6h'
            WHEN TIMESTAMPDIFF(HOUR, created_at, updated_at) <= 24 THEN '6-24h'
            ELSE '24h+'
        END as time_range,
        COUNT(*) as count
        FROM hazard_reports
        WHERE status = 'resolved' AND created_at >= '$startDate'
        GROUP BY time_range
        ORDER BY FIELD(time_range, '0-1h', '1-6h', '6-24h', '24h+')";
    $result = $conn->query($query);
    $data['responseTimeAnalytics'] = [];
    while ($row = $result->fetch_assoc()) {
        $data['responseTimeAnalytics'][] = ['label' => $row['time_range'], 'value' => (int)$row['count']];
    }

    // Monthly trends (last N months) - generate all months with 0 if no data
    $monthlyTrends = [];
    $currentDate = new DateTime();
    for ($i = $months - 1; $i >= 0; $i--) {
        $date = clone $currentDate;
        $date->modify("-{$i} months");
        $monthName = $date->format('F Y'); // Full month name and year
        $startOfMonth = $date->format('Y-m-01 00:00:00');
        $endOfMonth = $date->format('Y-m-t 23:59:59');

        $query = "SELECT COUNT(*) as count FROM hazard_reports WHERE created_at >= '$startOfMonth' AND created_at <= '$endOfMonth'";
        $result = $conn->query($query);
        $count = $result->fetch_assoc()['count'];

        $monthlyTrends[] = ['label' => $monthName, 'value' => (int)$count];
    }
    $data['monthlyTrends'] = $monthlyTrends;

    // Priority counts
    $query = "SELECT priority, COUNT(*) as count FROM hazard_reports WHERE created_at >= '$startDate' GROUP BY priority";
    $result = $conn->query($query);
    $priorities = [];
    while ($row = $result->fetch_assoc()) {
        $priorities[$row['priority']] = (int)$row['count'];
    }
    $data['emergencyCount'] = $priorities['emergency'] ?? 0;
    $data['highPriorityCount'] = $priorities['high'] ?? 0;
    $data['mediumPriorityCount'] = $priorities['medium'] ?? 0;
    $data['lowPriorityCount'] = $priorities['low'] ?? 0;

    // Status counts
    $query = "SELECT status, COUNT(*) as count FROM hazard_reports WHERE created_at >= '$startDate' GROUP BY status";
    $result = $conn->query($query);
    $statuses = [];
    while ($row = $result->fetch_assoc()) {
        $statuses[$row['status']] = (int)$row['count'];
    }
    $data['pendingCount'] = $statuses['pending'] ?? 0;
    $data['inProgressCount'] = $statuses['in_progress'] ?? 0;
    $data['resolvedCount'] = $statuses['resolved'] ?? 0;
    $data['rejectedCount'] = $statuses['rejected'] ?? 0;

    // Active users
    $query = "SELECT COUNT(*) as total FROM users WHERE is_active = 1";
    $result = $conn->query($query);
    $data['activeUsers'] = $result->fetch_assoc()['total'];

    // New users in the selected period
    $query = "SELECT COUNT(*) as total FROM users WHERE created_at >= '$startDate'";
    $result = $conn->query($query);
    $data['newUsers'] = $result->fetch_assoc()['total'];

    // Additional metrics
    // $data['avgResolutionTime'] is already set above
    $data['successRate'] = $data['resolutionRate'];
    $data['userSatisfaction'] = 85; // Placeholder

    echo json_encode(['status' => 'success', 'data' => $data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch analytics: ' . $e->getMessage()]);
}
?>
