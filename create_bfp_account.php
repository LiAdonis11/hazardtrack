<?php
require_once 'api/db.php';

// Set CORS headers
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

$data = json_decode(file_get_contents('php://input'), true);

// Default BFP personnel credentials
$fullname = isset($data['fullname']) ? $conn->real_escape_string($data['fullname']) : 'BFP Personnel';
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : 'bfp@bfp.com';
$password = isset($data['password']) ? $data['password'] : 'Bfp123';
$role = 'inspector';

// Validate password: same requirements as resident registration
$passwordErrors = [];
if (strlen($password) < 6) {
    $passwordErrors[] = 'At least 6 characters';
}
if (!preg_match('/[A-Z]/', $password)) {
    $passwordErrors[] = 'At least one uppercase letter';
}
if (!preg_match('/[a-z]/', $password)) {
    $passwordErrors[] = 'At least one lowercase letter';
}
if (!preg_match('/\d/', $password)) {
    $passwordErrors[] = 'At least one number';
}

if (!empty($passwordErrors)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password does not meet requirements: ' . implode(', ', $passwordErrors)]);
    exit();
}

// Check if email already exists
$checkSql = "SELECT id FROM users WHERE email = '$email'";
$result = $conn->query($checkSql);
if ($result && $result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'Email already registered']);
    exit();
}

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insertSql = "INSERT INTO users (fullname, email, password, role) VALUES ('$fullname', '$email', '$hashedPassword', '$role')";
if ($conn->query($insertSql) === TRUE) {
    echo json_encode(['status' => 'success', 'message' => 'BFP personnel account created successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to create BFP personnel account']);
}

$conn->close();
?>
