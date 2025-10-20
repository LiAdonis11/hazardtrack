<?php
include 'db.php';
include 'jwt_helper.php';

// Essential CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, PUT");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST/PUT
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

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

// Add debug logging
error_log("=== UPDATE REPORT PRIORITY REQUEST ===");

// Get JWT token from request
$token = null;
if (isset($_POST['token']) && !empty($_POST['token'])) {
    $token = $_POST['token'];
} elseif (isset($_GET['token']) && !empty($_GET['token'])) {
    $token = $_GET['token'];
} else {
    $token = getBearerTokenFromHeader();
}

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

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$report_id = $input['report_id'] ?? $_POST['report_id'] ?? null;
$new_priority = $input['priority'] ?? $_POST['priority'] ?? null;

error_log("Report ID: $report_id, New Priority: $new_priority");

if (!$report_id || !$new_priority) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Report ID and priority are required']);
    exit();
}

// Validate priority
$valid_priorities = ['low', 'medium', 'high', 'emergency'];
if (!in_array($new_priority, $valid_priorities)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid priority. Must be one of: ' . implode(', ', $valid_priorities)]);
    exit();
}

try {
    // Update report priority
    $stmt = $conn->prepare("
        UPDATE hazard_reports
        SET priority = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->bind_param("si", $new_priority, $report_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Report priority updated successfully',
            'data' => [
                'report_id' => $report_id,
                'new_priority' => $new_priority,
                'updated_by' => $payload['user_id']
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Report not found or no changes made']);
    }
} catch (Exception $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to update report priority: ' . $e->getMessage()]);
}
?>
