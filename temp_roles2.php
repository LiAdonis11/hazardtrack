<?php
include 'api/db.php';
$result = $conn->query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
while($row = $result->fetch_assoc()) {
    echo $row['role'] . ': ' . $row['count'] . PHP_EOL;
}
$conn->close();
?>
