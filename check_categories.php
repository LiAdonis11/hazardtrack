<?php
require_once 'api/db.php';

$result = $conn->query('SELECT id, name FROM categories WHERE is_active = 1');
echo 'Available categories:\n';
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ', Name: ' . $row['name'] . '\n';
}

$conn->close();
?>
