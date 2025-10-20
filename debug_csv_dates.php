<?php
require_once 'api/db.php';

$query = "SELECT r.id, r.title, r.description, r.status, r.priority,
                 c.name AS hazard_type, r.location_address AS barangay, u.fullname AS reporter,
                 r.created_at, r.updated_at
          FROM hazard_reports r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN categories c ON r.category_id = c.id
          WHERE 1=1 AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY r.created_at DESC LIMIT 5";

$result = $conn->query($query);
if (!$result) {
    die("Query failed: " . $conn->error);
}

echo "Raw data from database:\n";
echo "======================\n\n";

while ($row = $result->fetch_assoc()) {
    echo "ID: " . $row['id'] . "\n";
    echo "Title: " . $row['title'] . "\n";
    echo "Created At: '" . $row['created_at'] . "'\n";
    echo "Updated At: '" . $row['updated_at'] . "'\n";
    echo "---\n";
}

echo "\nTesting key mapping:\n";
echo "===================\n";

$headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Hazard Type', 'Barangay', 'Reporter', 'Created At', 'Updated At'];

$result->data_seek(0); // Reset result pointer
$row = $result->fetch_assoc();

foreach ($headers as $header) {
    $key = strtolower(str_replace(' ', '_', $header));
    $value = isset($row[$key]) ? $row[$key] : 'NOT_FOUND';
    echo "Header: '$header' -> Key: '$key' -> Value: '$value'\n";
}
?>
