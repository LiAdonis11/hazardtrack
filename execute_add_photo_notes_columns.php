<?php
// Script to add missing columns to photo_notes table
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2');

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "Starting database modification for photo_notes table...\n\n";

// Add missing columns
$columns = [
    'location_lat' => 'DECIMAL(10,8) NULL',
    'location_lng' => 'DECIMAL(11,8) NULL',
    'file_name' => 'VARCHAR(255) NULL',
    'file_size' => 'INT NULL',
    'mime_type' => 'VARCHAR(100) NULL',
    'created_by' => 'INT NULL'
];

foreach ($columns as $column => $type) {
    echo "Adding column $column...\n";
    $sql = "ALTER TABLE photo_notes ADD $column $type";
    if ($conn->query($sql) === TRUE) {
        echo "✓ Column $column added successfully\n";
    } else {
        echo "✗ Error adding $column: " . $conn->error . "\n";
    }
}

// Verify the changes
echo "\nVerifying changes...\n";
$result = $conn->query("DESCRIBE photo_notes");
echo "Updated photo_notes table structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "- {$row['Field']}: {$row['Type']} ({$row['Null']})\n";
}

$conn->close();

echo "\n✅ Database modification completed!\n";
?>
