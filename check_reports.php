<?php
require_once 'api/db.php';

echo "=== Checking Hazard Reports ===\n\n";

$result = $conn->query('SELECT id, report_number, user_id, title FROM hazard_reports LIMIT 10');
if ($result->num_rows > 0) {
    echo "Found reports:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- ID: {$row['id']}, Number: {$row['report_number']}, User: {$row['user_id']}, Title: {$row['title']}\n";
    }
} else {
    echo "No reports found in hazard_reports table\n";
}

echo "\n=== Checking if report ID 1 exists ===\n";
$result = $conn->query('SELECT * FROM hazard_reports WHERE id = 1');
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo "Report 1 found:\n";
    echo "- ID: {$row['id']}, User: {$row['user_id']}, Title: {$row['title']}\n";
} else {
    echo "Report ID 1 not found in hazard_reports table\n";
}
?>
