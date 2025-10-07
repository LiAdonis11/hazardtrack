<?php
echo "=== Detailed MySQL Connection Test ===\n\n";

// Test 1: Try connecting without database first
echo "1. Testing basic MySQL connection (no database)...\n";
try {
    $conn = new mysqli('localhost', 'root', '', '', 3307);
    if ($conn->connect_error) {
        echo "✗ Basic connection failed: " . $conn->connect_error . "\n";
        echo "Error code: " . $conn->connect_errno . "\n";
    } else {
        echo "✓ Basic connection successful\n";

        // Test 2: List databases
        echo "\n2. Available databases:\n";
        $result = $conn->query('SHOW DATABASES');
        if ($result) {
            while ($row = $result->fetch_row()) {
                echo "  - {$row[0]}\n";
            }
        } else {
            echo "✗ Failed to query databases: " . $conn->error . "\n";
        }

        // Test 3: Try to select the database
        echo "\n3. Testing database selection...\n";
        if ($conn->select_db('hazardtrack_dbv2')) {
            echo "✓ Successfully selected hazardtrack_dbv2 database\n";

            // Test 4: List tables
            echo "\n4. Tables in hazardtrack_dbv2:\n";
            $result = $conn->query('SHOW TABLES');
            if ($result) {
                while ($row = $result->fetch_row()) {
                    echo "  - {$row[0]}\n";
                }
            } else {
                echo "✗ Failed to query tables: " . $conn->error . "\n";
            }

            // Test 5: Check if photo_notes table exists
            echo "\n5. Checking photo_notes table...\n";
            $result = $conn->query("SHOW TABLES LIKE 'photo_notes'");
            if ($result->num_rows > 0) {
                echo "✓ photo_notes table exists\n";

                // Check table structure
                $result = $conn->query('DESCRIBE photo_notes');
                echo "Table structure:\n";
                while ($row = $result->fetch_assoc()) {
                    echo "  - {$row['Field']} ({$row['Type']})\n";
                }
            } else {
                echo "✗ photo_notes table does not exist\n";
                echo "Creating photo_notes table...\n";

                $createTableSQL = "
                    CREATE TABLE photo_notes (
                        id INT(11) AUTO_INCREMENT PRIMARY KEY,
                        report_id INT(11) NOT NULL,
                        type ENUM('photo', 'note') NOT NULL,
                        content TEXT NOT NULL,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
                    )
                ";

                if ($conn->query($createTableSQL)) {
                    echo "✓ photo_notes table created successfully\n";
                } else {
                    echo "✗ Failed to create table: " . $conn->error . "\n";
                }
            }

        } else {
            echo "✗ Failed to select hazardtrack_dbv2 database: " . $conn->error . "\n";
        }

        $conn->close();
    }
} catch (Exception $e) {
    echo "✗ Exception occurred: " . $e->getMessage() . "\n";
    echo "Exception code: " . $e->getCode() . "\n";
}

// Test 6: Try connecting with database directly
echo "\n6. Testing direct database connection...\n";
try {
    $conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
    if ($conn->connect_error) {
        echo "✗ Direct database connection failed: " . $conn->connect_error . "\n";
        echo "Error code: " . $conn->connect_errno . "\n";
    } else {
        echo "✓ Direct database connection successful\n";
        $conn->close();
    }
} catch (Exception $e) {
    echo "✗ Exception occurred: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>
