<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

class AppointmentAPI {
    private $conn;
    private $method;
    private $input;
    private $action;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->input = json_decode(file_get_contents('php://input'), true);
        $this->action = $_GET['action'] ?? ($this->input['action'] ?? '');
    }

    public static function random_reference() {
        return strtoupper(bin2hex(random_bytes(4)));
    }

    public function handle() {
        switch ($this->action) {
            case 'request':
                if ($this->method === 'POST') {
                    $this->requestAppointment();
                }
                break;
            case 'list':
                $this->listAppointments();
                break;
            case 'confirm':
                if ($this->method === 'POST') {
                    $this->confirmAppointment();
                }
                break;
            default:
                $this->respond(['success' => false, 'message' => 'Invalid request.']);
        }
    }

private function requestAppointment() {
    session_start(); // Ensure session is started
    $date = $this->input['date'] ?? null;
    $patient_id = $_SESSION['user_id'] ?? null; // Get patient ID from session

    if (!$date || !$patient_id) {
        $this->respond(['success' => false, 'message' => 'Date and patient ID are required.']);
        return;
    }

    // Validate patient exists
    $check = $this->conn->prepare("SELECT COUNT(*) FROM tbl_patients WHERE user_id = ?");
    $check->execute([$patient_id]);

    if ($check->fetchColumn() == 0) {
        $this->respond(['success' => false, 'message' => 'Invalid patient ID.']);
        return;
    }

    // Get actual patient_id (primary key)
    $stmt = $this->conn->prepare("SELECT patient_id FROM tbl_patients WHERE user_id = ?");
    $stmt->execute([$patient_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        $this->respond(['success' => false, 'message' => 'Patient not found.']);
        return;
    }

    $real_patient_id = $row['patient_id'];
    $status_id = 1; // pending

    try {
        $stmt = $this->conn->prepare('INSERT INTO tbl_appointment (patient_id, appointment_date, status_id) VALUES (?, ?, ?)');
        $stmt->execute([$real_patient_id, $date, $status_id]);

        if ($stmt->rowCount() > 0) {
            $this->respond(['success' => true, 'status' => 'pending', 'message' => 'Appointment requested successfully']);
        } else {
            $this->respond(['success' => false, 'message' => 'Failed to request appointment.']);
        }
    } catch (PDOException $e) {
        $this->respond(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

    private function listAppointments() {
        try {
            $stmt = $this->conn->query('SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name, s.status_name
                FROM tbl_appointment a
                LEFT JOIN tbl_patients p ON a.patient_id = p.patient_id
                LEFT JOIN tbl_doctors d ON a.doctor_id = d.doctor_id
                LEFT JOIN tbl_status s ON a.status_id = s.status_id
                ORDER BY a.appointment_id DESC');
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $docStmt = $this->conn->query("SELECT doctor_id as id, full_name as name FROM tbl_doctors");
            $doctors = $docStmt->fetchAll(PDO::FETCH_ASSOC);

            $this->respond(['success' => true, 'requests' => $requests, 'doctors' => $doctors]);
        } catch (PDOException $e) {
            $this->respond(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function confirmAppointment() {
        $appointment_id = $this->input['appointment_id'] ?? null;
        $doctor_id = $this->input['doctor_id'] ?? null;

        if (!$appointment_id || !$doctor_id) {
            $this->respond(['success' => false, 'message' => 'Missing appointment or doctor ID.']);
            return;
        }

        $reference = self::random_reference(); // Assuming limit_id is string/varchar. If it’s an int FK, handle differently.
        $status_id = 2; // confirmed

        try {
            $stmt = $this->conn->prepare('UPDATE appointment SET status_id=?, doctor_id=?, limit_id=? WHERE appointment_id=?');
            $stmt->execute([$status_id, $doctor_id, $reference, $appointment_id]);

            if ($stmt->rowCount() > 0) {
                $this->respond(['success' => true, 'reference' => $reference, 'message' => 'Appointment confirmed successfully']);
            } else {
                $this->respond(['success' => false, 'message' => 'Failed to confirm appointment.']);
            }
        } catch (PDOException $e) {
            $this->respond(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function respond($data) {
        echo json_encode($data);
        exit;
    }
}

$api = new AppointmentAPI($conn);
$api->handle();
