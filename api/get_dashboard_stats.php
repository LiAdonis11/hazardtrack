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

// Authentication check for admin access
function getAuthorizationHeader(){
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function getBearerTokenFromHeader() {
    $headers = getAuthorizationHeader();
    // HEADER: Get the access token from the header
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

// Get JWT token from request
$token = getBearerTokenFromHeader();

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

try {
    // Get total reports count
    $totalReportsQuery = "SELECT COUNT(*) as total FROM hazard_reports";
    $totalReportsResult = $conn->query($totalReportsQuery);
    $totalReports = $totalReportsResult->fetch_assoc()['total'];

    // Get residents count
    $residentsQuery = "SELECT COUNT(*) as total FROM users WHERE role = 'resident' AND is_active = 1";
    $residentsResult = $conn->query($residentsQuery);
    $residentsCount = $residentsResult->fetch_assoc()['total'];

    // Get BFP personnel count
    $bfpPersonnelQuery = "SELECT COUNT(*) as total FROM users WHERE role IN ('admin', 'bfp_personnel', 'inspector') AND is_active = 1";
    $bfpPersonnelResult = $conn->query($bfpPersonnelQuery);
    $bfpPersonnelCount = $bfpPersonnelResult->fetch_assoc()['total'];

    // Calculate average response time (time from report creation to first 'in_progress' status)
    $avgResponseTimeQuery = "
        SELECT AVG(TIMESTAMPDIFF(HOUR, hr.created_at, sh.created_at)) as avg_response_time
        FROM hazard_reports hr
        JOIN status_history sh ON hr.id = sh.report_id
        WHERE sh.new_status = 'in_progress'
        AND sh.id = (SELECT MIN(id) FROM status_history WHERE report_id = hr.id AND new_status = 'in_progress')
    ";
    $avgResponseTimeResult = $conn->query($avgResponseTimeQuery);
    $avgResponseTime = $avgResponseTimeResult->fetch_assoc()['avg_response_time'];

    // If no assignments yet, set to 0
    if ($avgResponseTime === null) {
        $avgResponseTime = 0;
    }

    // Round to 1 decimal place
    $avgResponseTime = round($avgResponseTime, 1);

    // Get reports by priority for map pins
    $reportsByPriorityQuery = "
        SELECT
            hr.id,
            hr.title,
            hr.latitude,
            hr.longitude,
            hr.priority,
            hr.status,
            hr.severity,
            hr.created_at,
            hr.location_address,
            hr.category_id as category,
            u.fullname as reporter_name,
            hr.phone as contact_number,
            hr.description,
            hr.image_path
        FROM hazard_reports hr
        LEFT JOIN users u ON hr.user_id = u.id
        WHERE hr.latitude IS NOT NULL AND hr.longitude IS NOT NULL
        ORDER BY hr.created_at DESC
    ";
    $reportsByPriorityResult = $conn->query($reportsByPriorityQuery);
    $reportsByPriority = [];
    while ($row = $reportsByPriorityResult->fetch_assoc()) {
        $reportsByPriority[] = $row;
    }

    // Get reports by status
    $reportsByStatusQuery = "SELECT status, COUNT(*) as count FROM hazard_reports GROUP BY status";
    $reportsByStatusResult = $conn->query($reportsByStatusQuery);
    $reportsByStatus = [];
    while ($row = $reportsByStatusResult->fetch_assoc()) {
        $reportsByStatus[$row['status']] = (int)$row['count'];
    }

    $stats = [
        'total_reports' => (int)$totalReports,
        'residents_count' => (int)$residentsCount,
        'bfp_personnel_count' => (int)$bfpPersonnelCount,
        'avg_response_time_hours' => (float)$avgResponseTime,
        'reports_by_priority' => $reportsByPriority,
        'reports_by_status' => [
            'pending' => $reportsByStatus['pending'] ?? 0,
            'in_progress' => $reportsByStatus['in_progress'] ?? 0,
            'resolved' => $reportsByStatus['resolved'] ?? 0,
            'rejected' => $reportsByStatus['rejected'] ?? 0, // Corrected from 'rejected'
            'closed' => $reportsByStatus['closed'] ?? 0, // Added 'closed' status
        ]
    ];

    echo json_encode(['status' => 'success', 'stats' => $stats]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch dashboard stats: ' . $e->getMessage()]);
}
?>