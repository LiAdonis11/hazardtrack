<?php
include 'api/db.php';
$result = $conn->query('SELECT id, image_path FROM hazard_reports WHERE image_path IS NOT NULL AND image_path != "" LIMIT 5');
echo "Image paths in database:\n";
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ' - Image: ' . $row['image_path'] . "\n";
}
?>
