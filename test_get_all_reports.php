<?php
require_once 'api/jwt_helper.php';

// Generate a fresh token
$token = generateJWT(47, 'testbfp@mobile.com', 'inspector');

$url = 'http://localhost/hazardTrackV2/api/get_all_reports.php';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $http_code\n";
echo "Response:\n";
echo $response;
?>
