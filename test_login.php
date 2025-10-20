<?php
include 'api/db.php';

// Get admin user
$sql = "SELECT email, password FROM users WHERE role = 'admin' LIMIT 1";
$result = $conn->query($sql);
$user = $result->fetch_assoc();

if ($user) {
    echo 'Admin email: ' . $user['email'] . PHP_EOL;
    echo 'Password: ' . $user['password'] . PHP_EOL;
} else {
    echo 'No admin user found' . PHP_EOL;
}
?>
