<?php
echo "=== Testing MySQL Connection ===\n\n";

// Test 1: Try to connect without specifying database
echo "1. Testing basic MySQL connection...\n";
try {
    $conn = new mysqli('localhost', 'root', '');
    if ($conn->connect_error) {
        echo "✗ Basic connection failed: " . $conn->connect_error . "\n";
    } else {
        echo "✓ Basic connection successful\n";

        // Test 2: List available databases
        echo "\n2. Available databases:\n";
        $result = $conn->query('SHOW DATABASES');
        while ($row = $result->fetch_row()) {
            echo "  - {$row[0]}\n";
        }

        // Test 3: Check if our database exists
        echo "\n3. Checking for hazardtrack_dbv2 database...\n";
        $result = $conn->query("SHOW DATABASES LIKE 'hazardtrack_dbv2'");
        if ($result->num_rows > 0) {
            echo "✓ hazardtrack_dbv2 database exists\n";

            // Test 4: Try to connect to the specific database
            echo "\n4. Testing connection to hazardtrack_dbv2...\n";
            $conn->select_db('hazardtrack_dbv2');
            echo "✓ Successfully connected to hazardtrack_dbv2\n";

            // Test 5: Check tables in the database
            echo "\n5. Tables in hazardtrack_dbv2:\n";
            $result = $conn->query('SHOW TABLES');
            while ($row = $result->fetch_row()) {
                echo "  - {$row[0]}\n";
            }

        } else {
            echo "✗ hazardtrack_dbv2 database does not exist\n";
            echo "Creating hazardtrack_dbv2 database...\n";

            if ($conn->query('CREATE DATABASE hazardtrack_dbv2')) {
                echo "✓ hazardtrack_dbv2 database created successfully\n";
            } else {
                echo "✗ Failed to create database: " . $conn->error . "\n";
            }
        }

        $conn->close();
    }
} catch (Exception $e) {
    echo "✗ Exception occurred: " . $e->getMessage() . "\n";
}

echo "\n=== Connection Test Complete ===\n";
?>
