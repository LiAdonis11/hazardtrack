<?php
// JWT Helper for HazardTrack API
// Secret key for JWT - CHANGE THIS IN PRODUCTION!
define('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production');
define('JWT_ALGORITHM', 'HS256');

/**
 * Generate JWT token
 */
function generateJWT($user_id, $email, $role) {
    // Create token header as a JSON string
    $header = json_encode([
        'typ' => 'JWT',
        'alg' => JWT_ALGORITHM
    ]);

    // Create token payload as a JSON string
    $payload = json_encode([
        'user_id' => $user_id,
        'email' => $email,
        'role' => $role,
        'iat' => time(), // Issued at
        'exp' => time() + (60 * 60 * 24 * 7) // Expire in 7 days (increased from 24 hours)
    ]);

    // Encode Header to Base64Url String
    $base64UrlHeader = base64UrlEncode($header);

    // Encode Payload to Base64Url String
    $base64UrlPayload = base64UrlEncode($payload);

    // Create Signature Hash
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);

    // Encode Signature to Base64Url String
    $base64UrlSignature = base64UrlEncode($signature);

    // Create JWT
    $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;

    return $jwt;
}

/**
 * Validate JWT token
 */
function validateJWT($jwt) {
    // Split the token
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) !== 3) {
        return false;
    }

    $header = base64UrlDecode($tokenParts[0]);
    $payload = base64UrlDecode($tokenParts[1]);
    $signatureProvided = $tokenParts[2];

    // Check expiration
    $payloadDecoded = json_decode($payload, true);
    if (isset($payloadDecoded['exp']) && $payloadDecoded['exp'] < time()) {
        return false;
    }

    // Build a signature based on the original encoded header and payload parts
    $signature = hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);

    // Verify it matches the signature provided in the token
    if ($base64UrlSignature === $signatureProvided) {
        return json_decode($payload, true);
    } else {
        return false;
    }
}

/**
 * Base64Url Encode
 */
function base64UrlEncode($text) {
    return str_replace(
        ['+', '/', '='],
        ['-', '_', ''],
        base64_encode($text)
    );
}

/**
 * Base64Url Decode
 */
function base64UrlDecode($text) {
    // Add padding if needed
    $remainder = strlen($text) % 4;
    if ($remainder) {
        $text .= str_repeat('=', 4 - $remainder);
    }

    return base64_decode(str_replace(
        ['-', '_'],
        ['+', '/'],
        $text
    ));
}

/**
 * Get JWT from Authorization header or query parameter
 */
function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    // HEADER: Get the access token from the header
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    
    // QUERY PARAMETER: Check for token in query string
    if (isset($_GET['token']) && !empty($_GET['token'])) {
        return $_GET['token'];
    }
    
    // POST DATA: Check for token in POST data
    if (isset($_POST['token']) && !empty($_POST['token'])) {
        return $_POST['token'];
    }
    
    // Debug: Log what we received
    error_log("getBearerToken() - No token found. Headers: " . json_encode($headers));
    error_log("getBearerToken() - GET: " . json_encode($_GET));
    error_log("getBearerToken() - POST: " . json_encode($_POST));
    
    return null;
}
?>
