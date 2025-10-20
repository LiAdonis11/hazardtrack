<?php
// Simulate the API call
include 'api/db.php';

// Mock payload
$payload = [
    'user_id' => 33,
    'fullname' => 'First Admin',
    'email' => 'firstadmin@example.com',
    'role' => 'admin'
];

echo "Mock Payload: " . json_encode($payload) . "\n";

// Simulate input
$input = [
    'report_id' => 177,
    'status' => 'in_progress',
    'admin_notes' => 'Test note'
];

$report_id = $input['report_id'];
$new_status = $input['status'];
$admin_notes = $input['admin_notes'];

echo "Updating report $report_id to $new_status with notes: $admin_notes\n";

try {
    // Get current status
    $stmt_get_old = $conn->prepare("SELECT status FROM hazard_reports WHERE id = ?");
    $stmt_get_old->bind_param("i", $report_id);
    $stmt_get_old->execute();
    $old_status_res = $stmt_get_old->get_result();
    $old_status_row = $old_status_res->fetch_assoc();
    $old_status = $old_status_row ? $old_status_row['status'] : null;
    $stmt_get_old->close();

    echo "Old status: $old_status\n";

    // Update
    $sql_update = "
        UPDATE hazard_reports
        SET status = ?,
            admin_notes = CONCAT(IFNULL(admin_notes, ''), IF(admin_notes IS NOT NULL AND admin_notes != '', CHAR(10), ''), ?),
            updated_at = NOW()
        WHERE id = ?
    ";
    $stmt = $conn->prepare($sql_update);
    $stmt->bind_param("ssi", $new_status, $admin_notes, $report_id);
    $stmt->execute();

    echo "Affected rows: " . $stmt->affected_rows . "\n";

    if ($stmt->affected_rows > 0) {
        $stmt->close();

        // Get updated
        $stmt_get_updated = $conn->prepare("SELECT admin_notes FROM hazard_reports WHERE id = ?");
        $stmt_get_updated->bind_param("i", $report_id);
        $stmt_get_updated->execute();
        $updated_res = $stmt_get_updated->get_result();
        $updated_row = $updated_res->fetch_assoc();
        $updated_admin_notes = $updated_row ? $updated_row['admin_notes'] : null;
        $stmt_get_updated->close();

        echo "Updated admin_notes: $updated_admin_notes\n";

        // Log
        $log_stmt = $conn->prepare("
            INSERT INTO status_history (report_id, old_status, new_status, changed_by, change_note, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");

        $changed_by = isset($payload['user_id']) ? (int)$payload['user_id'] : null;
        echo "Changed by: $changed_by\n";

        if ($changed_by) {
            $stmt_check_user = $conn->prepare("SELECT id FROM users WHERE id = ?");
            $stmt_check_user->bind_param("i", $changed_by);
            $stmt_check_user->execute();
            $user_exists = $stmt_check_user->get_result()->num_rows > 0;
            $stmt_check_user->close();

            if (!$user_exists) {
                $changed_by = null;
            }
        }

        $log_stmt->bind_param("issis", $report_id, $old_status, $new_status, $changed_by, $admin_notes);
        $log_stmt->execute();
        $log_stmt->close();

        echo "Logged successfully\n";

        // Push notification part
        include 'api/push_helper.php';
        $stmt_get_user = $conn->prepare("SELECT u.push_token, hr.title, hr.user_id FROM hazard_reports hr JOIN users u ON hr.user_id = u.id WHERE hr.id = ?");
        $stmt_get_user->bind_param("i", $report_id);
        $stmt_get_user->execute();
        $reporter_user_id = null;
        $user_res = $stmt_get_user->get_result();
        if ($user_res && ($user_row = $user_res->fetch_assoc())) {
            $reporter_user_id = $user_row['user_id'];
            echo "Reporter user_id: $reporter_user_id\n";
            if (!empty($user_row['push_token'])) {
                $push_token = $user_row['push_token'];
                $report_title = $user_row['title'];
                echo "Sending push to $push_token for report $report_title\n";
                // send_push_notification($push_token, 'Report Status Updated', "The status of your report '$report_title' has been updated to '$new_status'.", ['report_id' => $report_id]);
            }
        }
        $stmt_get_user->close();

        // Notifications
        $notification_statuses = ['in_progress', 'verified', 'resolved'];
        if (in_array($new_status, $notification_statuses) && $reporter_user_id) {
            $msg = [
                'in_progress' => ['title' => 'Report Acknowledged', 'body' => 'Your report has been acknowledged by BFP.'],
                'verified' => ['title' => 'Inspector Dispatched', 'body' => 'An inspector has been dispatched to verify your report.'],
                'resolved' => ['title' => 'Report Resolved', 'body' => 'Your report has been resolved.']
            ][$new_status];
            $stmt_notify = $conn->prepare("INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)");
            $stmt_notify->bind_param("iss", $reporter_user_id, $msg['title'], $msg['body']);
            $stmt_notify->execute();
            $stmt_notify->close();
            echo "Inserted resident notification\n";
        }

        // BFP notifications
        $stmt_bfp = $conn->prepare("
            INSERT INTO notifications (user_id, title, body)
            SELECT id, ?, ? FROM users WHERE role IN ('admin', 'inspector')
        ");
        $bfp_title = 'Report Status Updated';
        $bfp_body = "Report #$report_id status changed to '$new_status' by " . ($payload['fullname'] ?? 'Admin');
        if (!empty($admin_notes)) {
            $bfp_body .= ". Notes: $admin_notes";
        }
        $stmt_bfp->bind_param("ss", $bfp_title, $bfp_body);
        $stmt_bfp->execute();
        $stmt_bfp->close();
        echo "Inserted BFP notifications\n";

        echo "Success\n";
    } else {
        echo "No rows affected\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
$conn->close();
?>
