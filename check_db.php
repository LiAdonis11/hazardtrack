<?php
include 'api/db.php';
$result = $conn->query('SHOW TABLES LIKE "status_history"');
if ($result->num_rows > 0) {
    echo 'status_history table exists';
} else {
    echo 'status_history table does not exist';
}
$result2 = $conn->query('SHOW COLUMNS FROM hazard_reports LIKE "admin_notes"');
if ($result2->num_rows > 0) {
    echo ' and admin_notes column exists';
} else {
    echo ' but admin_notes column does not exist';
}
?>
