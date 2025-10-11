<?php
include 'api/db.php';

$query = "SELECT id, created_at FROM hazard_reports ORDER BY created_at DESC LIMIT 5";
$result = $conn->query($query);

echo 'Recent reports:' . PHP_EOL;
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ' - Created: ' . $row['created_at'] . PHP_EOL;
}

echo PHP_EOL . 'Current date: ' . date('Y-m-d H:i:s') . PHP_EOL;
?>
