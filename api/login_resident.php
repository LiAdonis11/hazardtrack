<?php
include 'jwt_helper_extended.php';
include 'db.php';

// List of allowed origins
$allowed_origins = [
    'http://localhost:5173',        // Vite dev server (web admin)
    'http://localhost:5174',
    'http://localhost:8081',        // React Native web/Expo web
    'http://192.168.254.183:8081',  // Expo local IP
    'exp://192.168.254.183:8081',   // Expo mobile app
    'http://192.168.254.183',
    'https://yourproductiondomain.com', // Production domain
    'http://192.168.43.1',          // Router gateway
    'http://192.168.43.6',          // Local machine IP
    'http://localhost',
];

// Get the request origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Allow CORS if origin is valid
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    // Mobile apps may not send an Origin header → allow all
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

// ✅ Query only active resident & BFP personnel accounts
$sql = "SELECT id, fullname, email, password, role, phone, address 
        FROM users 
        WHERE email = ? 
        AND role IN ('resident', 'bfp_personnel') 
        AND is_active = 1 
        LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    exit();
}

// Verify password
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    exit();
}

// Generate JWT token
$token = generateJWT($user['id'], $user['email'], $user['role']);

// ✅ Response with detected role
$response = [
    'status' => 'success',
    'token' => $token,
    'user' => [
        'id'       => $user['id'],
        'fullname' => $user['fullname'],
        'email'    => $user['email'],
        'role'     => $user['role'], // <-- resident OR bfp_personnel
        'phone'    => $user['phone'],
        'address'  => $user['address']
    ]
];

http_response_code(200);
echo json_encode($response);
?>
