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
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

    // Get request data
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['report_id']) || !isset($input['inspector_id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields: report_id, inspector_id']);
        exit;
    }

    $reportId = $input['report_id'];
    $assignedTo = $input['inspector_id'];
    $priority = isset($input['priority']) ? $input['priority'] : 'medium';
    $teamType = isset($input['team_type']) ? $input['team_type'] : 'inspection_team'; // Default team type
    $notes = isset($input['notes']) ? $input['notes'] : '';

    // Validate team type
    $validTeamTypes = ['fire_team', 'rescue_team', 'inspection_team'];
    if (!in_array($teamType, $validTeamTypes)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid team type']);
        exit;
    }

    // Validate priority
    $validPriorities = ['low', 'medium', 'high', 'emergency'];
    if (!in_array($priority, $validPriorities)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid priority level']);
        exit;
    }

    include 'db.php';
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
        exit;
    }

    // Check if report exists
    $stmt = $conn->prepare("SELECT id FROM hazard_reports WHERE id = ?");
    $stmt->bind_param("i", $reportId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Report not found']);
        exit;
    }

    // Validate that the assigned user is an inspector
    $stmt = $conn->prepare("SELECT id, fullname FROM users WHERE id = ? AND role = 'inspector'");
    $stmt->bind_param("i", $assignedTo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Inspector not found or user is not an inspector.']);
        exit;
    }

    $inspector = $result->fetch_assoc();

    // Check if assignment already exists
    $stmt = $conn->prepare("
        SELECT id FROM assignments
        WHERE report_id = ? AND assigned_to = ? AND team_type = ? AND status != 'cancelled'
    ");
    $stmt->bind_param("iis", $reportId, $assignedTo, $teamType);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Assignment already exists']);
        exit;
    }

    // Create assignment
    $stmt = $conn->prepare("
        INSERT INTO assignments (report_id, assigned_to, assigned_by, team_type, priority, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("iiisss", $reportId, $assignedTo, $user['id'], $teamType, $priority, $notes);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to create assignment']);
        exit;
    }

    $assignmentId = $conn->insert_id;

    // Update inspector availability
    $stmt = $conn->prepare("
        INSERT INTO inspector_availability (user_id, team_type, current_assignments)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE current_assignments = current_assignments + 1
    ");
    $stmt->bind_param("is", $assignedTo, $teamType);
    $stmt->execute();

    // Update report status based on team type
    $statusMap = [
        'fire_team' => 'in_progress',
        'rescue_team' => 'in_progress',
        'inspection_team' => 'pending_inspection'
    ];

    $stmt = $conn->prepare("UPDATE hazard_reports SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $statusMap[$teamType], $reportId);
    $stmt->execute();

    // Log assignment in history
    $stmt = $conn->prepare("
        INSERT INTO assignment_history (assignment_id, new_status, changed_by, change_reason)
        VALUES (?, 'assigned', ?, 'Initial assignment')
    ");
    $stmt->bind_param("ii", $assignmentId, $user['id']);
    $stmt->execute();

    echo json_encode([
        'status' => 'success',
        'message' => 'Report assigned successfully',
        'assignment' => [
            'id' => $assignmentId,
            'report_id' => $reportId,
            'assigned_to' => $assignedTo,
            'assigned_by' => $user['id'],
            'team_type' => $teamType,
            'priority' => $priority,
            'status' => 'assigned',
            'inspector_name' => $inspector['fullname']
        ]
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
