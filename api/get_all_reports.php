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

// Authentication check for admin access
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
$token = getBearerTokenFromHeader();

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

// Get filter parameters from query string
$assigned_to_me = isset($_GET['assigned_to_me']) && $_GET['assigned_to_me'] === 'true';
$user_id = $payload['user_id']; // Use 'user_id' from JWT payload

// Fetch reports from the database with user, category, and inspector assignment information
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
            hr.admin_notes,
            hr.assigned_inspector_id,
            hr.location_address,
            hr.latitude,
            hr.longitude,
            hr.image_path,
            u.fullname as user_fullname,
            u.email as user_email,
            c.name as category_name,
            MAX(a.assigned_to) as inspector_id,
            MAX(a.priority) as assignment_priority,
            MAX(a.notes) as assignment_notes,
            MAX(a.assigned_at) as assigned_at,
            MAX(iu.fullname) as inspector_fullname,
            MAX(iu.email) as inspector_email,
            0 as is_unsure
        FROM hazard_reports hr
        LEFT JOIN users u ON hr.user_id = u.id
        LEFT JOIN categories c ON hr.category_id = c.id
        LEFT JOIN assignments a ON hr.id = a.report_id
        LEFT JOIN users iu ON a.assigned_to = iu.id
    ";

    // Add filter for assigned to me if requested
    if ($assigned_to_me) {
        $query .= " WHERE hr.id IN (SELECT report_id FROM assignments WHERE assigned_to = ? AND status != 'cancelled')";
    }

    $query .= " GROUP BY hr.id ORDER BY hr.created_at DESC";

    $stmt = $conn->prepare($query);

    if ($assigned_to_me) {
        $stmt->bind_param("i", $user_id);
    }

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
