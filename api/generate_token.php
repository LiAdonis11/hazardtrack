<?php
include 'jwt_helper.php';

// Generate token for BFP user (user_id: 12)
$user_id = 12;
$email = 'bfp_test@example.com';
$role = 'bfp_personnel';

$token = generateJWT($user_id, $email, $role);

echo "Generated JWT Token for BFP User:\n";
echo $token . "\n\n";

echo "Token details:\n";
$parts = explode('.', $token);
if (count($parts) === 3) {
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    echo json_encode($payload, JSON_PRETTY_PRINT) . "\n";
}
?>
