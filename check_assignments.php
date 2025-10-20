<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$result = $conn->query('SELECT COUNT(*) as count FROM assignments');
$row = $result->fetch_assoc();
echo 'Assignments count: ' . $row['count'] . "\n";

$result = $conn->query('SELECT COUNT(*) as count FROM hazard_reports');
$row = $result->fetch_assoc();
echo 'Reports count: ' . $row['count'] . "\n";

$conn->close();
?>
