<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$result = $conn->query('DESCRIBE users');
echo 'Users table structure:\n';
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . ' (' . $row['Type'] . ') - ' . ($row['Null'] == 'NO' ? 'NOT NULL' : 'NULL') . '\n';
}

echo '\nSample users:\n';
$result = $conn->query('SELECT id, fullname, email, role FROM users LIMIT 5');
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ', Name: ' . $row['fullname'] . ', Email: ' . $row['email'] . ', Role: ' . $row['role'] . '\n';
}

$conn->close();
?>
