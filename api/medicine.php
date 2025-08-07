<?php
require_once 'db_connect.php';

class Medicine {
    private $conn;

    public function setConnection($pdo) {
        $this->conn = $pdo;
    }

    public function getAll() {
        $stmt = $this->conn->prepare("SELECT * FROM medicines ORDER BY id DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function add($data) {
        $stmt = $this->conn->prepare("INSERT INTO medicines (name, description, quantity, price) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['description'],
            $data['quantity'],
            $data['price']
        ]);
        return ['success' => true, 'message' => 'Medicine added successfully.'];
    }

    public function update($data) {
        $stmt = $this->conn->prepare("UPDATE medicines SET name = ?, description = ?, quantity = ?, price = ? WHERE id = ?");
        $stmt->execute([
            $data['name'],
            $data['description'],
            $data['quantity'],
            $data['price'],
            $data['id']
        ]);
        return ['success' => true, 'message' => 'Medicine updated successfully.'];
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM medicines WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

// Router
$operation = $_GET['operation'] ?? '';

$medicine = new Medicine();
$medicine->setConnection($conn);

header('Content-Type: application/json');

switch ($operation) {
    case 'list':
        echo json_encode(['medicines' => $medicine->getAll()]);
        break;
    case 'add':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode($medicine->add($data));
        break;
    case 'get':
        $id = $_GET['id'] ?? 0;
        echo json_encode($medicine->getById($id));
        break;
    case 'update':
        $data = json_decode(file_get_contents("php://input"), true);
        echo json_encode($medicine->update($data));
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid operation.']);
        break;
}
