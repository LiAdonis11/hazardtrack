<?php
include 'api/db.php';

// Test script to verify location data is being stored correctly
try {
    // Test data
    $test_data = [
        'report_number' => 'HZ-2024-0001',
        'user_id' => 1,
        'category_id' => 1,
        'title' => 'Test Hazard with Location',
        'description' => 'This is a test hazard with location data',
        'location_address' => '123 Test Street, Test City',
        'latitude' => 14.5995,
        'longitude' => 120.9842,
        'severity' => 'medium',
        'status' => 'pending'
    ];

    // Insert test data
    $stmt = $conn->prepare("
        INSERT INTO hazard_reports 
        (report_number, user_id, category_id, title, description, location_address, latitude, longitude, severity, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->bind_param("siisssddss", 
        $test_data['report_number'],
        $test_data['user_id'],
        $test_data['category_id'],
        $test_data['title'],
        $test_data['description'],
        $test_data['location_address'],
        $test_data['latitude'],
        $test_data['longitude'],
        $test_data['severity'],
        $test_data['status']
    );
    
    if ($stmt->execute()) {
        echo "Test data inserted successfully!\n";
        echo "Report ID: " . $conn->insert_id . "\n";
        
        // Verify the data was stored correctly
        $result = $conn->query("SELECT * FROM hazard_reports WHERE id = " . $conn->insert_id);
        if ($row = $result->fetch_assoc()) {
            echo "Stored data:\n";
            echo "Location Address: " . $row['location_address'] . "\n";
            echo "Latitude: " . $row['latitude'] . "\n";
            echo "Longitude: " . $row['longitude'] . "\n";
        }
    } else {
        echo "Error inserting test data: " . $conn->error . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
