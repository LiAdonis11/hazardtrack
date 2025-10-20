<?php
$ch = curl_init('http://localhost/hazardTrackV2/api/get_all_reports.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJmdWxsbmFtZSI6IkFkbWluIFVzZXIiLCJlbWFpbCI6ImFkbWluQGhhemFyZHRyYWNrLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDAwMDAwMCwiZXhwIjoxNzQwMDA4NjQwMH0.signature'));
$result = curl_exec($ch);
curl_close($ch);
$data = json_decode($result, true);
if ($data && isset($data['reports'][0])) {
    echo 'First report keys: ' . implode(', ', array_keys($data['reports'][0])) . PHP_EOL;
    echo 'Latitude: ' . $data['reports'][0]['latitude'] . ' (type: ' . gettype($data['reports'][0]['latitude']) . ')' . PHP_EOL;
    echo 'Longitude: ' . $data['reports'][0]['longitude'] . ' (type: ' . gettype($data['reports'][0]['longitude']) . ')' . PHP_EOL;
} else {
    echo 'No data or reports' . PHP_EOL;
}
?>
