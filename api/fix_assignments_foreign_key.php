<?php
// Fix foreign key constraint for assignments table to reference hazard_reports instead of reports
include 'db.php';

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Drop the existing foreign key constraint
$sql_drop_fk = "ALTER TABLE assignments DROP FOREIGN KEY assignments_ibfk_1";

if ($conn->query($sql_drop_fk) === TRUE) {
    echo "✅ Dropped existing foreign key constraint\n";
} else {
    echo "❌ Error dropping foreign key: " . $conn->error . "\n";
}

// Add the correct foreign key constraint
$sql_add_fk = "ALTER TABLE assignments ADD CONSTRAINT assignments_ibfk_1 FOREIGN KEY (report_id) REFERENCES hazard_reports(id) ON DELETE CASCADE";

if ($conn->query($sql_add_fk) === TRUE) {
    echo "✅ Added correct foreign key constraint to hazard_reports\n";
} else {
    echo "❌ Error adding foreign key: " . $conn->error . "\n";
}

$conn->close();
echo "\n🎉 Foreign key constraint fixed!\n";
?>
