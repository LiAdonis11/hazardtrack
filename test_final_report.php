<?php
// Test the complete report submission flow
$token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0LCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoicmVzaWRlbnQiLCJpYXQiOjE3NTYzOTE1MDYsImV4cCI6MTc1NjQ3NzkwNn0.5qPmPK03mbbX78CqpXlG-Z-_YP2tD3dup9SVByv99Bk";

$url = 'http://localhost/hazardTrackV2/api/report_hazard.php';
$post_data = array(
    'category_id' => '1',
    'title' => 'Final Test Electrical Hazard',
    'description' => 'This is a final test submission to verify the complete system is working',
    'location_address' => '123 Main Street, Tagudin, Ilocos Sur',
    'latitude' => '16.93330000',
    'longitude' => '120.45000000',
    'is_unsure' => '0'
);

$options = array(
    'http' => array(
        'header'  => "Authorization: Bearer $token\r\nContent-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($post_data),
    ),
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error: Failed to connect to report endpoint\n";
} else {
    echo "Report Submission Response:\n";
    echo $result . "\n";
    
    $response = json_decode($result, true);
    if ($response && isset($response['status']) && $response['status'] === 'success') {
        echo "✅ Report submitted successfully!\n";
        echo "Report Number: " . $response['report_number'] . "\n";
        echo "Report ID: " . $response['report_id'] . "\n";
    } else {
        echo "❌ Report submission failed: " . ($response['message'] ?? 'Unknown error') . "\n";
    }
}

