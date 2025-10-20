<?php
include 'api/db.php';
$result = $conn->query('SELECT id, latitude, longitude, status FROM hazard_reports LIMIT 1');
if ($result) {
    $row = $result->fetch_assoc();
    echo 'Sample report: ' . json_encode($row) . PHP_EOL;
} else {
    echo 'No reports found' . PHP_EOL;
}
?>
