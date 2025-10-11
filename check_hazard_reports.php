<?php
include 'api/db.php';

$result = $conn->query('DESCRIBE hazard_reports');
echo "hazard_reports table structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "  {$row['Field']}: {$row['Type']} {$row['Null']} {$row['Key']} {$row['Default']} {$row['Extra']}\n";
}

// Check a sample report
echo "\nSample report data:\n";
$result = $conn->query('SELECT id, report_number, image_path FROM hazard_reports WHERE image_path IS NOT NULL LIMIT 5');
while ($row = $result->fetch_assoc()) {
    echo "  ID: {$row['id']}, Report: {$row['report_number']}, Image: {$row['image_path']}\n";
    if (file_exists($row['image_path'])) {
        echo "    EXISTS on disk\n";
    } else {
        echo "    NOT FOUND on disk\n";
    }
}
?>
