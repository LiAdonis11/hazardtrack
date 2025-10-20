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

if (!isset($data['fullname'], $data['email'], $data['password'], $data['role'], $data['phone'], $data['address'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

$fullname = $conn->real_escape_string($data['fullname']);
$email = $conn->real_escape_string($data['email']);
$password = $data['password'];
$role = $conn->real_escape_string($data['role']);
$phone = $conn->real_escape_string($data['phone']);
$address = $conn->real_escape_string($data['address']);

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

$insertSql = "INSERT INTO users (fullname, email, password, phone, address, role) VALUES ('$fullname', '$email', '$hashedPassword', '$phone', '$address', '$role')";
if ($conn->query($insertSql) === TRUE) {
    $new_user_id = $conn->insert_id;

    // Create notifications for all admin and inspector users
    $adminQuery = "SELECT id FROM users WHERE role IN ('admin', 'inspector') AND (is_active = 1 OR role = 'admin')";
    $adminResult = $conn->query($adminQuery);

    if ($adminResult && $adminResult->num_rows > 0) {
        $notifyStmt = $conn->prepare("INSERT INTO notifications (user_id, title, body) VALUES (?, ?, ?)");
        $title = "New User Registration";
        $body = "A new user '$fullname' ($email) has registered as a $role.";

        while ($admin = $adminResult->fetch_assoc()) {
            $notifyStmt->bind_param("iss", $admin['id'], $title, $body);
            $notifyStmt->execute();
        }
        $notifyStmt->close();

        // Send push notifications to admins and inspector users with push tokens
        include 'push_helper.php';
        $pushQuery = "SELECT push_token FROM users WHERE role IN ('admin', 'inspector') AND is_active = 1 AND push_token IS NOT NULL";
        $pushResult = $conn->query($pushQuery);
        if ($pushResult && $pushResult->num_rows > 0) {
            while ($admin = $pushResult->fetch_assoc()) {
                send_push_notification($admin['push_token'], $title, $body);
            }
        }
    }

    echo json_encode(['status' => 'success', 'message' => 'User registered successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to register user']);
}

$conn->close();
?>
