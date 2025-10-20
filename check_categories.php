<?php
include 'api/db.php';

$result = $conn->query('SELECT id, name FROM categories');
echo "Categories:\n";
while($row = $result->fetch_assoc()) {
    echo $row['id'] . ': ' . $row['name'] . PHP_EOL;
}
?>
