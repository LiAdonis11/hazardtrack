<?php
require_once 'api/db.php';

// Function to create a user
function createUser($fullname, $email, $password, $phone, $address, $role) {
    global $conn;

    // Check if email already exists
    $checkSql = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($checkSql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "User with email $email already exists. Skipping...\n";
        return;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user
    $insertSql = "INSERT INTO users (fullname, email, password, phone, address, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())";
    $stmt = $conn->prepare($insertSql);
    $stmt->bind_param("ssssss", $fullname, $email, $hashedPassword, $phone, $address, $role);

    if ($stmt->execute()) {
        echo "User $fullname created successfully with email $email\n";
    } else {
        echo "Error creating user $fullname: " . $stmt->error . "\n";
    }
}

// Create 3 residents
createUser("Resident One", "resident1@example.com", "resident1", "09123456781", "Tagudin, Ilocos Sur", "resident");
createUser("Resident Two", "resident2@example.com", "resident2", "09123456782", "Tagudin, Ilocos Sur", "resident");
createUser("Resident Three", "resident3@example.com", "resident3", "09123456783", "Tagudin, Ilocos Sur", "resident");

// Create 2 admins
createUser("First Admin", "firstadmin@example.com", "firstadmin123", "", "", "admin");
createUser("Second Admin", "secondadmin@example.com", "secondadmin123", "", "", "admin");

// Create 10 BFP personnel (inspectors for mobile)
for ($i = 1; $i <= 10; $i++) {
    $fullname = "BFP Inspector " . $i;
    $email = "mobilebfp{$i}@example.com";
    $password = "mobilebfp{$i}";
    $phone = "091234567" . str_pad($i, 2, '0', STR_PAD_LEFT);
    $address = "Tagudin, Ilocos Sur";
    $role = "bfp_personnel";

    createUser($fullname, $email, $password, $phone, $address, $role);
}

echo "\nAll sample users creation completed!\n";

$conn->close();
?>
