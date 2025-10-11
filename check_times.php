<?php
include 'api/db.php';
$query = "SELECT hr.id, hr.created_at, sh.created_at as in_progress_at, TIMESTAMPDIFF(HOUR, hr.created_at, sh.created_at) as diff
FROM hazard_reports hr
JOIN status_history sh ON hr.id = sh.report_id
WHERE sh.new_status = 'in_progress'
AND sh.id = (SELECT MIN(id) FROM status_history WHERE report_id = hr.id AND new_status = 'in_progress')";
$result = $conn->query($query);
while($row = $result->fetch_assoc()) {
    echo $row['id'] . ': ' . $row['created_at'] . ' -> ' . $row['in_progress_at'] . ' = ' . $row['diff'] . 'h' . PHP_EOL;
}
?>
