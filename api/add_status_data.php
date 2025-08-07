<?php
require_once 'db_connect.php';

try {
    // Add status records
    $statuses = [
        ['status_id' => 1, 'status_name' => 'Pending'],
        ['status_id' => 2, 'status_name' => 'Confirmed'],
        ['status_id' => 3, 'status_name' => 'Cancelled'],
        ['status_id' => 4, 'status_name' => 'Completed']
    ];

    $stmt = $conn->prepare('INSERT INTO tbl_status (status_id, status_name) VALUES (?, ?)');

    foreach ($statuses as $status) {
        try {
            $stmt->execute([$status['status_id'], $status['status_name']]);
            echo "✓ Added status: " . $status['status_name'] . "\n";
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                echo "⚠ Status " . $status['status_name'] . " already exists\n";
            } else {
                echo "✗ Error adding status " . $status['status_name'] . ": " . $e->getMessage() . "\n";
            }
        }
    }

    echo "\n✅ Status data setup completed!\n";
    echo "\nNow you can:\n";
    echo "1. Request appointments as a patient\n";
    echo "2. Manage appointments as a secretary\n";

} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>
