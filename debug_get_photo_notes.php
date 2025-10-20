<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'api/jwt_helper.php';

try {
    echo "=== DEBUG: get_photo_notes API ===\n\n";

    // Debug: Check headers
    $headers = getallheaders();
    echo "Headers received:\n";
    print_r($headers);
    echo "\n";

    // Get JWT token from header
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    echo "Auth header: '$authHeader'\n";

    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        echo "No valid Bearer token found\n";
        exit;
    }

    $token = $matches[1];
    echo "Token extracted: " . substr($token, 0, 50) . "...\n";

    $user = validateJWT($token);
    echo "User validation result: ";
    print_r($user);
    echo "\n";

    if (!$user) {
        echo "Token validation failed\n";
        exit;
    }

    // Get report_id from query parameter
    $reportId = isset($_GET['report_id']) ? (int)$_GET['report_id'] : null;
    echo "Report ID: $reportId\n";

    if (!$reportId) {
        echo "No report ID provided\n";
        exit;
    }

    // Validate that the user has access to this report
    $conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
    if ($conn->connect_error) {
        echo "Database connection failed: " . $conn->connect_error . "\n";
        exit;
    }

    // Check if report exists and user has access
    $stmt = $conn->prepare("SELECT id FROM hazard_reports WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $reportId, $user['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    echo "Report access check result: " . $result->num_rows . " rows\n";

    if ($result->num_rows === 0) {
        echo "Report not found or access denied\n";
        exit;
    }

    echo "Access granted to report $reportId\n";

} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
