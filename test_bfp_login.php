<?php
require_once 'api/db.php';
require_once 'api/jwt_helper.php';

$email = 'testbfp@mobile.com';
$password = 'password';

$sql = 'SELECT id, fullname, email, password, role FROM users WHERE email = ?';
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo 'User found: ' . PHP_EOL;
    echo 'ID: ' . $user['id'] . PHP_EOL;
    echo 'Name: ' . $user['fullname'] . PHP_EOL;
    echo 'Email: ' . $user['email'] . PHP_EOL;
    echo 'Role: ' . $user['role'] . PHP_EOL;

    if (password_verify($password, $user['password'])) {
        echo 'Password verification: SUCCESS' . PHP_EOL;

        // Generate JWT
        $token = generateJWT($user['id'], $user['email'], $user['role']);
        echo 'JWT generated successfully' . PHP_EOL;
        printf("Token: %s\n", $token);

        // Split token
        $parts = explode('.', $token);
        echo 'Header: ' . $parts[0] . PHP_EOL;
        echo 'Payload: ' . $parts[1] . PHP_EOL;
        echo 'Signature: ' . $parts[2] . PHP_EOL;

        // Decode to check payload
        $decoded = json_decode(base64_decode(str_replace('_', '/', str_replace('-','+', $parts[1]))), true);
        echo 'JWT payload role: ' . ($decoded['role'] ?? 'not found') . PHP_EOL;
    } else {
        echo 'Password verification: FAILED' . PHP_EOL;
    }
} else {
    echo 'User not found' . PHP_EOL;
}

$stmt->close();
$conn->close();
?>
