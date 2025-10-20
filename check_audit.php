<?php
require_once 'api/db.php';

$result = $conn->query('SHOW TABLES LIKE "%audit%"');
while ($row = $result->fetch_array()) {
    echo $row[0] . "\n";
}

$result = $conn->query('SHOW TABLES LIKE "%status%"');
while ($row = $result->fetch_array()) {
    echo $row[0] . "\n";
}
?>
