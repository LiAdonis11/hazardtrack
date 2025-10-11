<?php
include 'api/db.php';
$result = $conn->query('SELECT status, COUNT(*) as count FROM hazard_reports GROUP BY status');
while($row = $result->fetch_assoc()) {
    echo $row['status'] . ': ' . $row['count'] . PHP_EOL;
}
?>
