<?php
include 'db.php';
include 'jwt_helper.php';

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
error_log("=== GET REPORTS REQUEST ===");
error_log("Incoming request headers: " . json_encode(getallheaders()));
error_log("Incoming POST data: " . json_encode($_POST));
error_log("Incoming GET data: " . json_encode($_GET));

// Get JWT token from request
$token = null;
if (isset($_POST['token']) && !empty($_POST['token'])) {
    $token = $_POST['token'];
    error_log("Token found in POST data");
} elseif (isset($_GET['token']) && !empty($_GET['token'])) {
    $token = $_GET['token'];
    error_log("Token found in GET data");
} else {
    $token = getBearerTokenFromHeader();
    error_log("Token from Authorization header");
}

error_log("Extracted token: " . ($token ?? 'null'));

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

try {
    // Get reports for the authenticated user
    $stmt = $conn->prepare("
        SELECT
            hr.id,
            hr.report_number,
            hr.title,
            hr.description,
            hr.location_address,
            hr.latitude,
            hr.longitude,
            hr.status,
            hr.priority,
            hr.created_at,
            hr.updated_at,
            hr.admin_notes,
            ra.file_path as image,
            c.name as category_name,
            c.color as category_color,
            iu.fullname as inspector_name,
            a.notes as notes
        FROM hazard_reports hr
        LEFT JOIN categories c ON hr.category_id = c.id
        LEFT JOIN report_attachments ra ON hr.id = ra.report_id AND ra.is_primary = 1
        LEFT JOIN assignments a ON hr.id = a.report_id
        LEFT JOIN users iu ON a.assigned_to = iu.id
        WHERE hr.user_id = ?
        ORDER BY hr.created_at DESC
    ");
    
    $stmt->bind_param("i", $payload['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reports = [];
    while ($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }

    echo json_encode(['status' => 'success', 'reports' => $reports]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch reports: ' . $e->getMessage()]);
}
?>
