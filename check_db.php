<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// Check if photo_notes table exists
$result = $conn->query('SHOW TABLES LIKE "photo_notes"');
if ($result->num_rows == 0) {
    echo 'photo_notes table does not exist. Creating it...\n';

    $createTable = "CREATE TABLE photo_notes (
        id VARCHAR(255) PRIMARY KEY,
        report_id INT NOT NULL,
        type ENUM('photo', 'note') NOT NULL,
        content LONGTEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        location_lat DECIMAL(10,8) NULL,
        location_lng DECIMAL(11,8) NULL,
        file_name VARCHAR(255) NULL,
        file_size INT NULL,
        mime_type VARCHAR(100) NULL,
        created_by INT NULL,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )";

    if ($conn->query($createTable)) {
        echo 'photo_notes table created successfully\n';
    } else {
        echo 'Error creating table: ' . $conn->error . '\n';
    }
} else {
    echo 'photo_notes table exists\n';

    // Check table structure
    $result = $conn->query('DESCRIBE photo_notes');
    echo 'Table structure:\n';
    while ($row = $result->fetch_assoc()) {
        echo '- ' . $row['Field'] . ' (' . $row['Type'] . ')\n';
    }
}

// Check if there are any reports
$result = $conn->query('SELECT COUNT(*) as count FROM reports');
$row = $result->fetch_assoc();
echo '\nTotal reports: ' . $row['count'] . '\n';

// Check if there are any photo notes
$result = $conn->query('SELECT COUNT(*) as count FROM photo_notes');
$row = $result->fetch_assoc();
echo 'Total photo notes: ' . $row['count'] . '\n';

// If no photo notes exist, let's add some test data
if ($row['count'] == 0) {
    echo '\nNo photo notes found. Adding test data...\n';

    // Get first report ID
    $result = $conn->query('SELECT id FROM reports LIMIT 1');
    if ($result->num_rows > 0) {
        $report = $result->fetch_assoc();
        $reportId = $report['id'];

        // Add a test photo note
        $photoNoteId = 'test_photo_' . time();
        $insert = "INSERT INTO photo_notes (id, report_id, type, content, timestamp) VALUES (?, ?, 'photo', ?, NOW())";

        $stmt = $conn->prepare($insert);
        $testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 pixel PNG
        $stmt->bind_param('iis', $photoNoteId, $reportId, $testBase64);

        if ($stmt->execute()) {
            echo 'Test photo note added successfully\n';
        } else {
            echo 'Error adding test photo note: ' . $stmt->error . '\n';
        }

        // Add a test text note
        $noteId = 'test_note_' . time();
        $insertNote = "INSERT INTO photo_notes (id, report_id, type, content, timestamp) VALUES (?, ?, 'note', ?, NOW())";

        $stmt = $conn->prepare($insertNote);
        $testNote = 'This is a test note for the photo notes feature.';
        $stmt->bind_param('iis', $noteId, $reportId, $testNote);

        if ($stmt->execute()) {
            echo 'Test text note added successfully\n';
        } else {
            echo 'Error adding test text note: ' . $stmt->error . '\n';
        }
    } else {
        echo 'No reports found to add test data to\n';
    }
}

$conn->close();
?>
