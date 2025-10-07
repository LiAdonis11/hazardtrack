<?php
require_once 'api/db.php';

echo "=== Checking Report Attachments ===\n\n";

$result = $conn->query('SELECT * FROM report_attachments WHERE report_id = 1');
if ($result->num_rows > 0) {
    echo "Found attachments for report 1:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- ID: {$row['id']}, File: {$row['file_name']}, Path: {$row['file_path']}\n";
    }
} else {
    echo "No attachments found for report 1\n";
}

echo "\n=== Checking All Report Attachments ===\n";
$result = $conn->query('SELECT ra.*, hr.title FROM report_attachments ra JOIN hazard_reports hr ON ra.report_id = hr.id LIMIT 5');
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "- Report: {$row['title']}, File: {$row['file_name']}\n";
    }
} else {
    echo "No attachments found in database\n";
}
?>
