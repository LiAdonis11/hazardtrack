<?php
// Simulate login to get token
$data = json_encode([
    'email' => 'bfp@gmail.com',
    'password' => 'password' // Assuming plain text for dev
]);

$ch = curl_init('http://localhost/hazardTrackV2/api/login_admin.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Origin: http://localhost:5173'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo 'Login response: ' . $response . PHP_EOL;
echo 'HTTP Code: ' . $httpCode . PHP_EOL;

$responseData = json_decode($response, true);
if ($responseData && $responseData['status'] === 'success') {
    $token = $responseData['token'];
    echo 'Token: ' . $token . PHP_EOL;

    // Now call analytics
    $ch2 = curl_init('http://localhost/hazardTrackV2/api/analytics_stats.php?range=30d');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Origin: http://localhost:5173'
    ]);

    $analyticsResponse = curl_exec($ch2);
    $analyticsHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);

    echo 'Analytics response: ' . $analyticsResponse . PHP_EOL;
    echo 'Analytics HTTP Code: ' . $analyticsHttpCode . PHP_EOL;
} else {
    echo 'Login failed' . PHP_EOL;
}
?>
