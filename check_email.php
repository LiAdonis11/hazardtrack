<?php
require_once 'api/db.php';
$email = 'testcreate@gmail.com';
$result = $conn->query("SELECT id FROM users WHERE email = '$email'");
if ($result && $result->num_rows > 0) {
    echo "Email exists\n";
} else {
    echo "Email not found\n";
}
$conn->close();
?>
