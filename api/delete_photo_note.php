<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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

    if (!$input || !isset($input['photo_note_id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Photo note ID is required']);
        exit;
    }

    $photoNoteId = $input['photo_note_id'];

    // Validate that the user owns this photo note
    $conn = new mysqli('localhost', 'root', '', 'hazardtrack_db', 3306);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
        exit;
    }

    // Check if photo note exists and user has access
    $stmt = $conn->prepare("
        SELECT pn.id, pn.report_id
        FROM photo_notes pn
        INNER JOIN hazard_reports r ON pn.report_id = r.id
        WHERE pn.id = ? AND r.user_id = ?
    ");
    $stmt->bind_param("si", $photoNoteId, $user['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Photo note not found or access denied']);
        exit;
    }

    // Delete the photo note
    $stmt = $conn->prepare("DELETE FROM photo_notes WHERE id = ?");
    $stmt->bind_param("s", $photoNoteId);

    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Photo note deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete photo note']);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
