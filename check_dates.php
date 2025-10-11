<?php
include 'api/db.php';
$result = $conn->query('SELECT id, created_at, status FROM hazard_reports ORDER BY created_at DESC');
while($row = $result->fetch_assoc()) {
    echo $row['id'] . ': ' . $row['created_at'] . ' - ' . $row['status'] . PHP_EOL;
}
?>
