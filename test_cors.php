<?php
// Test CORS headers and basic API connectivity
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Test database connection
include __DIR__ . '/api/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Test database connection
    $test_query = "SELECT COUNT(*) as user_count FROM users WHERE is_active = 1";
    $result = $conn->query($test_query);

    if ($result) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'status' => 'success',
            'message' => 'CORS and database connection test successful',
            'user_count' => $row['user_count'],
            'server_info' => [
                'method' => $_SERVER['REQUEST_METHOD'],
                'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database query failed',
            'error' => $conn->error
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Test POST request
    $data = json_decode(file_get_contents('php://input'), true);

    echo json_encode([
        'status' => 'success',
        'message' => 'POST request received successfully',
        'received_data' => $data,
        'server_info' => [
            'method' => $_SERVER['REQUEST_METHOD'],
            'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'none',
            'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none'
        ]
    ]);
}
?>
