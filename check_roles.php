<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$result = $conn->query('SELECT DISTINCT role FROM users');
echo "Distinct roles:\n";
while ($row = $result->fetch_assoc()) {
    echo $row['role'] . "\n";
}

$conn->close();
?>
