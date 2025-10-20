<?php
require_once 'api/db.php';

try {
    $auditDateCondition = "AND al.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
    $query = "SELECT al.id, u.fullname AS user, al.action, al.details, al.ip_address, al.created_at
              FROM audit_logs al
              LEFT JOIN users u ON al.user_id = u.id
              WHERE 1=1 $auditDateCondition
              ORDER BY al.created_at DESC";

    echo "Query: $query\n";

    $result = $conn->query($query);
    if (!$result) {
        echo "Error: " . $conn->error . "\n";
    } else {
        $count = 0;
        while ($row = $result->fetch_assoc()) {
            $count++;
            if ($count > 5) break; // limit output
            echo "Row: " . json_encode($row) . "\n";
        }
        echo "Total rows: $count\n";
    }

} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
