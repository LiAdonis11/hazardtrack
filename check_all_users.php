<?php
require_once 'api/db.php';

$result = $conn->query('SELECT COUNT(*) as total FROM users');
$row = $result->fetch_assoc();
echo 'Total users: ' . $row['total'] . '\n\n';

$result = $conn->query('SELECT id, fullname, email, role, phone, address FROM users ORDER BY id');
echo 'All users:\n';
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ', Name: ' . $row['fullname'] . ', Email: ' . $row['email'] . ', Role: ' . $row['role'] . ', Phone: ' . ($row['phone'] ?: 'N/A') . ', Address: ' . ($row['address'] ?: 'N/A') . '\n';
}

$conn->close();
?>
