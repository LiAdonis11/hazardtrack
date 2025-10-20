<?php
include 'api/db.php';

try {
    // Create status_history table if it doesn't exist
    $sql = "
        CREATE TABLE IF NOT EXISTS status_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            report_id INT NOT NULL,
            old_status VARCHAR(50),
            new_status VARCHAR(50) NOT NULL,
            changed_by INT NOT NULL,
            change_note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (report_id) REFERENCES hazard_reports(id) ON DELETE CASCADE,
            FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if ($conn->query($sql) === TRUE) {
        echo "✅ status_history table created successfully\n";
    } else {
        echo "❌ Error creating status_history table: " . $conn->error . "\n";
    }

    // Check if admin_notes column exists in hazard_reports table, if not add it
    $result = $conn->query("SHOW COLUMNS FROM hazard_reports LIKE 'admin_notes'");
    if ($result->num_rows == 0) {
        $alter_sql = "ALTER TABLE hazard_reports ADD COLUMN admin_notes TEXT AFTER status";
        if ($conn->query($alter_sql) === TRUE) {
            echo "✅ admin_notes column added to hazard_reports table\n";
        } else {
            echo "❌ Error adding admin_notes column: " . $conn->error . "\n";
        }
    } else {
        echo "✅ admin_notes column already exists in hazard_reports table\n";
    }

    echo "\n🎉 Database setup completed successfully!\n";

} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

$conn->close();
?>
