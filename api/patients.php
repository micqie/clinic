<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

class PatientsAPI {
    private $conn;
    private $method;
    private $operation;
    private $input;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->input = json_decode(file_get_contents('php://input'), true);
        $this->operation = $_GET['operation'] ?? '';
    }

    public function handle() {
        switch ($this->operation) {
            case 'list':
                $this->listPatients();
                break;
            case 'view':
                $this->viewPatient();
                break;
            case 'update':
                if ($this->method === 'POST') {
                    $this->updatePatient();
                } else {
                    $this->respond(['success' => false, 'message' => 'Invalid method.']);
                }
                break;
            default:
                $this->respond(['success' => false, 'message' => 'Invalid operation.']);
        }
    }

    private function listPatients() {
        $result = $this->conn->query('SELECT * FROM patients');
        $patients = [];
        while ($row = $result->fetch_assoc()) {
            $patients[] = $row;
        }
        $this->respond($patients);
    }

    private function viewPatient() {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->respond(['success' => false, 'message' => 'Missing patient id.']);
        }
        $stmt = $this->conn->prepare('SELECT * FROM patients WHERE patient_id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $patient = $result->fetch_assoc();
        if ($patient) {
            $this->respond($patient);
        } else {
            $this->respond(['success' => false, 'message' => 'Patient not found.']);
        }
    }

    private function updatePatient() {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->respond(['success' => false, 'message' => 'Missing patient id.']);
        }
        $data = $this->input;
        $stmt = $this->conn->prepare('UPDATE patients SET full_name=?, email=?, birthdate=?, sex=?, contact_number=?, address=? WHERE patient_id=?');
        $stmt->bind_param(
            'ssssssi',
            $data['full_name'],
            $data['email'],
            $data['birthdate'],
            $data['sex'],
            $data['contact_number'],
            $data['address'],
            $id
        );
        if ($stmt->execute()) {
            $this->respond(['success' => true, 'message' => 'Patient updated.']);
        } else {
            $this->respond(['success' => false, 'message' => 'Failed to update patient.']);
        }
    }

    private function respond($data) {
        echo json_encode($data);
        exit;
    }
}

$api = new PatientsAPI($conn);
$api->handle();
