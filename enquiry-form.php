<?php
// enquiry-form.php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $service_type = isset($_POST['service_type']) ? trim($_POST['service_type']) : 'General Enquiry';
    $destination = isset($_POST['destination']) ? trim($_POST['destination']) : '';
    $origin = isset($_POST['origin']) ? trim($_POST['origin']) : '';
    $date = isset($_POST['date']) ? trim($_POST['date']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'service_type' => $service_type,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'destination' => $destination,
        'origin' => $origin,
        'date' => $date,
        'message' => $message,
        'raw' => $_POST
    ];

    // Optional: save to local log file
    $logFile = __DIR__ . '/enquiries_log.json';
    $currentLogs = [];
    if (file_exists($logFile)) {
        $content = file_get_contents($logFile);
        $currentLogs = json_decode($content, true) ?: [];
    }
    $currentLogs[] = $logEntry;
    @file_put_contents($logFile, json_encode($currentLogs, JSON_PRETTY_PRINT));

    echo json_encode([
        'status' => 'success',
        'message' => 'Thank you! Your enquiry has been submitted successfully. Our team will contact you shortly.'
    ]);
    exit;
}

echo json_encode([
    'status' => 'error',
    'message' => 'Invalid request method.'
]);
exit;
