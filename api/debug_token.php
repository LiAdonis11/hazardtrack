<?php
// Debug JWT token
$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3LCJlbWFpbCI6InRlc3QxQGdtYWlsLmNvbSIsInJvbGUiOiJyZXNpZGVudCIsImlhdCI6MTc1NjY4NDA2MywiZXhwIjoxNzU2NzcwNDYzfQ.h36RiFpN_htDYsQiulU-ufVQAXvxgJltS-VJEIKgCPs';

$parts = explode('.', $token);
if (count($parts) === 3) {
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);

    echo "Token payload:\n";
    echo json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";
    echo "Current time: " . time() . "\n";
    echo "Token exp: " . $payload['exp'] . "\n";
    echo "Time difference: " . ($payload['exp'] - time()) . " seconds\n";
    echo "Token expired: " . ($payload['exp'] < time() ? 'YES' : 'NO') . "\n";

    // Check if token is within 24 hours
    $issued = $payload['iat'];
    $expires = $payload['exp'];
    $duration = $expires - $issued;
    echo "Token duration: " . ($duration / 3600) . " hours\n";
} else {
    echo "Invalid token format\n";
}
?>
