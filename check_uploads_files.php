<?php
$upload_dir = 'uploads/';
$files = scandir($upload_dir);
echo "Files in uploads directory:\n";
foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        $file_path = $upload_dir . $file;
        $size = filesize($file_path);
        $mtime = date('Y-m-d H:i:s', filemtime($file_path));
        echo "  $file - $size bytes - $mtime\n";
    }
}
?>
