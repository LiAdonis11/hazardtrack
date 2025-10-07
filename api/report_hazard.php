<?php
include 'jwt_helper.php';
include 'db.php';

// CORS and headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input data
$raw_input = file_get_contents('php://input');
error_log("Raw input: " . $raw_input);
$input_data = json_decode($raw_input, true);
error_log("Decoded input data: " . json_encode($input_data));

// Token validation from input data
if (!isset($input_data['token'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Authentication token not found']);
    exit();
}
$token = $input_data['token'];

$payload = validateJWT($token);
if (!$payload) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
    exit();
}

if ($payload['role'] !== 'resident') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access denied. Residents only']);
    exit();
}

$category_id = $input_data['category_id'] ?? null;
$title = $input_data['title'] ?? '';
$description = $input_data['description'] ?? '';
$location_address = $input_data['location_address'] ?? null;
$latitude = $input_data['latitude'] ?? null;
$longitude = $input_data['longitude'] ?? null;
$phone = $input_data['phone'] ?? null;

if (!$category_id || empty($title) || empty($description)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit();
}

try {
    // Generate report number
    $year = date('Y');
    $stmt1 = $conn->prepare("SELECT COUNT(*) as count FROM hazard_reports WHERE YEAR(created_at) = ?");
    $stmt1->bind_param("i", $year);
    $stmt1->execute();
    $count = $stmt1->get_result()->fetch_assoc()['count'] + 1;
    $report_number = sprintf('HZ-%s-%04d', $year, $count);
    $stmt1->close();

    // Insert into hazard_reports table
    $stmt2 = $conn->prepare("
        INSERT INTO hazard_reports
        (report_number, user_id, category_id, title, description, location_address, latitude, longitude, status, priority, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'medium', ?)
    ");
    if (!$stmt2) throw new Exception("Prepare failed for hazard_reports: (" . $conn->errno . ") " . $conn->error);

    $stmt2->bind_param("siisssdds", $report_number, $payload['user_id'], $category_id, $title, $description, $location_address, $latitude, $longitude, $phone);
    
    if ($stmt2->execute()) {
        $report_id = $conn->insert_id;
        $stmt2->close();

        // Handle image upload (base64 or file)
        $image_path = null;
        if (!empty($input_data['image'])) {
            // Base64 image
            error_log("Processing base64 image");
            $upload_dir = 'uploads/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            $file_name = uniqid() . '_report.jpg';
            $file_path = $upload_dir . $file_name;

            $image_data = base64_decode($input_data['image']);
            if ($image_data === false) {
                throw new Exception("Invalid base64 image data");
            }

            if (file_put_contents($file_path, $image_data) === false) {
                throw new Exception("Failed to save image file");
            }

            error_log("Image saved to $file_path");
            $image_path = $file_path;

            // Insert into report_attachments
            $stmt3 = $conn->prepare("
                INSERT INTO report_attachments
                (report_id, file_name, file_path, mime_type, file_size, is_primary)
                VALUES (?, ?, ?, ?, ?, 1)
            ");
            if (!$stmt3) throw new Exception("Prepare failed for report_attachments: (" . $conn->errno . ") " . $conn->error);

            $mime_type = 'image/jpeg';
            $file_size = strlen($image_data);
            $stmt3->bind_param("isssi", $report_id, $file_name, $file_path, $mime_type, $file_size);

            if (!$stmt3->execute()) {
                throw new Exception("Failed to insert into report_attachments: " . $stmt3->error);
            }
            $stmt3->close();
        } elseif (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            // Fallback to file upload
            error_log("Processing file upload");
            $upload_dir = 'uploads/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            $file_name = uniqid() . '_' . basename($_FILES['file']['name']);
            $file_path = $upload_dir . $file_name;

            if (move_uploaded_file($_FILES['file']['tmp_name'], $file_path)) {
                $image_path = $file_path;

                $stmt3 = $conn->prepare("
                    INSERT INTO report_attachments
                    (report_id, file_name, file_path, mime_type, file_size, is_primary)
                    VALUES (?, ?, ?, ?, ?, 1)
                ");
                if (!$stmt3) throw new Exception("Prepare failed for report_attachments: (" . $conn->errno . ") " . $conn->error);

                $mime_type = $_FILES['file']['type'];
                $file_size = $_FILES['file']['size'];
                $stmt3->bind_param("isssi", $report_id, $file_name, $file_path, $mime_type, $file_size);

                if (!$stmt3->execute()) {
                    throw new Exception("Failed to insert into report_attachments: " . $stmt3->error);
                }
                $stmt3->close();
            } else {
                throw new Exception("Failed to move uploaded file.");
            }
        }

        // Update the hazard_reports table with the image path if we have one
        if ($image_path) {
            $stmt4 = $conn->prepare("UPDATE hazard_reports SET image_path = ? WHERE id = ?");
            if (!$stmt4) throw new Exception("Prepare failed for updating hazard_reports: (" . $conn->errno . ") " . $conn->error);

            $stmt4->bind_param("si", $image_path, $report_id);
            if (!$stmt4->execute()) {
                throw new Exception("Failed to update hazard_reports with image_path: " . $stmt4->error);
            }
            error_log("Updated hazard_reports id=$report_id with image_path=$image_path");
            $stmt4->close();
        }
        
        http_response_code(201);
        echo json_encode([
            'status' => 'success', 
            'message' => 'Report submitted successfully',
            'report_id' => $report_id
        ]);
    } else {
        throw new Exception('Failed to insert report: ' . $stmt2->error);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    error_log("Error in report_hazard.php: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Failed to submit report: ' . $e->getMessage()]);
}
?>