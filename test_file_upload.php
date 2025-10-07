<?php
// Test file upload functionality
echo "=== Testing File Upload ===\n\n";

echo "FILES array: " . json_encode($_FILES) . "\n\n";
echo "POST data: " . json_encode($_POST) . "\n\n";

if (isset($_FILES['file'])) {
    echo "File found in FILES:\n";
    echo "- Name: " . $_FILES['file']['name'] . "\n";
    echo "- Type: " . $_FILES['file']['type'] . "\n";
    echo "- Size: " . $_FILES['file']['size'] . "\n";
    echo "- Error: " . $_FILES['file']['error'] . "\n";
    echo "- Temp path: " . $_FILES['file']['tmp_name'] . "\n";

    if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $file_name = uniqid() . '_' . basename($_FILES['file']['name']);
        $file_path = $upload_dir . $file_name;

        if (move_uploaded_file($_FILES['file']['tmp_name'], $file_path)) {
            echo "File uploaded successfully to: $file_path\n";
        } else {
            echo "Failed to move uploaded file\n";
        }
    } else {
        echo "File upload error: " . $_FILES['file']['error'] . "\n";
    }
} else {
    echo "No file found in FILES array\n";
}

echo "\n=== Test Complete ===\n";
?>
