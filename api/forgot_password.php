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

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email is required']);
    exit();
}

// Check if user exists
$sql = "SELECT id FROM users WHERE email = ? AND is_active = 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    // For security, don't reveal if email exists or not
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'If the email exists, a reset code has been sent.']);
    exit();
}

// Generate reset code (6 digits)
$reset_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

// Hash the code for storage
$reset_token = password_hash($reset_code, PASSWORD_DEFAULT);

// Set expiry (1 hour from now)
$expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Update user with reset token
$update_sql = "UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param("ssi", $reset_token, $expires, $user['id']);

if ($update_stmt->execute()) {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Reset code generated successfully.',
        'reset_code' => $reset_code  // In production, this would be sent via email/SMS
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to generate reset code']);
}
?>
