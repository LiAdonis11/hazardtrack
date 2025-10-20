<?php
include 'jwt_helper.php';
include 'db.php';

// CORS headers
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8081',
    'http://192.168.254.183:8081',
    'exp://192.168.254.183:8081',
    'http://192.168.254.183',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Authentication
$token = getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit();
}

$payload = validateJWT($token);
if (!$payload) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
    exit();
}

if ($payload['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
    exit();
}

try {
    // Fetch audit logs from status_history table
    $query = "
        SELECT
            sh.id,
            sh.old_status,
            sh.new_status,
            sh.change_note,
            sh.created_at as timestamp,
            u.fullname as user,
            hr.title as target
        FROM status_history sh
        JOIN users u ON sh.changed_by = u.id
        JOIN hazard_reports hr ON sh.report_id = hr.id
        ORDER BY sh.created_at DESC
        LIMIT 500 -- Limit to prevent performance issues
    ";

    $result = $conn->query($query);
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = [
            'id' => $row['id'],
            'action' => 'Status Updated',
            'user' => $row['user'],
            'target' => $row['target'],
            'details' => $row['change_note'] ?: "Status changed from '{$row['old_status']}' to '{$row['new_status']}'",
            'timestamp' => $row['timestamp']
        ];
    }

    echo json_encode(['status' => 'success', 'logs' => $logs]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch audit logs: ' . $e->getMessage()]);
}
?>
