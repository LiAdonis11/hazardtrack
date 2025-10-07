<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Get hazard categories
    $categoriesResult = $conn->query("SELECT * FROM hazard_categories ORDER BY name");
    $hazardCategories = [];
    while ($row = $categoriesResult->fetch_assoc()) {
        $hazardCategories[] = $row;
    }

    // Get priority levels
    $priorityResult = $conn->query("SELECT * FROM priority_levels ORDER BY level ASC");
    $priorityLevels = [];
    while ($row = $priorityResult->fetch_assoc()) {
        $priorityLevels[] = $row;
    }

    // Get notification rules
    $notificationResult = $conn->query("SELECT * FROM notification_rules ORDER BY id");
    $notificationRules = [];
    while ($row = $notificationResult->fetch_assoc()) {
        $row['recipients'] = json_decode($row['recipients'], true) ?? [];
        $notificationRules[] = $row;
    }

    // Get system limits
    $systemLimits = [
        'maxFileSize' => 10,
        'maxPhotosPerReport' => 5,
        'sessionTimeout' => 60
    ];

    echo json_encode([
        'status' => 'success',
        'data' => [
            'hazardCategories' => $hazardCategories,
            'priorityLevels' => $priorityLevels,
            'notificationRules' => $notificationRules,
            'systemLimits' => $systemLimits
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
