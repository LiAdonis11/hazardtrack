<?php
include 'api/db.php';
$query = "SELECT AVG(TIMESTAMPDIFF(HOUR, hr.created_at, sh.created_at)) as avg_time
FROM hazard_reports hr
JOIN status_history sh ON hr.id = sh.report_id
WHERE sh.new_status = 'in_progress'
AND sh.id = (SELECT MIN(id) FROM status_history WHERE report_id = hr.id AND new_status = 'in_progress')
AND hr.created_at >= '2024-01-01 00:00:00'";
$result = $conn->query($query);
$avgTime = $result->fetch_assoc()['avg_time'];
echo "Avg time: " . $avgTime . PHP_EOL;
?>
