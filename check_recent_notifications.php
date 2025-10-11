<?php
include 'api/db.php';

$result = $conn->query("SELECT n.*, u.fullname, u.role FROM notifications n JOIN users u ON n.user_id = u.id ORDER BY n.created_at DESC LIMIT 10");

if ($result->num_rows > 0) {
    echo "Recent notifications:\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: {$row['id']}, User: {$row['fullname']} ({$row['role']}), Title: {$row['title']}, Read: {$row['is_read']}, Time: {$row['created_at']}\n";
        echo "Body: {$row['body']}\n\n";
    }
} else {
    echo "No notifications found.\n";
}
?>
