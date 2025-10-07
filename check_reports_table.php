<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "=== Reports Table Structure ===\n";
$result = $conn->query('DESCRIBE reports');
while ($row = $result->fetch_assoc()) {
    echo '- ' . $row['Field'] . ' (' . $row['Type'] . ')\n';
}

$result = $conn->query('SELECT COUNT(*) as count FROM reports');
$row = $result->fetch_assoc();
echo '\nTotal reports: ' . $row['count'] . '\n';

$result = $conn->query('SELECT id, user_id FROM reports LIMIT 3');
while ($row = $result->fetch_assoc()) {
    echo 'Report ID: ' . $row['id'] . ', User ID: ' . $row['user_id'] . '\n';
}

$conn->close();
?>
