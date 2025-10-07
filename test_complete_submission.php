<?php
include 'api/db.php';
include 'api/jwt_helper.php';

// Test complete submission with location data
try {
    // Create a test token (you may need to adjust this based on your JWT setup)
    $test_user_id = 1;
    $test_email = 'test@example.com';
    $test_role = 'resident';
    $test_token = generateJWT($test_user_id, $test_email, $test_role);
    
    // Test form data
    $post_data = [
        'token' => $test_token,
        'category_id' => 1,
        'title' => 'Complete Test Hazard with Location',
        'description' => 'This is a complete test with location data',
        'location_address' => '456 Test Avenue, Test City',
        'latitude' => '14.6000',
        'longitude' => '120.9850',
        'is_unsure' => '0'
    ];
    
    echo "Testing complete submission with location data...\n";
    echo "Token: " . $test_token . "\n";
    echo "Data being sent:\n";
    print_r($post_data);
    
    // Simulate the API call
    $payload = validateJWT($test_token);
    if (!$payload) {
        throw new Exception("Invalid token");
    }
    
    // Validate required fields
    if (empty($post_data['category_id']) || empty($post_data['title']) || empty($post_data['description'])) {
        throw new Exception("Missing required fields");
    }
    
    // Generate report number
    $year = date('Y');
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM hazard_reports WHERE YEAR(created_at) = ?");
    $stmt->bind_param("i", $year);
    $stmt->execute();
    $result = $stmt->get_result();
    $count = $result->fetch_assoc()['count'] + 1;
    $report_number = sprintf('HZ-%s-%04d', $year, $count);
    
    // Insert into database
    $stmt = $conn->prepare("
        INSERT INTO hazard_reports 
        (report_number, user_id, category_id, title, description, location_address, latitude, longitude, severity, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'medium', 'pending')
    ");
    
    // Handle null values for location data
    $location_address = !empty($post_data['location_address']) ? $post_data['location_address'] : null;
    $latitude = !empty($post_data['latitude']) ? $post_data['latitude'] : null;
    $longitude = !empty($post_data['longitude']) ? $post_data['longitude'] : null;
    
    $stmt->bind_param("siisssdd", 
        $report_number,
        $payload['user_id'],
        $post_data['category_id'],
        $post_data['title'],
        $post_data['description'],
        $location_address,
        $latitude,
        $longitude
    );
    
    if ($stmt->execute()) {
        $report_id = $conn->insert_id;
        echo "SUCCESS: Report submitted with location data!\n";
        echo "Report Number: " . $report_number . "\n";
        echo "Report ID: " . $report_id . "\n";
        
        // Verify the data was stored correctly
        $result = $conn->query("SELECT * FROM hazard_reports WHERE id = " . $report_id);
        if ($row = $result->fetch_assoc()) {
            echo "Stored location data:\n";
            echo "Location Address: " . $row['location_address'] . "\n";
            echo "Latitude: " . $row['latitude'] . "\n";
            echo "Longitude: " . $row['longitude'] . "\n";
        }
    } else {
        throw new Exception("Database error: " . $conn->error);
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
