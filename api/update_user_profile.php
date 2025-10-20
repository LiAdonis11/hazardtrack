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

// Get JWT token from request
$token = getBearerToken();

if (!$token) {
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? null;
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

$user_id = $payload['user_id'];

// Read JSON body
$data = json_decode(file_get_contents('php://input'), true);

$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$address = trim($data['address'] ?? '');

// Validation
$errors = [];
if (empty($fullname)) {
    $errors[] = 'Full name is required';
}
if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}
if (empty($phone)) {
    $errors[] = 'Phone number is required';
}
if (empty($address)) {
    $errors[] = 'Address is required';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => implode(', ', $errors)]);
    exit();
}

// Check if email is already taken by another user
$sql = "SELECT id FROM users WHERE email = ? AND id != ? AND is_active = 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $email, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email is already taken by another user']);
    exit();
}

// Update user profile
$update_sql = "UPDATE users SET fullname = ?, email = ?, phone = ?, address = ? WHERE id = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param("ssssi", $fullname, $email, $phone, $address, $user_id);

if ($update_stmt->execute()) {
    // Get updated user data
    $select_sql = "SELECT id, fullname, email, phone, address, role, created_at FROM users WHERE id = ?";
    $select_stmt = $conn->prepare($select_sql);
    $select_stmt->bind_param("i", $user_id);
    $select_stmt->execute();
    $user_result = $select_stmt->get_result();
    $user = $user_result->fetch_assoc();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Profile updated successfully',
        'user' => $user
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to update profile']);
}
?>
