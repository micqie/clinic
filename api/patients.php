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
        try {
            $stmt = $this->conn->query('SELECT * FROM tbl_patients');
            $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->respond($patients);
        } catch (PDOException $e) {
            $this->respond(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function viewPatient() {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->respond(['success' => false, 'message' => 'Missing patient id.']);
            return;
        }

        try {
            $stmt = $this->conn->prepare('SELECT * FROM tbl_patients WHERE patient_id = ?');
            $stmt->execute([$id]);
            $patient = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($patient) {
                $this->respond($patient);
            } else {
                $this->respond(['success' => false, 'message' => 'Patient not found.']);
            }
        } catch (PDOException $e) {
            $this->respond(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    }

    private function updatePatient() {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->respond(['success' => false, 'message' => 'Missing patient id.']);
            return;
        }

        $data = $this->input;

        try {
            $stmt = $this->conn->prepare('UPDATE tbl_patients SET full_name=?, email=?, birthdate=?, sex=?, contact_number=?, address=? WHERE patient_id=?');
            $stmt->execute([
                $data['full_name'],
                $data['email'],
                $data['birthdate'],
                $data['sex'],
                $data['contact_number'],
                $data['address'],
                $id
            ]);

            if ($stmt->rowCount() > 0) {
                $this->respond(['success' => true, 'message' => 'Patient updated.']);
            } else {
                $this->respond(['success' => false, 'message' => 'Patient not found or no changes made.']);
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

$api = new PatientsAPI($conn);
$api->handle();
