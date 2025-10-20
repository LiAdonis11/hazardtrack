<?php
include 'api/db.php';
$result = $conn->query('SELECT id, phone FROM hazard_reports WHERE phone IS NOT NULL AND phone != "" LIMIT 5');
while ($row = $result->fetch_assoc()) {
    echo 'ID: ' . $row['id'] . ', Phone: ' . $row['phone'] . "\n";
}
?>
