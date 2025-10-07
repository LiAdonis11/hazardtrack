<?php
// Test hazard reporting API
echo "Testing Hazard Reporting API:\n";
echo "=============================\n\n";

// First, get a JWT token for a resident user
$loginData = [
    'email' => 'resident1@example.com',
    'password' => 'resident1'
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
$loginResponse = json_decode($response, true);
curl_close($ch);

if (!$loginResponse || $loginResponse['status'] !== 'success') {
    echo "❌ Failed to get JWT token for resident\n";
    exit(1);
}

$token = $loginResponse['token'];
echo "✅ Got JWT token for resident\n";

// Test hazard reporting
$reportData = [
    'category_id' => 6, // Fire Hazard category
    'title' => 'Test Hazard Report',
    'description' => 'This is a test hazard report for API testing',
    'location_address' => 'Tagudin, Ilocos Sur',
    'latitude' => 16.6167,
    'longitude' => 120.3167
];

$jsonData = json_encode($reportData);

$ch = curl_init('http://localhost/hazardTrackV2/api/report_hazard.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
    'Content-Length: ' . strlen($jsonData)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo "❌ Hazard reporting test failed: " . curl_error($ch) . "\n";
} else {
    echo "Hazard Reporting Response (HTTP $httpCode):\n";
    echo $response . "\n\n";

    $responseData = json_decode($response, true);
    if ($responseData && isset($responseData['status'])) {
        if ($responseData['status'] === 'success') {
            echo "✅ Hazard report submitted successfully\n";
            $reportId = $responseData['report_id'] ?? null;
        } else {
            echo "❌ Hazard report submission failed: " . ($responseData['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ Invalid response format\n";
    }
}

curl_close($ch);

// Test getting reports as BFP personnel
echo "Testing Get Reports API (BFP Personnel):\n";
echo "=========================================\n\n";

// Get JWT token for BFP personnel
$loginData = [
    'email' => 'mobilebfp1@example.com',
    'password' => 'mobilebfp1'
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
$bfpLoginResponse = json_decode($response, true);
curl_close($ch);

if (!$bfpLoginResponse || $bfpLoginResponse['status'] !== 'success') {
    echo "❌ Failed to get JWT token for BFP personnel\n";
    exit(1);
}

$bfpToken = $bfpLoginResponse['token'];
echo "✅ Got JWT token for BFP personnel\n";

// Get reports
$ch = curl_init('http://localhost/hazardTrackV2/api/get_all_reports.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $bfpToken
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo "❌ Get reports test failed: " . curl_error($ch) . "\n";
} else {
    echo "Get Reports Response (HTTP $httpCode):\n";
    echo $response . "\n\n";

    $responseData = json_decode($response, true);
    if ($responseData && isset($responseData['status'])) {
        if ($responseData['status'] === 'success') {
            echo "✅ Reports retrieved successfully\n";
            if (isset($responseData['reports']) && is_array($responseData['reports'])) {
                echo "Number of reports: " . count($responseData['reports']) . "\n";
            }
        } else {
            echo "❌ Reports retrieval failed: " . ($responseData['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ Invalid response format\n";
    }
}

curl_close($ch);
?>
