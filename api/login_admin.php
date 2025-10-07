<?php
include 'cors_fix.php'; // Add this line to include CORS fix
include 'jwt_helper_extended.php';
include 'db.php';


error_log("Origin header received: " . ($_SERVER['HTTP_ORIGIN'] ?? 'none'));

// List of allowed origins
$allowed_origins = [
    'http://localhost:5173',        // Vite dev server (web admin)
    'http://127.0.0.1:5173',        // Vite dev server (web admin) with IP
    'http://localhost:5174',        // Vite dev server alternative port
    'http://127.0.0.1:5174',        // Vite dev server alternative port with IP
    'http://localhost:5175',        // Added current Vite dev server port
    'http://localhost:5175/',       // With trailing slash
    'http://127.0.0.1:5175',        // Added current Vite dev server port with IP
    'http://127.0.0.1:5175/',       // With trailing slash
    'http://localhost:8081',        // React Native web/Expo web
    'http://192.168.254.183:8081',  // IP access for web
    'exp://192.168.254.183:8081',   // Expo mobile app
    'http://192.168.254.183',       // Direct IP access
    // Add your production domains here when ready
    'https://yourproductiondomain.com',
];


error_log("Origin header received: " . ($_SERVER['HTTP_ORIGIN'] ?? 'none'));
error_log("All headers: " . json_encode(getallheaders()));

// Get the origin from the request
$origin = rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/');
error_log("Processed origin: " . $origin);


// Check if the origin is in the allowed list
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Vary: Origin");
} elseif (!empty($origin) && (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false)) {
    // Allow localhost origins for development
    header("Access-Control-Allow-Origin: " . $origin);
    header("Vary: Origin");
} elseif (empty($origin)) {
    // Allow requests without Origin header (for development or same-origin)
    header("Access-Control-Allow-Origin: *");
} else {
    // Reject other origins
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Origin not allowed']);
    exit();
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

// Real DB login for admins and bfp_personnel
$sql = "SELECT id, fullname, email, password, role, phone, address FROM users WHERE email = ? AND role IN ('admin', 'bfp_personnel') AND is_active = 1 LIMIT 1";
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
