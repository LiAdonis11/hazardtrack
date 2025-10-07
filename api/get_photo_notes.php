<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1); // Enabled for debugging

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'jwt_helper.php';

try {
    error_log("get_photo_notes.php: Script started");

    $token = getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Authorization token required']);
        exit;
    }
    $user = validateJWT($token);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
        exit;
    }

    error_log("get_photo_notes.php: User authenticated: " . json_encode($user));

    // Get report_id from query parameter
    $reportId = isset($_GET['report_id']) ? (int)$_GET['report_id'] : null;

    if (!$reportId) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Report ID is required']);
        exit;
    }

    error_log("get_photo_notes.php: Fetching notes for report ID: " . $reportId);

    // Validate that the user has access to this report
    $conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    error_log("get_photo_notes.php: Database connected");

    // Check if report exists and user has access
    $accessGranted = false;
    if ($user['role'] === 'admin' || $user['role'] === 'inspector') {
        $stmt = $conn->prepare("SELECT id FROM hazard_reports WHERE id = ?");
        if (!$stmt) throw new Exception("Prepare failed: (" . $conn->errno . ") " . $conn->error);
        $stmt->bind_param("i", $reportId);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $accessGranted = true;
        }
    } else {
        $stmt = $conn->prepare("SELECT id FROM hazard_reports WHERE id = ? AND user_id = ?");
        if (!$stmt) throw new Exception("Prepare failed: (" . $conn->errno . ") " . $conn->error);
        $stmt->bind_param("ii", $reportId, $user['user_id']);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $accessGranted = true;
        }
    }

    if (!$accessGranted) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Report not found or access denied']);
        exit;
    }

    error_log("get_photo_notes.php: Access granted");

    // Get photo notes for the report (from photo_notes table)
    $stmt = $conn->prepare("
        SELECT id, report_id, type, content, timestamp
        FROM photo_notes
        WHERE report_id = ?
        ORDER BY timestamp DESC
    ");
    if (!$stmt) throw new Exception("Prepare failed: (" . $conn->errno . ") " . $conn->error);
    $stmt->bind_param("i", $reportId);
    $stmt->execute();
    $result = $stmt->get_result();

    error_log("get_photo_notes.php: Fetched from photo_notes table");

    $photoNotes = [];
    while ($row = $result->fetch_assoc()) {
        $photoNotes[] = [
            'id' => 'note_' . $row['id'],
            'reportId' => $row['report_id'],
            'type' => $row['type'],
            'content' => $row['content'],
            'timestamp' => $row['timestamp']
        ];
    }

    // Get report attachments (initial report images)
    $stmt = $conn->prepare("
        SELECT CONCAT('attachment_', id) as id, report_id, 'photo' as type, file_path as content, created_at as timestamp, file_name, mime_type
        FROM report_attachments
        WHERE report_id = ?
        ORDER BY created_at DESC
    ");
    if (!$stmt) throw new Exception("Prepare failed: (" . $conn->errno . ") " . $conn->error);
    $stmt->bind_param("i", $reportId);
    $stmt->execute();
    $result = $stmt->get_result();

    error_log("get_photo_notes.php: Fetched from report_attachments table");

    while ($row = $result->fetch_assoc()) {
        $photoNotes[] = [
            'id' => $row['id'],
            'reportId' => $row['report_id'],
            'type' => $row['type'],
            'content' => $row['content'],
            'timestamp' => $row['timestamp'],
            'file_name' => $row['file_name'],
            'mime_type' => $row['mime_type']
        ];
    }

    // Sort all photo notes by timestamp (most recent first)
    usort($photoNotes, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });

    error_log("get_photo_notes.php: Sorted photo notes");

    echo json_encode([
        'status' => 'success',
        'photo_notes' => $photoNotes
    ]);

    $stmt->close();
    $conn->close();

    error_log("get_photo_notes.php: Script finished successfully");

} catch (Exception $e) {
    http_response_code(500);
    error_log("Error in get_photo_notes.php: " . $e->getMessage()); // Log error instead of displaying
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred on the server.', 'details' => $e->getMessage()]);
}
?>