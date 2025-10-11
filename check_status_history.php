<?php
include 'api/db.php';

$result = $conn->query('DESCRIBE status_history');
echo "status_history table structure:\n";
while($row = $result->fetch_assoc()) {
    echo $row['Field'] . ': ' . $row['Type'] . ' ' . $row['Null'] . PHP_EOL;
}
?>
