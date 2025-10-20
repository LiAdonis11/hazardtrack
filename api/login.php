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
    'http://192.168.43.*',          // Wildcard for the whole subnet (if supported)
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
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
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

// Read JSON body
$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$role = trim($data['role'] ?? ''); // Optional role parameter

// Log incoming request data
error_log("Login attempt - Email: $email, Role: '$role'");

// Validation
$errors = [];
if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}
if (empty($password)) {
    $errors[] = 'Password is required';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => implode(', ', $errors)]);
    exit();
}

// Build SQL query based on role parameter
if (!empty($role)) {
    // If role is specified, check for that specific role
    if (!in_array($role, ['resident', 'admin', 'inspector', 'bfp_personnel'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid role']);
        exit();
    }
    $sql = "SELECT id, fullname, email, password, role, phone, address, is_active FROM users WHERE email = ? AND role = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $role);
} else {
    // If no role specified, check for any user
    $sql = "SELECT id, fullname, email, password, role, phone, address, is_active FROM users WHERE email = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
}

$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    error_log("Login failed - User not found for email: $email, role: '$role'");
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    exit();
}

// Check if account is deactivated
if ($user['is_active'] == 0) {
    error_log("Login failed - Account deactivated for user: {$user['email']} (ID: {$user['id']})");
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Your account has been deactivated. Please contact support if you believe this is an error.']);
    exit();
}

// Verify password
if (!password_verify($password, $user['password'])) {
    error_log("Login failed - Password verification failed for user: {$user['email']} (ID: {$user['id']})");
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    exit();
}

// Generate JWT token
$token = generateJWT($user['id'], $user['email'], $user['role'], $user['fullname']);
error_log("Generated token: " . $token); // Log the token for debugging

// Prepare response
$response = [
    'status' => 'success',
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'fullname' => $user['fullname'],
        'email' => $user['email'],
        'role' => $user['role'],
        'phone' => $user['phone'],
        'address' => $user['address']
    ]
];

error_log("Response being sent: " . json_encode($response)); // Log the response before sending
http_response_code(200);
echo json_encode($response);
?>
