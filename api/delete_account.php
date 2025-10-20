<?php
include 'jwt_helper_extended.php';
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
    'http://192.168.43.1',          // Your gateway/router
    'http://192.168.43.6',          // Your computer's IP
    'http://localhost',             // Localhost without port
];

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if the origin is in the allowed list
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    // For mobile apps that might not send Origin header, allow but be cautious
    header("Access-Control-Allow-Origin: *");
}

// Essential CORS headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

// Get JWT token from request
$token = getBearerToken();

error_log("Token received in delete_account: " . ($token ? substr($token, 0, 50) . "..." : "null"));

if (!$token) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit();
}

// Validate JWT token
$payload = validateJWT($token);
if (!$payload) {
    error_log("JWT validation failed for token: " . substr($token, 0, 50) . "...");
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
    exit();
}

$user_id = $payload['user_id'];

// Read JSON body
$data = json_decode(file_get_contents('php://input'), true);

$password = $data['password'] ?? '';

// Validation
if (empty($password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password is required for account deletion']);
    exit();
}

// Get current user password hash
$sql = "SELECT password FROM users WHERE id = ? AND is_active = 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
    exit();
}

// Verify password
if (!password_verify($password, $user['password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password is incorrect']);
    exit();
}

// Soft delete account by setting is_active = 0
$update_sql = "UPDATE users SET is_active = 0 WHERE id = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param("i", $user_id);

error_log("Attempting to delete account for user_id: $user_id");

if ($update_stmt->execute()) {
    // Also delete all reports submitted by this user
    $cancel_reports_sql = "UPDATE hazard_reports SET status = 'deleted' WHERE user_id = ?";
    $cancel_stmt = $conn->prepare($cancel_reports_sql);
    $cancel_stmt->bind_param("i", $user_id);
    $cancel_stmt->execute();
    error_log("Deleted reports for user_id: $user_id");

    // Get user details for notification
    $userQuery = "SELECT fullname, email, role FROM users WHERE id = ?";
    $userStmt = $conn->prepare($userQuery);
    $userStmt->bind_param("i", $user_id);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    $userData = $userResult->fetch_assoc();
    $userStmt->close();

    $userFullname = $userData['fullname'] ?? 'Unknown';
    $userEmail = $userData['email'] ?? 'Unknown';
    $userRole = $userData['role'] ?? 'resident';

    // Determine user type for notification message
    $userType = in_array($userRole, ['inspector', 'bfp_personnel']) ? 'BFP personnel' : 'resident';

    // Create notifications for all admin, inspector, and bfp users
    $adminQuery = "SELECT id FROM users WHERE role IN ('admin', 'inspector', 'bfp_personnel') AND (is_active = 1 OR role = 'admin')";
    $adminResult = $conn->query($adminQuery);
    error_log("Admin query result: " . ($adminResult ? $adminResult->num_rows : 'null') . " rows");

    if ($adminResult && $adminResult->num_rows > 0) {
        $notifyStmt = $conn->prepare("INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)");
        $title = "User Account Deleted";
        $body = "A $userType has deleted their account: $userFullname ($userEmail).";

        while ($admin = $adminResult->fetch_assoc()) {
            $notifyStmt->bind_param("iss", $admin['id'], $title, $body);
            $notifyStmt->execute();
        }
        $notifyStmt->close();

        // Send push notifications to admins, inspectors, and bfp users with push tokens
        include 'push_helper.php';
        $pushQuery = "SELECT push_token FROM users WHERE role IN ('admin', 'inspector', 'bfp_personnel') AND is_active = 1 AND push_token IS NOT NULL";
        $pushResult = $conn->query($pushQuery);
        if ($pushResult && $pushResult->num_rows > 0) {
            while ($admin = $pushResult->fetch_assoc()) {
                send_push_notification($admin['push_token'], $title, $body);
            }
        }
    }

    error_log("Account deletion successful for user_id: $user_id");
    // Return success with logout flag
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Your account has been successfully deleted and deactivated. You will be logged out.', 'logout_required' => true]);
} else {
    error_log("Account deletion failed for user_id: $user_id. Error: " . $update_stmt->error);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete account']);
}
?>
