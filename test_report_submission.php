<?php
// Test what the mobile app sends for report submission
// Simulate the data structure from report-hazard.tsx

// Sample data that the mobile app would send
$sample_data = [
    'token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...', // truncated for brevity
    'category_id' => 1,
    'title' => 'Electrical Hazard',
    'description' => 'Test report with image',
    'image' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
    'location_address' => 'Test Address, Tagudin, Ilocos Sur',
    'latitude' => 16.93846410,
    'longitude' => 120.43728840,
    'phone' => '0911111111111'
];

echo "Sample data structure that mobile app sends:\n";
echo json_encode($sample_data, JSON_PRETTY_PRINT) . "\n\n";

// Test the image processing logic from report_hazard.php
$image_data = $sample_data['image'];

echo "Testing image processing:\n";
echo "Image data starts with: " . substr($image_data, 0, 50) . "...\n";

if (strpos($image_data, 'data:image') === 0) {
    echo "Detected data URL format\n";
    $parts = explode(',', $image_data);
    if (count($parts) === 2) {
        echo "Data URL has 2 parts (header and data)\n";
        $header = $parts[0];
        $base64_data = $parts[1];

        echo "Header: $header\n";
        echo "Base64 data length: " . strlen($base64_data) . "\n";

        $decoded = base64_decode($base64_data);
        if ($decoded === false) {
            echo "ERROR: base64_decode failed\n";
        } else {
            echo "SUCCESS: base64_decode successful, decoded length: " . strlen($decoded) . " bytes\n";

            // Test file saving
            $upload_dir = 'uploads/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
                echo "Created uploads directory\n";
            }

            $file_name = 'test_mobile_' . time() . '_report.jpg';
            $file_path = $upload_dir . $file_name;

            $result = file_put_contents($file_path, $decoded);
            if ($result === false) {
                echo "ERROR: file_put_contents failed\n";
            } else {
                echo "SUCCESS: File saved to $file_path, $result bytes written\n";
                echo "File exists: " . (file_exists($file_path) ? 'YES' : 'NO') . "\n";
                if (file_exists($file_path)) {
                    echo "File size on disk: " . filesize($file_path) . " bytes\n";
                }
            }
        }
    } else {
        echo "ERROR: Data URL doesn't have expected format\n";
    }
} else {
    echo "Not a data URL, trying raw base64 decode...\n";
    $decoded = base64_decode($image_data);
    echo "Raw decode result length: " . strlen($decoded) . " bytes\n";
}
?>
