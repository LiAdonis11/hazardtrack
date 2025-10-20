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
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid JSON input'
        ]);
        exit;
    }

    $conn->begin_transaction();

    // Update hazard categories
    if (isset($input['hazardCategories'])) {
        foreach ($input['hazardCategories'] as $category) {
            if (isset($category['id'])) {
                // Update existing category
                $stmt = $conn->prepare("UPDATE hazard_categories SET name = ?, description = ?, active = ? WHERE id = ?");
                $stmt->bind_param("ssii", $category['name'], $category['description'], $category['active'], $category['id']);
                $stmt->execute();
            } else {
                // Insert new category
                $stmt = $conn->prepare("INSERT INTO hazard_categories (name, description, active) VALUES (?, ?, ?)");
                $stmt->bind_param("ssi", $category['name'], $category['description'], $category['active']);
                $stmt->execute();
            }
        }
    }

    // Update priority levels
    if (isset($input['priorityLevels'])) {
        foreach ($input['priorityLevels'] as $priority) {
            $stmt = $conn->prepare("UPDATE priority_levels SET response_time = ?, description = ? WHERE name = ?");
            $stmt->bind_param("iss", $priority['responseTime'], $priority['description'], $priority['name']);
            $stmt->execute();
        }
    }

    // Update notification rules
    if (isset($input['notificationRules'])) {
        foreach ($input['notificationRules'] as $rule) {
            $recipientsJson = json_encode($rule['recipients']);
            if (isset($rule['id'])) {
                // Update existing rule
                $stmt = $conn->prepare("UPDATE notification_rules SET trigger_event = ?, recipients = ?, message = ?, active = ? WHERE id = ?");
                $stmt->bind_param("sssii", $rule['trigger'], $recipientsJson, $rule['message'], $rule['active'], $rule['id']);
                $stmt->execute();
            } else {
                // Insert new rule
                $stmt = $conn->prepare("INSERT INTO notification_rules (trigger_event, recipients, message, active) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("sssi", $rule['trigger'], $recipientsJson, $rule['message'], $rule['active']);
                $stmt->execute();
            }
        }
    }

    // Update system limits (for now, just acknowledge the update)
    if (isset($input['systemLimits'])) {
        // In a real implementation, you might store these in a settings table
        // For now, we'll just acknowledge the update
    }

    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Settings updated successfully'
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
