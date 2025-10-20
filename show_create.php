<?php
include 'api/db.php';
$result = $conn->query('SHOW CREATE TABLE status_history');
$row = $result->fetch_assoc();
echo $row['Create Table'];
$conn->close();
?>
