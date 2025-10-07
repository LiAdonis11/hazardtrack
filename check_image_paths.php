<?php
require_once 'api/db.php';

echo "=== Checking Image Paths in Hazard Reports ===\n\n";

$result = $conn->query('SELECT id, title, image_path FROM hazard_reports WHERE image_path IS NOT NULL LIMIT 5');
if ($result->num_rows > 0) {
    echo "Reports with image_path:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- ID: {$row['id']}, Title: {$row['title']}, Image Path: {$row['image_path']}\n";
    }
} else {
    echo "No reports have image_path set\n";
}

echo "\n=== Checking Recent Reports ===\n";
$result = $conn->query('SELECT id, title, image_path, created_at FROM hazard_reports ORDER BY created_at DESC LIMIT 5');
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $hasImage = $row['image_path'] ? 'YES' : 'NO';
        echo "- ID: {$row['id']}, Title: {$row['title']}, Has Image: {$hasImage}, Created: {$row['created_at']}\n";
    }
} else {
    echo "No recent reports found\n";
}
?>
