<?php
include 'db.php';
include 'jwt_helper.php';

// Essential CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST/PUT
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

function getAuthorizationHeader(){
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        // normalize header keys (Authorization)
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function getBearerTokenFromHeader() {
    $headers = getAuthorizationHeader();
    if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
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

// Get updater's fullname from database
$user_id = $payload['user_id'];
$stmt_get_user = $conn->prepare("SELECT fullname FROM users WHERE id = ?");
$stmt_get_user->bind_param("i", $user_id);
$stmt_get_user->execute();
$user_res = $stmt_get_user->get_result();
$user_row = $user_res->fetch_assoc();
$updater_fullname = $user_row ? $user_row['fullname'] : 'Unknown';
$stmt_get_user->close();

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$report_id = $input['report_id'] ?? $_POST['report_id'] ?? null;
$new_status = $input['status'] ?? $_POST['status'] ?? null;
$admin_notes = $input['admin_notes'] ?? $_POST['admin_notes'] ?? null;

if (!$report_id || !$new_status) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Report ID and status are required']);
    exit();
}

// Validate status
$valid_statuses = ['pending', 'in_progress', 'verified', 'resolved', 'rejected', 'closed', 'verified_valid', 'verified_false', 'pending_inspection'];
if (!in_array($new_status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid status. Must be one of: ' . implode(', ', $valid_statuses)]);
    exit();
}

try {
    // --- Get current status before updating
    $stmt_get_old = $conn->prepare("SELECT status FROM hazard_reports WHERE id = ?");
    if (!$stmt_get_old) throw new Exception("Prepare failed: " . $conn->error);
    $stmt_get_old->bind_param("i", $report_id);
    $stmt_get_old->execute();
    $old_status_res = $stmt_get_old->get_result();
    $old_status_row = $old_status_res->fetch_assoc();
    $old_status = $old_status_row ? $old_status_row['status'] : null;
    $stmt_get_old->close();

    // --- Update report status and append admin notes
    // Note: use CHAR(10) for newline to avoid PHP string escaping quirks
    $sql_update = "
        UPDATE hazard_reports
        SET status = ?, 
            admin_notes = CONCAT(IFNULL(admin_notes, ''), IF(admin_notes IS NOT NULL AND admin_notes != '', CHAR(10), ''), ?),
            updated_at = NOW()
        WHERE id = ?
    ";
    $stmt = $conn->prepare($sql_update);
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
    $stmt->bind_param("ssi", $new_status, $admin_notes, $report_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $stmt->close();

        // Get updated admin_notes
        $stmt_get_updated = $conn->prepare("SELECT admin_notes FROM hazard_reports WHERE id = ?");
        if (!$stmt_get_updated) throw new Exception("Prepare failed: " . $conn->error);
        $stmt_get_updated->bind_param("i", $report_id);
        $stmt_get_updated->execute();
        $updated_res = $stmt_get_updated->get_result();
        $updated_row = $updated_res->fetch_assoc();
        $updated_admin_notes = $updated_row ? $updated_row['admin_notes'] : null;
        $stmt_get_updated->close();

        // Log the status change with notes
        $log_stmt = $conn->prepare("
            INSERT INTO status_history (report_id, old_status, new_status, changed_by, change_note, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        if (!$log_stmt) throw new Exception("Prepare failed: " . $conn->error);

        // Correct bind types: report_id (i), old_status (s), new_status (s), changed_by (i), change_note (s)
        $changed_by = isset($payload['user_id']) ? (int)$payload['user_id'] : null;

        // Check if user exists before logging
        if ($changed_by) {
            $stmt_check_user = $conn->prepare("SELECT id FROM users WHERE id = ?");
            $stmt_check_user->bind_param("i", $changed_by);
            $stmt_check_user->execute();
            $user_exists = $stmt_check_user->get_result()->num_rows > 0;
            $stmt_check_user->close();

            if (!$user_exists) {
                $changed_by = null; // Set to null if user doesn't exist
            }
        }

        $log_stmt->bind_param("issis", $report_id, $old_status, $new_status, $changed_by, $admin_notes);
        $log_stmt->execute();
        $log_stmt->close();

        // Get report title
        $stmt_get_title = $conn->prepare("SELECT title FROM hazard_reports WHERE id = ?");
        if (!$stmt_get_title) throw new Exception("Prepare failed: " . $conn->error);
        $stmt_get_title->bind_param("i", $report_id);
        $stmt_get_title->execute();
        $title_res = $stmt_get_title->get_result();
        $title_row = $title_res->fetch_assoc();
        $report_title = $title_row ? $title_row['title'] : 'Unknown Report';
        $stmt_get_title->close();

        // Send push notification to the user
        include 'push_helper.php';
        $stmt_get_user = $conn->prepare("SELECT u.push_token, hr.user_id FROM hazard_reports hr JOIN users u ON hr.user_id = u.id WHERE hr.id = ?");
        if (!$stmt_get_user) throw new Exception("Prepare failed: " . $conn->error);
        $stmt_get_user->bind_param("i", $report_id);
        $stmt_get_user->execute();
        $reporter_user_id = null;
        $user_res = $stmt_get_user->get_result();
        if ($user_res && ($user_row = $user_res->fetch_assoc())) {
            $reporter_user_id = $user_row['user_id'];
            if (!empty($user_row['push_token'])) {
                $push_token = $user_row['push_token'];
                $notification_title = 'Report Status Updated';
                $notification_body = "The status of your report '" . $report_title . "' has been updated to '" . $new_status . "'.";
                // send_push_notification implementation may vary
                send_push_notification($push_token, $notification_title, $notification_body, ['report_id' => $report_id]);
            }
        }
        $stmt_get_user->close();

        // Insert in-app notification for specific status changes to resident
        $notification_statuses = ['in_progress', 'verified', 'resolved'];
        if (in_array($new_status, $notification_statuses) && $reporter_user_id) {
            $notification_messages = [
                'in_progress' => ['title' => 'Report Acknowledged', 'body' => 'Your report has been acknowledged by BFP.'],
                'verified' => ['title' => 'Inspector Dispatched', 'body' => 'An inspector has been dispatched to verify your report.'],
                'resolved' => ['title' => 'Report Resolved', 'body' => 'Your report has been resolved.']
            ];
            $msg = $notification_messages[$new_status];
            $stmt_notify = $conn->prepare("INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)");
            if ($stmt_notify) {
                $stmt_notify->bind_param("iss", $reporter_user_id, $msg['title'], $msg['body']);
                $stmt_notify->execute();
                $stmt_notify->close();
            }
        }

        // Notify appropriate personnel about status change based on actor's role
        $bfp_notification_title = 'Report Status Updated';
        $role_display = isset($payload['role']) && $payload['role'] === 'inspector' ? 'Inspector' : 'Admin';
        $bfp_notification_body = "{$role_display} {$updater_fullname} updated '{$report_title}' status to '{$new_status}'";
        if (!empty($admin_notes)) {
            $bfp_notification_body .= ". Notes: {$admin_notes}";
        }

        // Determine recipients based on actor's role
        $recipient_role = '';
        if ($payload['role'] === 'admin') {
            $recipient_role = 'inspector';
        } elseif ($payload['role'] === 'inspector') {
            $recipient_role = 'admin';
        }

        if (!empty($recipient_role)) {
            $stmt_bfp = $conn->prepare("
                INSERT INTO notifications (user_id, title, body)
                SELECT id, ?, ? FROM users WHERE role = ? AND is_active = 1
            ");
            if ($stmt_bfp) {
                $stmt_bfp->bind_param("sss", $bfp_notification_title, $bfp_notification_body, $recipient_role);
                $stmt_bfp->execute();
                $stmt_bfp->close();
            }
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Report status updated successfully',
            'data' => [
                'report_id' => $report_id,
                'new_status' => $new_status,
                'admin_notes' => $updated_admin_notes,
                'updated_by' => $payload['user_id']
            ]
        ]);
    } else {
        // No rows affected
        $stmt->close();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Report not found or no changes made']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to update report status: ' . $e->getMessage()]);
}
?>
