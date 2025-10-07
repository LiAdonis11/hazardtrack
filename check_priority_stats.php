<?php
include 'api/db.php';

$result = $conn->query('SELECT COUNT(*) as total, COUNT(priority) as with_priority, COUNT(CASE WHEN priority IS NULL OR priority = "" THEN 1 END) as null_empty FROM hazard_reports');
$row = $result->fetch_assoc();

echo "Priority Statistics:\n";
echo "==================\n";
echo "Total reports: " . $row['total'] . "\n";
echo "Reports with priority: " . $row['with_priority'] . "\n";
echo "Reports with null/empty priority: " . $row['null_empty'] . "\n";

$conn->close();
?>
