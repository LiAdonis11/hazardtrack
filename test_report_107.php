<?php
require_once 'api/jwt_helper.php';

$user_id = 4;
$email = 'juan@example.com';
$role = 'resident';
$token = generateJWT($user_id, $email, $role);

echo "=== Testing get_photo_notes API with report_id=107 ===\n\n";
echo "Generated JWT token for user ID 4\n\n";

// Test the API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/hazardtrackv2/api/get_photo_notes.php?report_id=107');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: $httpCode\n\n";
echo "Response:\n";
echo $response . "\n\n";
?>
