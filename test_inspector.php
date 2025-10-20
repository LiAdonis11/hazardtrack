<?php
include 'api/db.php';

// Get inspector user
$sql = "SELECT email, password FROM users WHERE role = 'inspector' LIMIT 1";
$result = $conn->query($sql);
$user = $result->fetch_assoc();

if ($user) {
    echo 'Inspector email: ' . $user['email'] . PHP_EOL;
    echo 'Password: ' . $user['password'] . PHP_EOL;
} else {
    echo 'No inspector user found' . PHP_EOL;
}
?>
