<?php
require_once 'api/db.php';

try {
    $dateCondition = "AND r.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

    $result = $conn->query("SELECT COUNT(*) AS count FROM hazard_reports WHERE 1=1 $dateCondition");
    if (!$result) {
        echo "Error: " . $conn->error . "\n";
    } else {
        $row = $result->fetch_assoc();
        echo "Count: " . $row['count'] . "\n";
    }

    $result = $conn->query("SELECT r.location_address AS barangay, COUNT(*) AS count FROM hazard_reports r WHERE 1=1 $dateCondition GROUP BY r.location_address ORDER BY count DESC");
    if (!$result) {
        echo "Error: " . $conn->error . "\n";
    } else {
        while ($row = $result->fetch_assoc()) {
            echo "Barangay: " . $row['barangay'] . " - Count: " . $row['count'] . "\n";
        }
    }

} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
