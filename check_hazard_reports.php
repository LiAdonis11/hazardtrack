<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "Data in hazard_reports table:\n";
$result = $conn->query('SELECT id, user_id, title, description FROM hazard_reports LIMIT 10');
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ', User ID: ' . $row['user_id'] . ', Title: ' . $row['title'] . ', Description: ' . substr($row['description'], 0, 50) . "...\n";
}

echo "\nReports for user ID 4:\n";
$result = $conn->query('SELECT id, user_id, title FROM hazard_reports WHERE user_id = 4');
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ', User ID: ' . $row['user_id'] . ', Title: ' . $row['title'] . "\n";
}

$conn->close();
?>
