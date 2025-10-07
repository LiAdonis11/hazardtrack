<?php
// Test registration API with curl
echo "Testing Registration API:\n";
echo "=======================\n\n";

// Test data for new user registration
$testUser = [
    'fullname' => 'Test Registration User',
    'email' => 'testregistration@example.com',
    'password' => 'testpassword123',
    'role' => 'resident'
];

$jsonData = json_encode($testUser);

$ch = curl_init('http://localhost/hazardTrackV2/api/register.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo "❌ Registration API test failed: " . curl_error($ch) . "\n";
} else {
    echo "Registration API Response (HTTP $httpCode):\n";
    echo $response . "\n\n";

    $responseData = json_decode($response, true);
    if ($responseData && isset($responseData['status'])) {
        if ($responseData['status'] === 'success') {
            echo "✅ Registration successful\n";
        } else {
            echo "❌ Registration failed: " . ($responseData['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ Invalid response format\n";
    }
}

curl_close($ch);

// Test duplicate email registration
echo "Testing Duplicate Email Registration:\n";
echo "=====================================\n";

$ch = curl_init('http://localhost/hazardTrackV2/api/register.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo "❌ Duplicate registration test failed: " . curl_error($ch) . "\n";
} else {
    echo "Duplicate Registration Response (HTTP $httpCode):\n";
    echo $response . "\n\n";

    $responseData = json_decode($response, true);
    if ($responseData && isset($responseData['status'])) {
        if ($responseData['status'] === 'error' && strpos($responseData['message'], 'already registered') !== false) {
            echo "✅ Duplicate email properly rejected\n";
        } else {
            echo "❌ Duplicate email not properly handled\n";
        }
    } else {
        echo "❌ Invalid response format\n";
    }
}

curl_close($ch);
?>
