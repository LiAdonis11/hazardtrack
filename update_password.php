<?php
include 'api/db.php';

$conn->query("UPDATE users SET password = 'password' WHERE email = 'bfp@gmail.com'");
echo 'Password updated to "password" for bfp@gmail.com' . PHP_EOL;
?>
