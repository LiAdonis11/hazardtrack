<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "Structure of photo_notes table:\n";
$result = $conn->query('DESCRIBE photo_notes');
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . ' (' . $row['Type'] . ")\n";
}

echo "\nData in photo_notes table:\n";
$result = $conn->query('SELECT * FROM photo_notes');
while ($row = $result->fetch_assoc()) {
    echo "ID: {$row['id']}, Report: {$row['report_id']}, Type: {$row['type']}, Content: {$row['content']}\n";
}

$conn->close();
?>
