<?php
require_once 'api/db.php';

try {
    // Create hazard_categories table
    $sql = "CREATE TABLE IF NOT EXISTS hazard_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if ($conn->query($sql)) {
        echo "hazard_categories table created successfully\n";
    } else {
        echo "Error creating hazard_categories table: " . $conn->error . "\n";
    }

    // Create priority_levels table
    $sql = "CREATE TABLE IF NOT EXISTS priority_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        level INT NOT NULL,
        response_time INT NOT NULL COMMENT 'Response time in hours',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if ($conn->query($sql)) {
        echo "priority_levels table created successfully\n";
    } else {
        echo "Error creating priority_levels table: " . $conn->error . "\n";
    }

    // Create notification_rules table
    $sql = "CREATE TABLE IF NOT EXISTS notification_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trigger_event VARCHAR(100) NOT NULL,
        recipients JSON NOT NULL,
        message TEXT NOT NULL,
        active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    if ($conn->query($sql)) {
        echo "notification_rules table created successfully\n";
    } else {
        echo "Error creating notification_rules table: " . $conn->error . "\n";
    }

    // Insert default hazard categories
    $categories = [
        ['Fire', 'Fire-related incidents and emergencies', 1],
        ['Flood', 'Flooding and water-related hazards', 1],
        ['Earthquake', 'Earthquake and seismic activities', 1],
        ['Accident', 'Traffic accidents and collisions', 1],
        ['Other', 'Other types of hazards', 1]
    ];

    foreach ($categories as $category) {
        $stmt = $conn->prepare("INSERT IGNORE INTO hazard_categories (name, description, active) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $category[0], $category[1], $category[2]);
        $stmt->execute();
    }

    // Insert default priority levels
    $priorities = [
        ['emergency', 1, 1, 'Critical emergency requiring immediate response'],
        ['high', 2, 4, 'High priority incident requiring urgent attention'],
        ['medium', 3, 24, 'Medium priority incident requiring timely response'],
        ['low', 4, 72, 'Low priority incident for routine handling']
    ];

    foreach ($priorities as $priority) {
        $stmt = $conn->prepare("INSERT IGNORE INTO priority_levels (name, level, response_time, description) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("siis", $priority[0], $priority[1], $priority[2], $priority[3]);
        $stmt->execute();
    }

    // Insert default notification rules
    $notificationRules = [
        ['new_report', '["admin@example.com"]', 'New hazard report submitted', 1],
        ['emergency_report', '["admin@example.com", "bfp@example.com"]', 'Emergency report requires immediate attention', 1],
        ['overdue_report', '["admin@example.com"]', 'Report is overdue for response', 1]
    ];

    foreach ($notificationRules as $rule) {
        $stmt = $conn->prepare("INSERT IGNORE INTO notification_rules (trigger_event, recipients, message, active) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $rule[0], $rule[1], $rule[2], $rule[3]);
        $stmt->execute();
    }

    echo "Default data inserted successfully\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>
