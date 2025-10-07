<?php
require_once 'api/db.php';

$fullname = 'Test Resident';
$email = 'testresident@example.com';
$password = password_hash('password', PASSWORD_DEFAULT);
$phone = '09123456789';
$address = 'Test Address, Tagudin, Ilocos Sur';
$role = 'resident';

$sql = "INSERT INTO users (fullname, email, password, phone, address, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ssssss', $fullname, $email, $password, $phone, $address, $role);

if ($stmt->execute()) {
    echo 'Test resident user inserted successfully with ID: ' . $conn->insert_id . PHP_EOL;
} else {
    echo 'Error inserting user: ' . $stmt->error . PHP_EOL;
}

$stmt->close();
$conn->close();
?>
