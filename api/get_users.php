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

error_log("get_users.php - Incoming request headers: " . json_encode(getallheaders()));

// Get JWT token from request - use the same function as login_admin.php
$token = getBearerToken();

error_log("get_users.php - Extracted token: " . ($token ?? 'null'));

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

// Check if user has admin or bfp_personnel role
if ($payload['role'] !== 'admin' && $payload['role'] !== 'bfp_personnel') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Admin or BFP personnel access required']);
    exit();
}

// Get filter parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$status = isset($_GET['status']) ? $_GET['status'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';
$role = isset($_GET['role']) ? $_GET['role'] : 'all';

$offset = ($page - 1) * $limit;

// Build query - using is_active instead of status
$query = "SELECT u.id, u.fullname, u.email, u.phone, u.is_active, u.created_at, COUNT(hr.id) as reports_count FROM users u LEFT JOIN hazard_reports hr ON u.id = hr.user_id";
$where_parts = [];
$bind_types = "";
$bind_values = [];

if ($role !== 'all') {
    $where_parts[] = "u.role = ?";
    $bind_types .= "s";
    $bind_values[] = $role;
}

if ($status !== 'all') {
    if ($status === 'active') {
        $where_parts[] = "u.is_active = ?";
        $bind_types .= "i";
        $bind_values[] = 1;
    } elseif ($status === 'inactive') {
        $where_parts[] = "u.is_active = ?";
        $bind_types .= "i";
        $bind_values[] = 0;
    }
}

if (!empty($search)) {
    if ($role === 'resident') {
        $where_parts[] = "u.fullname LIKE ?";
        $bind_types .= "s";
        $bind_values[] = "%$search%";
    } else {
        $where_parts[] = "(u.fullname LIKE ? OR u.email LIKE ?)";
        $bind_types .= "ss";
        $bind_values[] = "%$search%";
        $bind_values[] = "%$search%";
    }
}

if (!empty($where_parts)) {
    $query .= " WHERE " . implode(' AND ', $where_parts);
}

$query .= " GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
$bind_types .= "ii";
$bind_values[] = $limit;
$bind_values[] = $offset;

// Get total count
$countQuery = "SELECT COUNT(*) as total FROM users u";
$count_bind_types = $bind_types;
$count_bind_values = $bind_values;
if (!empty($where_parts)) {
    $countQuery .= " WHERE " . implode(' AND ', $where_parts);
    // Remove the LIMIT and OFFSET bindings for count query
    $count_bind_types = substr($bind_types, 0, -2);
    $count_bind_values = array_slice($bind_values, 0, -2);
}

try {
    // Get total
    if (!empty($count_bind_values)) {
        $countStmt = $conn->prepare($countQuery);
        $countStmt->bind_param($count_bind_types, ...$count_bind_values);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $total = $countResult->fetch_assoc()['total'];
        $countStmt->close();
    } else {
        $countResult = $conn->query($countQuery);
        $total = $countResult->fetch_assoc()['total'];
    }

    // Get users
    $stmt = $conn->prepare($query);
    $stmt->bind_param($bind_types, ...$bind_values);
    $stmt->execute();
    $result = $stmt->get_result();
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    $stmt->close();

    echo json_encode(['status' => 'success', 'users' => $users, 'total' => $total]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch users: ' . $e->getMessage()]);
}
?>
