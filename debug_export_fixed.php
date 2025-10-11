<?php
require_once 'api/db.php';

try {
    $type = 'reports';
    $range = '7d';
    $format = 'csv';

    // Calculate date range
    $dateCondition = "";
    switch ($range) {
        case '7d':
            $dateCondition = "AND hr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            break;
    }

    $query = "SELECT hr.*, u.fullname as user_fullname, c.name as category_name
             FROM hazard_reports hr
             LEFT JOIN users u ON hr.user_id = u.id
             LEFT JOIN categories c ON hr.category_id = c.id
             WHERE 1=1 $dateCondition
             ORDER BY hr.created_at DESC";

    echo "Query: $query\n";

    $result = $conn->query($query);
    if (!$result) {
        echo "Query failed: " . $conn->error . "\n";
        exit;
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo "Found " . count($data) . " records\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
