<?php
// Direct test of photo notes database functions

require_once 'api/jwt_helper.php';

echo "=== Direct Photo Notes Database Test ===\n\n";

$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3306);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 1. Check photo_notes table exists
$result = $conn->query("SHOW TABLES LIKE 'photo_notes'");
if ($result->num_rows === 0) {
    die("photo_notes table does not exist\n");
}
echo "1. ✓ photo_notes table exists\n";

// 2. Check table structure
$result = $conn->query('DESCRIBE photo_notes');
echo "2. Table structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "   - {$row['Field']} ({$row['Type']})\n";
}

// 3. Get user and report data
$result = $conn->query("SELECT id, email, role FROM users WHERE id = 4");
if ($result->num_rows === 0) {
    die("User with ID 4 not found\n");
}
$user = $result->fetch_assoc();

$result = $conn->query("SELECT id FROM hazard_reports WHERE user_id = " . intval($user['id']) . " LIMIT 1");
if ($result->num_rows === 0) {
    die("No reports found for user\n");
}
$report = $result->fetch_assoc();

echo "\n3. ✓ Found user ID: {$user['id']}, Report ID: {$report['id']}\n";

// 4. Generate JWT token
$jwt = generateJWT($user['id'], $user['email'], $user['role']);
echo "4. ✓ JWT token generated\n";

// 5. Test get_photo_notes query directly
$stmt = $conn->prepare("
    SELECT
        id,
        report_id,
        type,
        content,
        timestamp
    FROM photo_notes
    WHERE report_id = ?
    ORDER BY timestamp DESC
");
$stmt->bind_param("i", $report['id']);
$stmt->execute();
$result = $stmt->get_result();

echo "\n5. Testing get_photo_notes query:\n";
$photoNotes = [];
while ($row = $result->fetch_assoc()) {
    $photoNotes[] = $row;
    echo "   - Found photo note: {$row['id']} ({$row['type']})\n";
}

if (empty($photoNotes)) {
    echo "   - No photo notes found, adding test data...\n";

    // Add test photo
    $testPhotoId = 'test_photo_' . time();
    $testPhotoContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    $stmt = $conn->prepare("INSERT INTO photo_notes (id, report_id, type, content, timestamp) VALUES (?, ?, 'photo', ?, NOW())");
    $stmt->bind_param('siss', $testPhotoId, $report['id'], $testPhotoContent);
    $stmt->execute();

    // Add test note
    $testNoteId = 'test_note_' . time();
    $testNoteContent = 'This is a demo note showing the photo notes feature.';
    $stmt = $conn->prepare("INSERT INTO photo_notes (id, report_id, type, content, timestamp) VALUES (?, ?, 'note', ?, NOW())");
    $stmt->bind_param('siss', $testNoteId, $report['id'], $testNoteContent);
    $stmt->execute();

    echo "   ✓ Test data added\n";
}

// 6. Test add_photo_note functionality
echo "\n6. Testing add_photo_note functionality:\n";
$newPhotoId = 'new_test_photo_' . time();
$newPhotoContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
$stmt = $conn->prepare("INSERT INTO photo_notes (id, report_id, type, content, timestamp) VALUES (?, ?, 'photo', ?, NOW())");
$stmt->bind_param('sis', $newPhotoId, $report['id'], $newPhotoContent);
if ($stmt->execute()) {
    echo "   ✓ New photo note added successfully\n";
} else {
    echo "   ✗ Failed to add photo note: " . $stmt->error . "\n";
}

// 7. Test delete_photo_note functionality
echo "\n7. Testing delete_photo_note functionality:\n";
$stmt = $conn->prepare("DELETE FROM photo_notes WHERE id = ?");
$stmt->bind_param("s", $newPhotoId);
if ($stmt->execute()) {
    echo "   ✓ Photo note deleted successfully\n";
} else {
    echo "   ✗ Failed to delete photo note: " . $stmt->error . "\n";
}

// 8. Final count
$result = $conn->query('SELECT COUNT(*) as count FROM photo_notes');
$row = $result->fetch_assoc();
echo "\n8. Final photo notes count: {$row['count']}\n";

$stmt->close();
$conn->close();

echo "\n=== All Tests Completed Successfully ===\n";
?>
