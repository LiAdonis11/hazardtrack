<?php
// Create assignments table for BFP personnel assignments
include 'db.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create assignments table
$sql = "CREATE TABLE IF NOT EXISTS assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    assigned_to INT NOT NULL,
    assigned_by INT NOT NULL,
    team_type ENUM('fire_team', 'rescue_team', 'inspection_team') NOT NULL,
    status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'assigned',
    priority ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
    notes TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (report_id) REFERENCES hazard_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (report_id, assigned_to, team_type)
)";

if ($conn->query($sql) === TRUE) {
    echo "✅ Assignments table created successfully\n";
} else {
    echo "❌ Error creating assignments table: " . $conn->error . "\n";
}

// Create assignment_history table for tracking changes
$sql_history = "CREATE TABLE IF NOT EXISTS assignment_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    old_status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'cancelled'),
    new_status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'cancelled'),
    changed_by INT NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sql_history) === TRUE) {
    echo "✅ Assignment history table created successfully\n";
} else {
    echo "❌ Error creating assignment history table: " . $conn->error . "\n";
}

// Create inspector_availability table
$sql_availability = "CREATE TABLE IF NOT EXISTS inspector_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    team_type ENUM('fire_team', 'rescue_team', 'inspection_team') NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    current_assignments INT DEFAULT 0,
    max_assignments INT DEFAULT 5,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_team (user_id, team_type)
)";

if ($conn->query($sql_availability) === TRUE) {
    echo "✅ Inspector availability table created successfully\n";
} else {
    echo "❌ Error creating inspector availability table: " . $conn->error . "\n";
}

$conn->close();
echo "\n🎉 Database setup complete! Run this file to create the necessary tables for the assignment system.\n";
?>
