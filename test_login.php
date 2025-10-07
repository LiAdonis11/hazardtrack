<?php
// Simple test script to verify login functionality
$url = 'http://localhost/hazardTrackV2/api/login_resident.php';
$data = array('email' => 'juan@example.com', 'password' => 'password');

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ),
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error: Failed to connect to login endpoint\n";
} else {
    echo "Login Response:\n";
    echo $result . "\n";
    
    $response = json_decode($result, true);
    if ($response && isset($response['status']) && $response['status'] === 'success') {
        echo "✅ Login successful! Token: " . substr($response['token'], 0, 50) . "...\n";
    } else {
        echo "❌ Login failed: " . ($response['message'] ?? 'Unknown error') . "\n";
    }
}
?>
