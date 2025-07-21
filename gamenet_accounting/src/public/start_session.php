<?php
require_once '../includes/db.php';

if (isset($_GET['device_id'])) {
    $deviceId = $_GET['device_id'];

    // Start a new session
    $stmt = $pdo->prepare("INSERT INTO sessions (device_id, start_time) VALUES (?, NOW())");
    $stmt->execute([$deviceId]);
    $sessionId = $pdo->lastInsertId();

    // Update device status
    $stmt = $pdo->prepare("UPDATE devices SET status = 'in_use' WHERE id = ?");
    $stmt->execute([$deviceId]);

    header("Location: index.php");
    exit();
}
?>
