<?php
include 'api/jwt_helper.php';

// Get user_id from command line argument or default to 4
$user_id = isset($argv[1]) ? (int)$argv[1] : 4;

// Set user details based on user_id
if ($user_id === 7) {
    $email = 'maria@example.com'; // Assuming user 7 is Maria
} else {
    $email = 'juan@example.com'; // Default to Juan for user 4
}
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
