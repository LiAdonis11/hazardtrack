<?php
// Script to add image column to hazard_reports table
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2');

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo "Starting database modification...\n\n";

// Step 1: Add image columns to hazard_reports table
echo "Step 1: Adding image columns to hazard_reports table...\n";
$sql1 = "ALTER TABLE hazard_reports
         ADD COLUMN image_path VARCHAR(500) NULL AFTER description,
         ADD COLUMN image_name VARCHAR(255) NULL AFTER image_path,
         ADD COLUMN image_size INT NULL AFTER image_name,
         ADD COLUMN image_mime_type VARCHAR(100) NULL AFTER image_size";

if ($conn->query($sql1) === TRUE) {
    echo "✓ Image columns added successfully\n";
} else {
    echo "✗ Error adding columns: " . $conn->error . "\n";
}

// Step 2: Add index for better performance
echo "\nStep 2: Adding index for image_path...\n";
$sql2 = "ALTER TABLE hazard_reports ADD INDEX idx_image_path (image_path)";

if ($conn->query($sql2) === TRUE) {
    echo "✓ Index added successfully\n";
} else {
    echo "✗ Error adding index: " . $conn->error . "\n";
}

// Step 3: Copy existing image data from reports table
echo "\nStep 3: Copying existing image data from reports table...\n";
$sql3 = "UPDATE hazard_reports hr
         LEFT JOIN reports r ON hr.id = r.id
         SET hr.image_path = r.photo_path
         WHERE hr.image_path IS NULL AND r.photo_path IS NOT NULL";

if ($conn->query($sql3) === TRUE) {
    $affected_rows = $conn->affected_rows;
    echo "✓ Copied image data for $affected_rows reports\n";
} else {
    echo "✗ Error copying data: " . $conn->error . "\n";
}

// Step 4: Verify the changes
echo "\nStep 4: Verifying changes...\n";
$result = $conn->query("DESCRIBE hazard_reports");
echo "Updated hazard_reports table structure:\n";
while ($row = $result->fetch_assoc()) {
    if (strpos($row['Field'], 'image') !== false) {
        echo "- {$row['Field']}: {$row['Type']} ({$row['Null']})\n";
    }
}

// Check how many reports now have images
$result = $conn->query("SELECT COUNT(*) as count FROM hazard_reports WHERE image_path IS NOT NULL AND image_path != ''");
$row = $result->fetch_assoc();
echo "\nReports with images: {$row['count']}\n";

$conn->close();

echo "\n✅ Database modification completed!\n";
echo "You can now use the image_path column in hazard_reports table.\n";
?>
