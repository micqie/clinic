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
        $date = $this->input['date'] ?? null;
        $patient_id = $this->input['patient_id'] ?? 1; // Use provided patient_id or fallback to 1
        if (!$date) {
            $this->respond(['success' => false, 'message' => 'Date required.']);
        }
        $status_id = 1; // pending
        $stmt = $this->conn->prepare('INSERT INTO appointment (patient_id, appointment_date, status_id) VALUES (?, ?, ?)');
        $stmt->bind_param('isi', $patient_id, $date, $status_id);
        if ($stmt->execute()) {
            $this->respond(['success' => true, 'status' => 'pending']);
        } else {
            $this->respond(['success' => false, 'message' => 'Failed to request appointment.', 'error' => $stmt->error]);
        }
    }

    private function listAppointments() {
        $result = $this->conn->query('SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name, s.status_name FROM appointment a LEFT JOIN patients p ON a.patient_id = p.patient_id LEFT JOIN doctor d ON a.doctor_id = d.doctor_id LEFT JOIN status s ON a.status_id = s.status_id ORDER BY a.appointment_id DESC');
        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }
        $doctors = [];
        $docres = $this->conn->query("SELECT doctor_id as id, full_name as name FROM doctor");
        while ($doc = $docres->fetch_assoc()) {
            $doctors[] = $doc;
        }
        $this->respond(['success' => true, 'requests' => $requests, 'doctors' => $doctors]);
    }

    private function confirmAppointment() {
        $appointment_id = $this->input['appointment_id'] ?? null;
        $doctor_id = $this->input['doctor_id'] ?? null;
        if (!$appointment_id || !$doctor_id) {
            $this->respond(['success' => false, 'message' => 'Missing appointment or doctor.']);
        }
        $reference = self::random_reference();
        $status_id = 2; // confirmed
        $stmt = $this->conn->prepare('UPDATE appointment SET status_id=?, doctor_id=?, limit_id=? WHERE appointment_id=?');
        $stmt->bind_param('iiii', $status_id, $doctor_id, $reference, $appointment_id);
        if ($stmt->execute()) {
            $this->respond(['success' => true, 'reference' => $reference]);
        } else {
            $this->respond(['success' => false, 'message' => 'Failed to confirm appointment.', 'error' => $stmt->error]);
        }
    }

    private function respond($data) {
        echo json_encode($data);
        exit;
    }
}

$api = new AppointmentAPI($conn);
$api->handle();
