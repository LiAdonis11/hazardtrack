<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "Structure of photo_notes table:\n";
$result = $conn->query('DESCRIBE photo_notes');
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . ' (' . $row['Type'] . ")\n";
}

$conn->close();
?>
