<?php
include 'api/db.php';

$result = $conn->query('SELECT * FROM status_history LIMIT 5');
echo "status_history data:\n";
while($row = $result->fetch_assoc()) {
    print_r($row);
    echo PHP_EOL;
}
?>
