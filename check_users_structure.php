<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$result = $conn->query('DESCRIBE users');
echo "users structure:\n";
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . ' (' . $row['Type'] . ")\n";
}

$conn->close();
?>
