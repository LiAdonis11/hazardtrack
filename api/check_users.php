<?php
include 'db.php';

$result = $conn->query('SELECT id, email, role FROM users LIMIT 5');
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ', Email: ' . $row['email'] . ', Role: ' . $row['role'] . PHP_EOL;
}
?>
