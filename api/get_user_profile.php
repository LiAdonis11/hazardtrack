<?php
include 'jwt_helper.php';
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
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

// Get JWT token from request
$token = getBearerToken();

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

// Get user basic info (allow inactive users to fetch their own profile for logout purposes)
$user_sql = "SELECT id, fullname, email, phone, address, created_at, is_active FROM users WHERE id = ?";
$user_stmt = $conn->prepare($user_sql);
$user_stmt->bind_param("i", $user_id);
$user_stmt->execute();
$user_result = $user_stmt->get_result();
$user = $user_result->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
    exit();
}

// If user is inactive, return an authentication error to trigger logout
if ($user['is_active'] == 0) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Account has been deactivated']);
    exit();
}

// Get total reports count
$total_reports_sql = "SELECT COUNT(*) as total FROM hazard_reports WHERE user_id = ?";
$total_stmt = $conn->prepare($total_reports_sql);
$total_stmt->bind_param("i", $user_id);
$total_stmt->execute();
$total_result = $total_stmt->get_result();
$total_reports = $total_result->fetch_assoc()['total'];

// Get resolved reports count
$resolved_reports_sql = "SELECT COUNT(*) as resolved FROM hazard_reports WHERE user_id = ? AND status = 'resolved'";
$resolved_stmt = $conn->prepare($resolved_reports_sql);
$resolved_stmt->bind_param("i", $user_id);
$resolved_stmt->execute();
$resolved_result = $resolved_stmt->get_result();
$resolved_reports = $resolved_result->fetch_assoc()['resolved'];

// Calculate safety score (0-5 scale based on resolved/total ratio)
$safety_score = 5.0; // Default perfect score
if ($total_reports > 0) {
    $resolution_rate = $resolved_reports / $total_reports;
    $safety_score = round($resolution_rate * 5.0, 1);
}

// Prepare response
$response = [
    'status' => 'success',
    'profile' => [
        'id' => $user['id'],
        'name' => $user['fullname'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'address' => $user['address'],
        'joinedDate' => $user['created_at'],
        'totalReports' => (int)$total_reports,
        'resolvedReports' => (int)$resolved_reports,
        'safetyScore' => (float)$safety_score,
        'emergencyContact' => null, // Not implemented yet
        'profileImage' => null, // Not implemented yet
    ]
];

http_response_code(200);
echo json_encode($response);
?>
