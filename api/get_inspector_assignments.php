<?php
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

require_once 'jwt_helper.php';

try {
    // Get JWT token from header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Authorization token required']);
        exit;
    }

    $token = $matches[1];
    $user = validateJWT($token);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
        exit;
    }

    include 'db.php';
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
        exit;
    }

    // Get query parameters for filtering and sorting
    $status_filter = isset($_GET['status']) ? $_GET['status'] : null;
    $priority_filter = isset($_GET['priority']) ? $_GET['priority'] : null;
    $team_filter = isset($_GET['team_type']) ? $_GET['team_type'] : null;
    $sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'priority';
    $sort_order = isset($_GET['sort_order']) && strtoupper($_GET['sort_order']) === 'ASC' ? 'ASC' : 'DESC';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    // Build WHERE clause for filters
    $where_conditions = ["a.assigned_to = ?"];
    $params = [$user['id']];
    $param_types = "i";
    
    if ($status_filter) {
        $valid_statuses = ['assigned', 'accepted', 'in_progress', 'completed'];
        if (in_array(strtolower($status_filter), $valid_statuses)) {
            $where_conditions[] = "a.status = ?";
            $params[] = $status_filter;
            $param_types .= "s";
        }
    } else {
        $where_conditions[] = "a.status != 'cancelled'";
    }

    if ($priority_filter) {
        $valid_priorities = ['low', 'medium', 'high', 'emergency'];
        if (in_array(strtolower($priority_filter), $valid_priorities)) {
            $where_conditions[] = "a.priority = ?";
            $params[] = $priority_filter;
            $param_types .= "s";
        }
    }

    if ($team_filter) {
        $valid_teams = ['fire_team', 'rescue_team', 'inspection_team'];
        if (in_array(strtolower($team_filter), $valid_teams)) {
            $where_conditions[] = "a.team_type = ?";
            $params[] = $team_filter;
            $param_types .= "s";
        }
    }

    $where_clause = implode(" AND ", $where_conditions);

    // Build ORDER BY clause
    $order_by_clause = "";
    switch ($sort_by) {
        case 'assigned_at':
            $order_by_clause = "a.assigned_at $sort_order";
            break;
        case 'updated_at':
            $order_by_clause = "a.updated_at $sort_order";
            break;
        case 'priority':
        default:
            $order_by_clause = "CASE a.priority
                WHEN 'emergency' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END ASC, a.assigned_at DESC"; // Always sort by priority first, then by date
            break;
    }

    // Get assignments for current user (BFP personnel) with filters
    $stmt = $conn->prepare("
        SELECT
            a.id,
            a.report_id,
            a.team_type,
            a.status as assignment_status,
            a.priority,
            a.notes,
            a.assigned_at,
            a.updated_at,
            r.title,
            r.description,
            c.name as category_name,
            r.status as report_status,
            r.latitude,
            r.longitude,
            r.created_at as report_created_at,
            u.fullname as reporter_name,
            u.phone as reporter_phone,
            u.email as reporter_email,
            ab.fullname as assigned_by_name
        FROM assignments a
        JOIN hazard_reports r ON a.report_id = r.id
        JOIN categories c ON r.category_id = c.id
        JOIN users u ON r.user_id = u.id
        JOIN users ab ON a.assigned_by = ab.id
        WHERE $where_clause 
        ORDER BY $order_by_clause
        LIMIT ? OFFSET ?
    ");

    // Add limit and offset to params
    $params[] = $limit;
    $params[] = $offset;
    $param_types .= "ii";

    $stmt->bind_param($param_types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $assignments = [];
    while ($row = $result->fetch_assoc()) {
        $assignments[] = $row;
    }

    echo json_encode([
        'status' => 'success',
        'assignments' => $assignments
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>