<?php
$conn = new mysqli('localhost', 'root', '', 'hazardtrack_dbv2');
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

$result = $conn->query('SELECT user_id FROM hazard_reports WHERE id = 92');
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo 'Report 92 belongs to user_id: ' . $row['user_id'] . PHP_EOL;

    // Get user details
    $userResult = $conn->query('SELECT id, fullname, email, role FROM users WHERE id = ' . $row['user_id']);
    if ($userResult->num_rows > 0) {
        $user = $userResult->fetch_assoc();
        echo 'User details: ' . json_encode($user) . PHP_EOL;
    }
} else {
    echo 'Report 92 not found' . PHP_EOL;
}

$conn->close();
?>
