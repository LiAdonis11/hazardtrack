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
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Authentication check for admin/inspector access
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

// Get JWT token from request
$token = null;
if (isset($_POST['token']) && !empty($_POST['token'])) {
    $token = $_POST['token'];
} elseif (isset($_GET['token']) && !empty($_GET['token'])) {
    $token = $_GET['token'];
} else {
    $token = getBearerTokenFromHeader();
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

// Check if user has admin or inspector role
if ($payload['role'] !== 'admin' && $payload['role'] !== 'inspector') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Admin or BFP personnel access required']);
    exit();
}

// Get location parameters
$lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$lng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;
$radius_km = isset($_GET['radius']) ? floatval($_GET['radius']) : 2.0; // Default 2km radius

if ($lat === null || $lng === null) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Latitude and longitude are required']);
    exit();
}

// Calculate bounding box for the radius (approximate)
// 1 degree latitude = 111.32 km
// 1 degree longitude = 111.32 * cos(lat) km
$lat_delta = $radius_km / 111.32;
$lng_delta = $radius_km / (111.32 * cos(deg2rad($lat)));

$min_lat = $lat - $lat_delta;
$max_lat = $lat + $lat_delta;
$min_lng = $lng - $lng_delta;
$max_lng = $lng + $lng_delta;

// Fetch nearby reports
try {
    $query = "
        SELECT
            hr.id,
            hr.title,
            hr.description,
            hr.status,
            hr.priority,
            hr.created_at,
            hr.updated_at,
            hr.location_address,
            hr.latitude,
            hr.longitude,
            hr.image_path,
            u.fullname as user_fullname,
            u.email as user_email,
            u.phone,
            c.name as category_name,
            -- Calculate distance using Haversine formula
            (6371 * acos(cos(radians(?)) * cos(radians(hr.latitude)) * cos(radians(hr.longitude) - radians(?)) + sin(radians(?)) * sin(radians(hr.latitude)))) AS distance_km
        FROM hazard_reports hr
        LEFT JOIN users u ON hr.user_id = u.id
        LEFT JOIN categories c ON hr.category_id = c.id
        WHERE hr.latitude BETWEEN ? AND ?
        AND hr.longitude BETWEEN ? AND ?
        AND hr.latitude IS NOT NULL
        AND hr.longitude IS NOT NULL
        AND hr.status != 'deleted'
        ORDER BY distance_km ASC
        LIMIT 20
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("ddddddd", $lat, $lng, $lat, $min_lat, $max_lat, $min_lng, $max_lng);
    $stmt->execute();
    $result = $stmt->get_result();

    $reports = [];
    while ($row = $result->fetch_assoc()) {
        // Only include reports within the exact radius
        if ($row['distance_km'] <= $radius_km) {
            $reports[] = $row;
        }
    }

    echo json_encode(['status' => 'success', 'reports' => $reports]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch nearby reports: ' . $e->getMessage()]);
}
?>
