<?php
// Test the report_hazard.php API

$test_data = [
    'token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1OSwiZW1haWwiOiJyZXNpZGVudEBnbWFpbC5jb20iLCJyb2xlIjoicmVzaWRlbnQiLCJpYXQiOjE3NjAxNjA0NDgsImV4cCI6MTc2MDc2NTI0OH0.pYTM2_JFY8BHzPBMxHxlX9qp0e1Q7GgQ5FXpDIqnFI4',
    'category_id' => 4,
    'title' => 'Flammable Items',
    'description' => 'Test report from API',
    'image' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
    'location_address' => 'Test Address, Tagudin, Ilocos Sur',
    'latitude' => 16.93846410,
    'longitude' => 120.43728840,
    'phone' => '091111111111'
];

$ch = curl_init('http://localhost/hazardTrackV2/api/report_hazard.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $http_code\n";
echo "Response: $response\n";
?>
