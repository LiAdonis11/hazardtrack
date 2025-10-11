<?php
include 'api/db.php';
$result = $conn->query('SELECT id, created_at, updated_at, TIMESTAMPDIFF(HOUR, created_at, updated_at) as diff FROM hazard_reports WHERE status = "resolved"');
while($row = $result->fetch_assoc()) {
    echo $row['id'] . ': ' . $row['created_at'] . ' -> ' . $row['updated_at'] . ' = ' . $row['diff'] . 'h' . PHP_EOL;
}
?>
