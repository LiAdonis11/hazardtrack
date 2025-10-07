<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'api/db.php';

$data = json_decode(file_get_contents('php://input'), true);

// Default BFP personnel credentials
$fullname = isset($data['fullname']) ? $conn->real_escape_string($data['fullname']) : 'BFP Personnel';
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : 'bfp@bfp.com';
$password = isset($data['password']) ? $data['password'] : 'bfp123';
$role = 'bfp_personnel';

// Validate password: minimum 4 characters for easy password requirements
if (strlen($password) < 4) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 4 characters long']);
    exit();
}

// Check if email already exists
$checkSql = "SELECT id FROM users WHERE email = '$email'";
$result = $conn->query($checkSql);
if ($result && $result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'Email already registered']);
    exit();
}

// Hash the password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insertSql = "INSERT INTO users (fullname, email, password, role) VALUES ('$fullname', '$email', '$hashedPassword', '$role')";
if ($conn->query($insertSql) === TRUE) {
    echo json_encode(['status' => 'success', 'message' => 'BFP personnel account created successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to create BFP personnel account']);
}

$conn->close();
?>
