<?php
include 'api/db.php';
$result = $conn->query('DESCRIBE status_history');
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . ' - ' . $row['Type'] . ' - ' . ($row['Null'] == 'YES' ? 'NULL' : 'NOT NULL') . "\n";
}
$conn->close();
?>
