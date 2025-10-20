<?php
include 'api/db.php';
$result = $conn->query('SELECT COUNT(*) as total FROM hazard_reports');
echo 'Total reports: ' . $result->fetch_assoc()['total'] . PHP_EOL;

// Check monthly trends
$query = "SELECT CONCAT(MONTHNAME(created_at), ' ', YEAR(created_at)) as label, COUNT(*) as count
    FROM hazard_reports
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY YEAR(created_at), MONTH(created_at)";
$result = $conn->query($query);
echo 'Monthly trends:' . PHP_EOL;
while ($row = $result->fetch_assoc()) {
    echo $row['label'] . ': ' . $row['count'] . PHP_EOL;
}
?>
