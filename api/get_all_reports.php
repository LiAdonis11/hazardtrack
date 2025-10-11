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
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$assigned_to_me = isset($_GET['assigned_to_me']) && $_GET['assigned_to_me'] === 'true';
$status = isset($_GET['status']) ? $_GET['status'] : '';
$hazard_type = isset($_GET['hazard_type']) ? $_GET['hazard_type'] : '';
$barangay = isset($_GET['barangay']) ? $_GET['barangay'] : '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$user_id = $payload['user_id']; // Use 'user_id' from JWT payload

if ($id !== null) {
    $limit = 1;
    $offset = 0;
} else {
    $offset = ($page - 1) * $limit;
}

// Fetch reports from the database with user, category, and inspector assignment information
try {
    // Build WHERE conditions
    $where_conditions = [];
    $params = [];
    $types = '';

    // Exclude deleted reports
    $where_conditions[] = "hr.status != 'deleted'";

    if ($id !== null) {
        $where_conditions[] = "hr.id = ?";
        $params[] = $id;
        $types .= 'i';
    }

    if ($assigned_to_me) {
        $where_conditions[] = "hr.id IN (SELECT report_id FROM assignments WHERE assigned_to = ? AND status != 'cancelled')";
        $params[] = $user_id;
        $types .= 'i';
    }

    if (!empty($status)) {
        $where_conditions[] = "hr.status = ?";
        $params[] = $status;
        $types .= 's';
    }

    if (!empty($hazard_type)) {
        $where_conditions[] = "c.name = ?";
        $params[] = $hazard_type;
        $types .= 's';
    }

    if (!empty($barangay)) {
        $where_conditions[] = "hr.location_address LIKE ?";
        $params[] = '%' . $barangay . '%'; // Match barangay name anywhere in address
        $types .= 's';
    }

    $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

    // Count total
    $count_query = "
        SELECT COUNT(DISTINCT hr.id) as total
        FROM hazard_reports hr
        LEFT JOIN categories c ON hr.category_id = c.id
        LEFT JOIN assignments a ON hr.id = a.report_id
        $where_clause
    ";

    $count_stmt = $conn->prepare($count_query);
    if (!empty($params)) {
        $count_stmt->bind_param($types, ...$params);
    }
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $total = $count_result->fetch_assoc()['total'];
    $count_stmt->close();

    // Main query
    $query = "
        SELECT
            hr.id,
            hr.report_number,
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
            COALESCE(hr.phone, u.phone) as phone,
            u.fullname as user_fullname,
            u.email as user_email,
            c.name as category_name,
            MAX(a.assigned_to) as inspector_id,
            MAX(a.priority) as assignment_priority,
            MAX(a.notes) as assignment_notes,
            MAX(a.assigned_at) as assigned_at,
            MAX(iu.fullname) as inspector_fullname,
            MAX(iu.email) as inspector_email
        FROM hazard_reports hr
        LEFT JOIN users u ON hr.user_id = u.id
        LEFT JOIN categories c ON hr.category_id = c.id
        LEFT JOIN assignments a ON hr.id = a.report_id
        LEFT JOIN users iu ON a.assigned_to = iu.id
        $where_clause
        GROUP BY hr.id ORDER BY hr.created_at DESC
        LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($query);
    $all_params = array_merge($params, [$limit, $offset]);
    $all_types = $types . 'ii';
    $stmt->bind_param($all_types, ...$all_params);

    $stmt->execute();
    $result = $stmt->get_result();

    $reports = [];
    while ($row = $result->fetch_assoc()) {
        $reports[] = $row;
    }

    // Add base URL for image_path
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host . '/hazardTrackV2';
    foreach ($reports as &$r) {
      if (!empty($r['image_path']) && !str_starts_with($r['image_path'], 'http')) {
        $r['image_path'] = $baseUrl . '/' . $r['image_path'];
      }
    }

    echo json_encode([
        'status' => 'success',
        'reports' => $reports,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil($total / $limit)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch reports: ' . $e->getMessage()]);
}
?>
