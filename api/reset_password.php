<?php
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

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$reset_code = $data['reset_code'] ?? '';
$new_password = $data['new_password'] ?? '';

$errors = [];
if (empty($email)) $errors[] = 'Email is required';
if (empty($reset_code)) $errors[] = 'Reset code is required';
if (empty($new_password)) $errors[] = 'New password is required';
elseif (strlen($new_password) < 6) $errors[] = 'New password must be at least 6 characters long';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => implode(', ', $errors)]);
    exit();
}

// Get user with valid reset token
$sql = "SELECT id, reset_token, reset_expires FROM users WHERE email = ? AND is_active = 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !$user['reset_token'] || !$user['reset_expires']) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired reset code']);
    exit();
}

// Check if code has expired
$now = new DateTime();
$expires = new DateTime($user['reset_expires']);
if ($now > $expires) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Reset code has expired']);
    exit();
}

// Verify the reset code
if (!password_verify($reset_code, $user['reset_token'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid reset code']);
    exit();
}

// Hash new password
$new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

// Update password and clear reset token
$update_sql = "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param("si", $new_password_hash, $user['id']);

if ($update_stmt->execute()) {
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Password reset successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to reset password']);
}
?>
