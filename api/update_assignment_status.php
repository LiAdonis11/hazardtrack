<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

    if (!$input || !isset($input['assignment_id']) || !isset($input['status'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields: assignment_id, status']);
        exit;
    }

    $assignmentId = $input['assignment_id'];
    $newStatus = $input['status'];
    $notes = isset($input['notes']) ? $input['notes'] : '';

    // Validate status
    $validStatuses = ['assigned', 'accepted', 'in_progress', 'completed', 'cancelled'];
    if (!in_array($newStatus, $validStatuses)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid status']);
        exit;
    }

    include 'db.php';
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
        exit;
    }

    // Get current assignment
    $stmt = $conn->prepare("
        SELECT a.*, r.status as report_status
        FROM assignments a
        JOIN hazard_reports r ON a.report_id = r.id
        WHERE a.id = ? AND a.assigned_to = ?
    ");
    $stmt->bind_param("ii", $assignmentId, $user['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Assignment not found or access denied']);
        exit;
    }

    $assignment = $result->fetch_assoc();
    $oldStatus = $assignment['status'];
    $reportId = $assignment['report_id'];
    $teamType = $assignment['team_type'];

    // Validate status transition
    $validTransitions = [
        'assigned' => ['accepted', 'cancelled'],
        'accepted' => ['in_progress', 'cancelled'],
        'in_progress' => ['completed', 'cancelled'],
        'completed' => [], // Terminal state
        'cancelled' => []  // Terminal state
    ];

    if (!in_array($newStatus, $validTransitions[$oldStatus])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Invalid status transition from $oldStatus to $newStatus"]);
        exit;
    }

    // Update assignment status
    $stmt = $conn->prepare("UPDATE assignments SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->bind_param("si", $newStatus, $assignmentId);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to update assignment status']);
        exit;
    }

    // Update completion timestamp if completed
    if ($newStatus === 'completed') {
        $stmt = $conn->prepare("UPDATE assignments SET completed_at = NOW() WHERE id = ?");
        $stmt->bind_param("i", $assignmentId);
        $stmt->execute();
    }

    // Update inspector availability
    if ($newStatus === 'completed' || $newStatus === 'cancelled') {
        $stmt = $conn->prepare("
            UPDATE inspector_availability
            SET current_assignments = GREATEST(0, current_assignments - 1)
            WHERE user_id = ? AND team_type = ?
        ");
        $stmt->bind_param("is", $user['user_id'], $teamType);
        $stmt->execute();
    }

    // Update report status based on assignment status
    $reportStatusMap = [
        'accepted' => 'in_progress',
        'in_progress' => 'in_progress',
        'completed' => 'resolved',
        'cancelled' => 'pending'
    ];

    if (isset($reportStatusMap[$newStatus])) {
        $stmt = $conn->prepare("UPDATE hazard_reports SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $reportStatusMap[$newStatus], $reportId);
        $stmt->execute();
    }

    // Log status change in history
    $stmt = $conn->prepare("
        INSERT INTO assignment_history (assignment_id, old_status, new_status, changed_by, change_reason)
        VALUES (?, ?, ?, ?, ?)
    ");
    $changeReason = $notes ?: "Status changed from $oldStatus to $newStatus";
    $stmt->bind_param("issis", $assignmentId, $oldStatus, $newStatus, $user['user_id'], $changeReason);
    $stmt->execute();

    echo json_encode([
        'status' => 'success',
        'message' => 'Assignment status updated successfully',
        'assignment' => [
            'id' => $assignmentId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'updated_at' => date('Y-m-d H:i:s')
        ]
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
