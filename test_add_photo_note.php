<?php
// Test script to add a photo note to the first report
require_once 'api/jwt_helper.php';
require_once 'api/db.php';


// Get first report
$result = $conn->query('SELECT id FROM reports LIMIT 1');
if ($result->num_rows == 0) {
    die('No reports found');
}

$report = $result->fetch_assoc();
$reportId = $report['id'];

echo "Adding test photo note to report ID: $reportId\n";

// Create test photo note data
$photoNote = array(
    'id' => 'test_photo_' . time(),
    'reportId' => $reportId,
    'type' => 'photo',
    'content' => 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 pixel PNG base64
    'timestamp' => date('Y-m-d H:i:s'),
    'metadata' => array(
        'fileName' => 'test_photo.jpg',
        'fileSize' => 100,
        'mimeType' => 'image/jpeg'
    )
);

// Insert into database
$stmt = $conn->prepare("INSERT INTO photo_notes (id, report_id, type, content, timestamp, file_name, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param('sissssis',
    $photoNote['id'],
    $photoNote['reportId'],
    $photoNote['type'],
    $photoNote['content'],
    $photoNote['timestamp'],
    $photoNote['metadata']['fileName'],
    $photoNote['metadata']['fileSize'],
    $photoNote['metadata']['mimeType']
);

if ($stmt->execute()) {
    echo "Test photo note added successfully!\n";
} else {
    echo "Error adding photo note: " . $stmt->error . "\n";
}

// Also add a test text note
$noteId = 'test_note_' . time();
$noteContent = 'This is a test note for the photo notes feature.';

$stmt = $conn->prepare("INSERT INTO photo_notes (id, report_id, type, content, timestamp) VALUES (?, ?, 'note', ?, ?)");
$stmt->bind_param('siss', $noteId, $reportId, $noteContent, $photoNote['timestamp']);

if ($stmt->execute()) {
    echo "Test text note added successfully!\n";
} else {
    echo "Error adding text note: " . $stmt->error . "\n";
}

echo "\nTest data added. You can now refresh the app to see the photo notes.\n";

$conn->close();
?>
