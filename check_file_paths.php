<?php
include 'api/db.php';

$result = $conn->query('SELECT file_path FROM report_attachments LIMIT 10');
echo "Files in database:\n";
while ($row = $result->fetch_assoc()) {
    echo "  {$row['file_path']}\n";
    if (file_exists($row['file_path'])) {
        echo "    EXISTS on disk\n";
    } else {
        echo "    NOT FOUND on disk\n";
    }
}
?>
