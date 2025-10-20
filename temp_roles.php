<?php
include 'api/db.php';
$result = $conn->query('SELECT DISTINCT role FROM users');
while($row = $result->fetch_assoc()) {
    echo $row['role'] . PHP_EOL;
}
$conn->close();
?>
