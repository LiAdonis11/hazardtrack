<?php
include 'api/jwt_helper.php';

// Generate token for resident user (user_id: 59)
$user_id = 59;
$email = 'resident@gmail.com';
$role = 'resident';

$token = generateJWT($user_id, $email, $role);

echo "Generated JWT Token for Resident User:\n";
echo $token . "\n\n";

echo "Token details:\n";
$parts = explode('.', $token);
if (count($parts) === 3) {
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    echo json_encode($payload, JSON_PRETTY_PRINT) . "\n";
}
?>
