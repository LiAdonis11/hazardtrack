<?php
include 'api/db.php';

$categories = [
    ['id' => 1, 'name' => 'Faulty Electrical Wiring', 'description' => 'Exposed or deteriorated electrical lines that may spark or short circuit', 'color' => '#FACC15'],
    ['id' => 2, 'name' => 'LPG Leak / Improper Storage', 'description' => 'Leaking or poorly stored LPG tanks near heat sources or indoors', 'color' => '#FB923C'],
    ['id' => 3, 'name' => 'Damaged Electrical Post / Transformer', 'description' => 'Leaning post, exposed power lines, or sparking transformer', 'color' => '#38BDF8'],
    ['id' => 4, 'name' => 'Blocked Fire Exit', 'description' => 'Fire exits obstructed by furniture, locks, or debris', 'color' => '#A78BFA'],
    ['id' => 5, 'name' => 'Flammable / Combustible Materials', 'description' => 'Improper storage of fuels, chemicals, or piles of combustible waste', 'color' => '#F87171'],
    ['id' => 6, 'name' => 'Missing Fire Safety Equipment', 'description' => 'No extinguisher, alarm, or smoke detector in place or functional', 'color' => '#34D399'],
    ['id' => 7, 'name' => 'Open Burning / Grassfire', 'description' => 'Uncontrolled burning of trash or vegetation in open areas', 'color' => '#FBBF24'],
    ['id' => 8, 'name' => 'Negligent Fire Behavior', 'description' => 'Unattended cooking, smoking near flammables, or unsafe fire use', 'color' => '#EF4444'],
    ['id' => 9, 'name' => 'Other Fire-Related Hazard', 'description' => 'Any other safety issue that poses a fire risk not listed above', 'color' => '#9CA3AF'],
];

foreach ($categories as $cat) {
    $stmt = $conn->prepare("UPDATE categories SET name = ?, description = ?, color = ? WHERE id = ?");
    $stmt->bind_param("sssi", $cat['name'], $cat['description'], $cat['color'], $cat['id']);
    if ($stmt->execute()) {
        echo "Updated category {$cat['id']}: {$cat['name']}\n";
    } else {
        echo "Failed to update category {$cat['id']}: " . $stmt->error . "\n";
    }
    $stmt->close();
}

echo "Categories update complete.\n";
?>
