<?php
require_once 'api/db.php';

try {
    $range = '30d';

    // Calculate date range
    $dateCondition = "";
    switch ($range) {
        case '30d':
            $dateCondition = "AND hr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            break;
    }

    echo "Testing analytics export...\n";

    // Get analytics data
    $analyticsData = [
        'totalReports' => 0,
        'resolvedReports' => 0,
        'avgResponseTime' => 0,
        'reportsByBarangay' => [],
        'reportsByHazardType' => []
    ];

    $analyticsDateCondition = str_replace('hr.', '', $dateCondition); // Remove table prefix for simple queries
    echo "Analytics date condition: $analyticsDateCondition\n";

    $result = $conn->query("SELECT COUNT(*) as count FROM hazard_reports WHERE 1=1 $analyticsDateCondition");
    if (!$result) {
        echo "Total reports query failed: " . $conn->error . "\n";
        exit;
    }
    $analyticsData['totalReports'] = $result->fetch_assoc()['count'];
    echo "Total reports: " . $analyticsData['totalReports'] . "\n";

    $result = $conn->query("SELECT COUNT(*) as count FROM hazard_reports WHERE status = 'resolved' $analyticsDateCondition");
    if (!$result) {
        echo "Resolved reports query failed: " . $conn->error . "\n";
        exit;
    }
    $analyticsData['resolvedReports'] = $result->fetch_assoc()['count'];
    echo "Resolved reports: " . $analyticsData['resolvedReports'] . "\n";

    // Get reports by barangay
    $result = $conn->query("SELECT barangay, COUNT(*) as count FROM hazard_reports WHERE 1=1 $analyticsDateCondition GROUP BY barangay ORDER BY count DESC");
    if (!$result) {
        echo "Barangay query failed: " . $conn->error . "\n";
        exit;
    }
    while ($row = $result->fetch_assoc()) {
        $analyticsData['reportsByBarangay'][] = $row;
    }
    echo "Barangay data: " . count($analyticsData['reportsByBarangay']) . " records\n";

    // Get reports by hazard type
    $result = $conn->query("SELECT category_id, COUNT(*) as count FROM hazard_reports WHERE 1=1 $analyticsDateCondition GROUP BY category_id ORDER BY count DESC");
    if (!$result) {
        echo "Hazard type query failed: " . $conn->error . "\n";
        exit;
    }
    while ($row = $result->fetch_assoc()) {
        $analyticsData['reportsByHazardType'][] = $row;
    }
    echo "Hazard type data: " . count($analyticsData['reportsByHazardType']) . " records\n";

    echo "Analytics data prepared successfully\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
