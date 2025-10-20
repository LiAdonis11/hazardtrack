<?php
include 'api/db.php';
$stmt = $conn->prepare('SELECT id FROM users WHERE id = 33');
$stmt->execute();
$result = $stmt->get_result();
echo 'User 33 exists: ' . ($result->num_rows > 0 ? 'yes' : 'no') . "\n";
$conn->close();
?>
