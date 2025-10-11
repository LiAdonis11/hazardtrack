<?php
include 'api/jwt_helper.php';

// Generate a test token for user ID 60 (bfp@gmail.com, inspector)
$token = generateJWT(60, 'bfp@gmail.com', 'inspector');
echo "Test Token: " . $token . "\n\n";

// Test the API call
$url = 'http://localhost/hazardTrackV2/api/update_report_status.php';
$data = json_encode([
    'report_id' => 177,
    'status' => 'in_progress'
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
    'Content-Length: ' . strlen($data)
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $http_code\n";
echo "Response: $response\n";
?>
