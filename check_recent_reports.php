<?php
include 'api/db.php';

echo "=== Recent Reports with Attachments ===\n\n";

// Get recent reports with attachments
$query = "
    SELECT
        hr.id,
        hr.report_number,
        hr.title,
        hr.user_id,
        hr.created_at,
        ra.file_name,
        ra.file_path,
        ra.mime_type,
        ra.file_size,
        ra.is_primary
    FROM hazard_reports hr
    LEFT JOIN report_attachments ra ON hr.id = ra.report_id
    WHERE hr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ORDER BY hr.created_at DESC
    LIMIT 10
";

$result = $conn->query($query);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "Report ID: {$row['id']}\n";
        echo "Report Number: {$row['report_number']}\n";
        echo "Title: {$row['title']}\n";
        echo "User ID: {$row['user_id']}\n";
        echo "Created: {$row['created_at']}\n";
        echo "File Name: " . ($row['file_name'] ?: 'No attachment') . "\n";
        echo "File Path: " . ($row['file_path'] ?: 'No attachment') . "\n";
        echo "Mime Type: " . ($row['mime_type'] ?: 'N/A') . "\n";
        echo "File Size: " . ($row['file_size'] ?: 'N/A') . "\n";
        echo "Is Primary: " . ($row['is_primary'] ?: 'N/A') . "\n";
        echo "----------------------------------------\n";
    }
} else {
    echo "No recent reports found.\n";
}

// Check if uploads directory exists and is writable
$upload_dir = 'uploads/';
echo "\n=== Upload Directory Check ===\n";
if (is_dir($upload_dir)) {
    echo "Uploads directory exists: {$upload_dir}\n";
    echo "Is writable: " . (is_writable($upload_dir) ? 'Yes' : 'No') . "\n";

    // List files in uploads directory
    $files = scandir($upload_dir);
    echo "Files in uploads directory:\n";
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            echo "  - {$file}\n";
        }
    }
} else {
    echo "Uploads directory does not exist: {$upload_dir}\n";
}
?>
