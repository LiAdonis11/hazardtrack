<?php
// Script to add phone column to hazard_reports table
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2');

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "Starting database modification...\n\n";

// Step 1: Add phone column to hazard_reports table
echo "Step 1: Adding phone column to hazard_reports table...\n";
$sql1 = "ALTER TABLE `hazard_reports` ADD `phone` VARCHAR(30) NULL DEFAULT NULL AFTER `longitude`";

if ($conn->query($sql1) === TRUE) {
    echo "✓ Phone column added successfully\n";
} else {
    echo "✗ Error adding column: " . $conn->error . "\n";
}

$conn->close();

echo "\n✅ Database modification completed!\n";
?>
