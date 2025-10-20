<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$result = $conn->query('SELECT id, user_id, title FROM hazard_reports WHERE user_id = 4 LIMIT 5');
echo "Reports for user ID 4:\n";
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ', Title: ' . $row['title'] . "\n";
}

$conn->close();
?>
