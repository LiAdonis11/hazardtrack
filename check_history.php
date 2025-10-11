<?php
include 'api/db.php';
$result2 = $conn->query('SELECT new_status, COUNT(*) as count FROM status_history GROUP BY new_status');
while($row = $result2->fetch_assoc()) {
    echo $row['new_status'] . ': ' . $row['count'] . PHP_EOL;
}
?>
