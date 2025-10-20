<?php
// Test image saving functionality
$upload_dir = 'uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
    echo "Created uploads directory\n";
}

// Test base64 image data (small 1x1 pixel red PNG)
$test_base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

echo "Testing base64 decode...\n";
$image_data = base64_decode($test_base64);
if ($image_data === false) {
    echo "ERROR: base64_decode failed\n";
    exit(1);
}
echo "Base64 decode successful, data length: " . strlen($image_data) . " bytes\n";

$file_name = 'test_' . time() . '_report.png';
$file_path = $upload_dir . $file_name;

echo "Saving to: $file_path\n";
$result = file_put_contents($file_path, $image_data);
if ($result === false) {
    echo "ERROR: file_put_contents failed\n";
    echo "Directory writable: " . (is_writable($upload_dir) ? 'YES' : 'NO') . "\n";
    exit(1);
}

echo "SUCCESS: File saved, $result bytes written\n";
echo "File exists: " . (file_exists($file_path) ? 'YES' : 'NO') . "\n";
echo "File size: " . filesize($file_path) . " bytes\n";
?>
