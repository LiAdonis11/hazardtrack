<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'api/db.php';

echo "<pre>";

// --- Test Parameters ---
$test_user_id = 7; // An existing user ID
$test_category_id = 1; // An existing category ID
$upload_dir = 'uploads/';

echo "--- STARTING ATTACHMENT TEST ---\\n\\n";

// --- 1. Test Database Connection ---
if ($conn) {
    echo "1. Database Connection: SUCCESS\\n";
} else {
    echo "1. Database Connection: FAILED\\n";
    die();
}

// --- 2. Create a Dummy Report ---
try {
    $report_number = 'TEST-' . time();
    $stmt = $conn->prepare("INSERT INTO hazard_reports (report_number, user_id, category_id, title, description) VALUES (?, ?, ?, 'Test Report', 'Test Description')");
    $stmt->bind_param("sii", $report_number, $test_user_id, $test_category_id);
    if ($stmt->execute()) {
        $report_id = $conn->insert_id;
        echo "2. Create Dummy Report: SUCCESS (Report ID: $report_id)\\n";
    } else {
        throw new Exception($stmt->error);
    }
} catch (Exception $e) {
    echo "2. Create Dummy Report: FAILED - " . $e->getMessage() . "\\n";
    die();
}

// --- 3. Test Directory Permissions ---
if (!is_dir($upload_dir)) {
    if (mkdir($upload_dir, 0777, true)) {
        echo "3. Uploads Directory: CREATED\\n";
    } else {
        echo "3. Uploads Directory: FAILED TO CREATE\\n";
        die();
    }
} else {
    echo "3. Uploads Directory: EXISTS\\n";
}

if (is_writable($upload_dir)) {
    echo "   - Directory is writable: YES\\n";
} else {
    echo "   - Directory is writable: NO\\n";
    die();
}

// --- 4. Create a Dummy File ---
$dummy_file_name = 'test_image_' . time() . '.txt';
$dummy_file_path = $upload_dir . $dummy_file_name;
if (file_put_contents($dummy_file_path, 'This is a test file.')) {
    echo "4. Create Dummy File: SUCCESS ($dummy_file_path)\\n";
} else {
    echo "4. Create Dummy File: FAILED\\n";
    die();
}

// --- 5. Insert into report_attachments ---
try {
    $stmt_attach = $conn->prepare("INSERT INTO report_attachments (report_id, file_name, file_path, mime_type, file_size, is_primary) VALUES (?, ?, ?, 'text/plain', 20, 1)");
    if (!$stmt_attach) throw new Exception("Prepare failed: " . $conn->error);
    $stmt_attach->bind_param("iss", $report_id, $dummy_file_name, $dummy_file_path);
    if ($stmt_attach->execute()) {
        echo "5. Insert Attachment Record: SUCCESS\\n";
    } else {
        throw new Exception($stmt_attach->error);
    }
} catch (Exception $e) {
    echo "5. Insert Attachment Record: FAILED - " . $e->getMessage() . "\\n";
    die();
}

// --- 6. Fetch from report_attachments ---
try {
    $stmt_fetch = $conn->prepare("SELECT * FROM report_attachments WHERE report_id = ?");
    if (!$stmt_fetch) throw new Exception("Prepare failed: " . $conn->error);
    $stmt_fetch->bind_param("i", $report_id);
    $stmt_fetch->execute();
    $result = $stmt_fetch->get_result();
    if ($result->num_rows > 0) {
        echo "6. Fetch Attachment Record: SUCCESS\\n";
        echo "   - Found attachments:\\n";
        while ($row = $result->fetch_assoc()) {
            print_r($row);
        }
    } else {
        echo "6. Fetch Attachment Record: FAILED - No attachments found for report ID $report_id\\n";
    }
} catch (Exception $e) {
    echo "6. Fetch Attachment Record: FAILED - " . $e->getMessage() . "\\n";
    die();
}

echo "\\n--- TEST COMPLETED ---\\n";

echo "</pre>";

?>