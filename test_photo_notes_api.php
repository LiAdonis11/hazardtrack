<?php
// Test script for photo notes API

require_once 'api/jwt_helper.php';

function generateJWTWrapper($user) {
    // Use the correct parameters for generateJWT function
    return generateJWT($user['id'], $user['email'], $user['role']);
}

echo "=== Testing Photo Notes API ===\n\n";

$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2', 3307);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 1. Check photo_notes table exists
$result = $conn->query("SHOW TABLES LIKE 'photo_notes'");
if ($result->num_rows === 0) {
    die("photo_notes table does not exist\n");
}
echo "1. Checking photo_notes table...\n✓ photo_notes table exists\n";

// 2. Check for users and reports - use user ID 4 since that's what the reports belong to
$result = $conn->query("SELECT id, email, role FROM users WHERE id = 4");
if ($result->num_rows === 0) {
    die("User with ID 4 not found\n");
}
$user = $result->fetch_assoc();

$result = $conn->query("SELECT id FROM reports WHERE user_id = " . intval($user['id']) . " LIMIT 1");
if ($result->num_rows === 0) {
    die("No reports found for user\n");
}
$report = $result->fetch_assoc();

echo "2. Checking for reports...\nTotal reports: 1\nUsing report ID: {$report['id']} User ID: {$user['id']}\n";

// 3. Generate JWT token with correct parameters
$jwt = generateJWTWrapper($user);

// 4. Test get_photo_notes API
$url = "http://localhost/api/get_photo_notes.php?report_id=" . $report['id'];
$opts = [
    "http" => [
        "method" => "GET",
        "header" => "Authorization: Bearer $jwt\r\n"
    ]
];
$context = stream_context_create($opts);
$response = file_get_contents($url, false, $context);

if ($response === false) {
    echo "Failed to call get_photo_notes API\n";
} else {
    echo "3. Testing get_photo_notes API...\n";
    echo "Response:\n$response\n";
}

$conn->close();
?>
