<?php
include 'api/db.php';

$result = $conn->query("SELECT id, image_path FROM hazard_reports WHERE image_path IS NOT NULL ORDER BY id DESC LIMIT 5");

echo "Recent reports with images:\n";
while($row = $result->fetch_assoc()) {
    echo $row['id'] . ': ' . $row['image_path'] . "\n";
    $file_path = $row['image_path'];
    if (file_exists($file_path)) {
        echo "  File exists: YES (" . filesize($file_path) . " bytes)\n";
    } else {
        echo "  File exists: NO\n";
    }
}
?>
