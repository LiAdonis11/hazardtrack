<?php
include 'api/db.php';

$result = $conn->query('DESCRIBE report_attachments');
echo "report_attachments table structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "  {$row['Field']}: {$row['Type']} {$row['Null']} {$row['Key']} {$row['Default']} {$row['Extra']}\n";
}

// Check some sample data
echo "\nSample report_attachments data:\n";
$result = $conn->query('SELECT * FROM report_attachments LIMIT 5');
while ($row = $result->fetch_assoc()) {
    echo "  ID: {$row['id']}, Report ID: {$row['report_id']}, File: {$row['file_name']}, Primary: {$row['is_primary']}\n";
}

// Check if there are any attachments for recent reports
echo "\nChecking attachments for recent reports:\n";
$result = $conn->query('
    SELECT hr.id, hr.report_number, ra.file_path, ra.is_primary
    FROM hazard_reports hr
    LEFT JOIN report_attachments ra ON hr.id = ra.report_id
    ORDER BY hr.id DESC LIMIT 10
');
while ($row = $result->fetch_assoc()) {
    $hasAttachment = $row['file_path'] ? 'YES' : 'NO';
    $isPrimary = $row['is_primary'] ? 'YES' : 'NO';
    echo "  Report {$row['report_number']} (ID: {$row['id']}): Attachment: $hasAttachment, Primary: $isPrimary, File: " . ($row['file_path'] ?: 'N/A') . "\n";
}
?>
