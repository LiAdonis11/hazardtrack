<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "Tables in hazardtrack_dbv2:\n";
$result = $conn->query('SHOW TABLES');
while ($row = $result->fetch_row()) {
    echo $row[0] . "\n";
}

echo "\nStructure of hazard_reports table:\n";
$result = $conn->query('DESCRIBE hazard_reports');
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . ' (' . $row['Type'] . ")\n";
}

$conn->close();
?>
