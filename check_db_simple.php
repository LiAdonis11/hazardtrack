<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "Connected successfully\n";
$result = $conn->query('SHOW TABLES');
while ($row = $result->fetch_row()) {
    echo $row[0] . "\n";
}
$conn->close();
?>
