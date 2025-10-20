<?php
include 'api/db.php';
// Calculate date range
$now = new DateTime();
$startDate = $now->modify('-30 days')->format('Y-m-d H:i:s');
echo "Start date: " . $startDate . PHP_EOL;
$query = "SELECT AVG(TIMESTAMPDIFF(HOUR, hr.created_at, sh.created_at)) as avg_time
FROM hazard_reports hr
JOIN status_history sh ON hr.id = sh.report_id
WHERE sh.new_status = 'in_progress'
AND sh.id = (SELECT MIN(id) FROM status_history WHERE report_id = hr.id AND new_status = 'in_progress')
AND hr.created_at >= '$startDate'";
$result = $conn->query($query);
$avgTime = $result->fetch_assoc()['avg_time'];
echo "Avg time: " . $avgTime . PHP_EOL;
?>
