<?php
// Test the full report submission process
include 'api/jwt_helper.php';
include 'api/db.php';

// Simulate a resident login to get a token
$user_email = 'test1@gmail.com'; // From the database
$user_query = $conn->prepare("SELECT id, password FROM users WHERE email = ? AND role = 'resident' LIMIT 1");
$user_query->bind_param("s", $user_email);
$user_query->execute();
$user_result = $user_query->get_result();

if ($user_result->num_rows === 0) {
    die("Test user not found\n");
}

$user = $user_result->fetch_assoc();
$user_id = $user['id'];

// Generate a JWT token for testing
$payload = [
    'user_id' => $user_id,
    'email' => $user_email,
    'role' => 'resident',
    'iat' => time(),
    'exp' => time() + (24 * 60 * 60) // 24 hours
];

$token = generateJWT($user_id, $user_email, 'resident');
echo "Generated test token for user $user_email (ID: $user_id)\n";

// Now simulate the report submission
$report_data = [
    'token' => $token,
    'category_id' => 1,
    'title' => 'Test Report with Image',
    'description' => 'Testing full report submission with image',
    'image' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
    'location_address' => 'Test Location, Tagudin, Ilocos Sur',
    'latitude' => 16.93846410,
    'longitude' => 120.43728840,
    'phone' => '0911111111111'
];

echo "\nSubmitting report with image...\n";

// Make the API call using curl
$ch = curl_init('http://localhost/hazardTrackV2/api/report_hazard.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($report_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $http_code\n";
echo "Response: $response\n";

$result = json_decode($response, true);
if ($result && $result['status'] === 'success') {
    echo "\n✅ Report submitted successfully!\n";
    echo "Report ID: " . ($result['report_id'] ?? 'N/A') . "\n";

    if (!empty($result['image_path'])) {
        echo "Image path returned: {$result['image_path']}\n";

        // Check if the file actually exists
        $relative_path = str_replace('http://192.168.254.183/hazardTrackV2/', '', $result['image_path']);
        echo "Relative path: $relative_path\n";
        echo "File exists on disk: " . (file_exists($relative_path) ? 'YES' : 'NO') . "\n";

        if (file_exists($relative_path)) {
            echo "File size: " . filesize($relative_path) . " bytes\n";
        }
    } else {
        echo "No image path returned\n";
    }

    // Check database
    if (isset($result['report_id'])) {
        $report_id = $result['report_id'];
        $stmt = $conn->prepare("SELECT image_path FROM hazard_reports WHERE id = ?");
        $stmt->bind_param("i", $report_id);
        $stmt->execute();
        $db_result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        echo "\nDatabase check:\n";
        echo "Image path in DB: " . ($db_result['image_path'] ?? 'NULL') . "\n";

        if (!empty($db_result['image_path'])) {
            echo "File exists: " . (file_exists($db_result['image_path']) ? 'YES' : 'NO') . "\n";
        }
    }
} else {
    echo "\n❌ Report submission failed: " . ($result['message'] ?? 'Unknown error') . "\n";
}
?>
