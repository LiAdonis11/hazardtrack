<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
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

    if (!$input || !isset($input['photo_note'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid request data']);
        exit;
    }

    $photoNote = $input['photo_note'];

    // Validate required fields
    if (!isset($photoNote['reportId']) || !isset($photoNote['type']) || !isset($photoNote['content'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit;
    }

    // Validate report exists and user has access
    $conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
        exit;
    }

    // Check if report exists
    $stmt = $conn->prepare("SELECT id FROM hazard_reports WHERE id = ?");
    $stmt->bind_param("i", $photoNote['reportId']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Report not found']);
        exit;
    }

    // Insert photo/note
    $stmt = $conn->prepare("
        INSERT INTO photo_notes (id, report_id, type, content, location_lat, location_lng, file_name, file_size, mime_type, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $locationLat = isset($photoNote['location']) ? $photoNote['location']['latitude'] : null;
    $locationLng = isset($photoNote['location']) ? $photoNote['location']['longitude'] : null;
    $fileName = isset($photoNote['metadata']) ? $photoNote['metadata']['fileName'] : null;
    $fileSize = isset($photoNote['metadata']) ? $photoNote['metadata']['fileSize'] : null;
    $mimeType = isset($photoNote['metadata']) ? $photoNote['metadata']['mimeType'] : null;

    $stmt->bind_param(
        "sissddsssi",
        $photoNote['id'],
        $photoNote['reportId'],
        $photoNote['type'],
        $photoNote['content'],
        $locationLat,
        $locationLng,
        $fileName,
        $fileSize,
        $mimeType,
        $user['user_id']
    );

    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Photo/note added successfully',
            'photo_note_id' => $photoNote['id']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save photo/note']);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
