<?php
include 'api/db.php';

$result = $conn->query('SELECT id, email, role FROM users LIMIT 10');
echo "Users:\n";
while($row = $result->fetch_assoc()) {
    echo $row['id'] . ': ' . $row['email'] . ' (' . $row['role'] . ')' . PHP_EOL;
}
?>
