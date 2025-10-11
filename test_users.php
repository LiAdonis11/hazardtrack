<?php
include 'api/db.php';

$sql = "SELECT id, fullname, email, role FROM users";
$result = $conn->query($sql);

echo 'Users:' . PHP_EOL;
while ($user = $result->fetch_assoc()) {
    echo $user['id'] . ': ' . $user['fullname'] . ' (' . $user['email'] . ') - ' . $user['role'] . PHP_EOL;
}
?>
