<?php
// Test login API for different user types
echo "Testing Login API for Different User Types:\n";
echo "===========================================\n\n";

$testUsers = [
    ['email' => 'resident1@example.com', 'password' => 'resident1', 'expectedRole' => 'resident'],
    ['email' => 'firstadmin@example.com', 'password' => 'firstadmin123', 'expectedRole' => 'admin'],
    ['email' => 'mobilebfp1@example.com', 'password' => 'mobilebfp1', 'expectedRole' => 'bfp_personnel'],
    ['email' => 'admin@hazardtrack.com', 'password' => 'admin123', 'expectedRole' => 'admin'],
];

$successCount = 0;
foreach ($testUsers as $user) {
    echo "Testing login for: " . $user['email'] . "\n";

    $loginData = [
        'email' => $user['email'],
        'password' => $user['password']
    ];

    $jsonData = json_encode($loginData);

    $ch = curl_init('http://localhost/hazardTrackV2/api/login.php');
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
        echo "❌ Login API test failed: " . curl_error($ch) . "\n";
    } else {
        echo "Login API Response (HTTP $httpCode):\n";
        echo $response . "\n";

        $responseData = json_decode($response, true);
        if ($responseData && isset($responseData['status'])) {
            if ($responseData['status'] === 'success') {
                if (isset($responseData['user']) && $responseData['user']['role'] === $user['expectedRole']) {
                    echo "✅ Login successful - Role: " . $responseData['user']['role'] . "\n";
                    $successCount++;
                } else {
                    echo "❌ Role mismatch - Expected: " . $user['expectedRole'] . ", Got: " . ($responseData['user']['role'] ?? 'unknown') . "\n";
                }
            } else {
                echo "❌ Login failed: " . ($responseData['message'] ?? 'Unknown error') . "\n";
            }
        } else {
            echo "❌ Invalid response format\n";
        }
    }

    curl_close($ch);
    echo "\n";
}

// Test invalid login
echo "Testing Invalid Login Credentials:\n";
echo "===================================\n";

$invalidLogin = [
    'email' => 'nonexistent@example.com',
    'password' => 'wrongpassword'
];

$jsonData = json_encode($invalidLogin);

$ch = curl_init('http://localhost/hazardTrackV2/api/login.php');
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
    echo "❌ Invalid login test failed: " . curl_error($ch) . "\n";
} else {
    echo "Invalid Login Response (HTTP $httpCode):\n";
    echo $response . "\n";

    $responseData = json_decode($response, true);
    if ($responseData && isset($responseData['status'])) {
        if ($responseData['status'] === 'error') {
            echo "✅ Invalid credentials properly rejected\n";
            $successCount++;
        } else {
            echo "❌ Invalid credentials not properly handled\n";
        }
    } else {
        echo "❌ Invalid response format\n";
    }
}

curl_close($ch);

echo "\nLogin API Test Results: $successCount/" . (count($testUsers) + 1) . " tests passed\n";
?>
