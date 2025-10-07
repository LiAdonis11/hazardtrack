<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['fullname'], $data['email'], $data['password'], $data['role'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

$fullname = $conn->real_escape_string($data['fullname']);
$email = $conn->real_escape_string($data['email']);
$password = $data['password'];
$role = $conn->real_escape_string($data['role']);

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
    echo json_encode(['status' => 'success', 'message' => 'User registered successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to register user']);
}

$conn->close();
?>
