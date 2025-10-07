<?php
// Test the register API
$url = 'http://localhost/hazardTrackV2/api/register.php';
$data = [
    'fullname' => 'Test Resident',
    'email' => 'testresident@example.com',
    'password' => 'password123',
    'phone' => '09123456789',
    'address' => 'Test Address',
    'role' => 'resident'
];

$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data),
    ],
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error calling API\n";
} else {
    echo "API Response:\n";
    echo $result . "\n";
}
?>
