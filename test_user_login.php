<?php
require_once 'api/db.php';

// Test login function
function testLogin($email, $password, $expectedRole) {
    global $conn;

    $sql = "SELECT id, fullname, email, password, role, phone, address FROM users WHERE email = ? AND is_active = 1 LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo "❌ User $email not found\n";
        return false;
    }

    $user = $result->fetch_assoc();

    if (!password_verify($password, $user['password'])) {
        echo "❌ Password verification failed for $email\n";
        return false;
    }

    if ($user['role'] !== $expectedRole) {
        echo "❌ Role mismatch for $email. Expected: $expectedRole, Got: " . $user['role'] . "\n";
        return false;
    }

    echo "✅ Login successful for $email (Role: " . $user['role'] . ")\n";
    return true;
}

// Test the created users
echo "Testing login for created users:\n\n";

$tests = [
    ['resident1@example.com', 'resident1', 'resident'],
    ['resident2@example.com', 'resident2', 'resident'],
    ['resident3@example.com', 'resident3', 'resident'],
    ['firstadmin@example.com', 'firstadmin123', 'admin'],
    ['secondadmin@example.com', 'secondadmin123', 'admin'],
    ['mobilebfp1@example.com', 'mobilebfp1', 'bfp_personnel'],
    ['mobilebfp5@example.com', 'mobilebfp5', 'bfp_personnel'],
    ['mobilebfp10@example.com', 'mobilebfp10', 'bfp_personnel'],
];

$successCount = 0;
foreach ($tests as $test) {
    if (testLogin($test[0], $test[1], $test[2])) {
        $successCount++;
    }
}

echo "\nLogin test results: $successCount/" . count($tests) . " successful\n";

$conn->close();
?>
