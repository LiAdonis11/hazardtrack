<?php
include 'api/db.php';

$result = $conn->query("SHOW TABLES LIKE 'notifications'");
if ($result->num_rows > 0) {
    echo "notifications table exists\n";
} else {
    echo "notifications table does not exist\n";
}
?>
