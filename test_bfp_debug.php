<?php
include 'api/db.php';

// Check if BFP user exists
$email = 'bfp_mobile@hazardtrack.com';
$sql = "SELECT id, fullname, email, password, role, is_active FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    echo "BFP User found:\n";
    echo "ID: " . $user['id'] . "\n";
    echo "Name: " . $user['fullname'] . "\n";
    echo "Email: " . $user['email'] . "\n";
    echo "Role: " . $user['role'] . "\n";
    echo "Active: " . ($user['is_active'] ? 'Yes' : 'No') . "\n";

    // Test password
    $password = 'password';
    if (password_verify($password, $user['password'])) {
        echo "Password verification: SUCCESS\n";
    } else {
        echo "Password verification: FAILED\n";
    }
} else {
    echo "BFP user not found. Creating...\n";

    // Create BFP user
    $hashed_password = password_hash('password', PASSWORD_DEFAULT);
    $insert_sql = "INSERT INTO users (fullname, email, password, phone, address, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);
    $fullname = 'BFP Mobile Officer';
    $phone = '09123456789';
    $address = 'BFP Station, Tagudin, Ilocos Sur';
    $role = 'bfp_personnel';
    $is_active = 1;

    $insert_stmt->bind_param("ssssssi", $fullname, $email, $hashed_password, $phone, $address, $role, $is_active);

    if ($insert_stmt->execute()) {
        echo "BFP user created successfully!\n";
    } else {
        echo "Failed to create BFP user: " . $conn->error . "\n";
    }
}

// Test the login API directly
echo "\n--- Testing API Login ---\n";
$data = [
    'email' => $email,
    'password' => 'password'
];

$ch = curl_init('http://localhost/hazardTrackV2/api/login_resident.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $http_code\n";
echo "Response:\n";
echo $response . "\n";

$conn->close();
?>
