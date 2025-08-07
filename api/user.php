<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET");

class User
{
   public function register($data)
{
    include "db_connect.php";

    $fullName = trim($data['fullName'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = strtolower($data['role'] ?? '');

    if (!$fullName || !$email || !$password || !$role) {
        return ["success" => false, "message" => "All fields are required."];
    }

    // Check if email exists
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        return ["success" => false, "message" => "Email already exists."];
    }

    // Insert into users
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$fullName, $email, $hashed, $role]);
    $userId = $conn->lastInsertId();

    // Insert into role-specific table
    try {
             switch ($role) {
            case 'doctor':
                $conn->prepare("INSERT INTO doctor (user_id) VALUES (?)")->execute([$userId]);
                break;
            case 'secretary':
                $conn->prepare("INSERT INTO secretary (user_id) VALUES (?)")->execute([$userId]);
                break;
            case 'patient':
                // Insert into patients with matching patient_id and full_name
                $conn->prepare("INSERT INTO patients (patient_id, full_name) VALUES (?, ?)")->execute([$userId, $fullName]);
                break;
            default:
                return ["success" => false, "message" => "Unknown user role."];
        }

        return ["success" => true, "message" => ucfirst($role) . " registration successful."];
    } catch (PDOException $e) {
        return ["success" => false, "message" => "Role table insert failed: " . $e->getMessage()];
    }
}

    public function login($data)
    {
        include "db_connect.php";

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            return ["success" => false, "message" => "Email and password required."];
        }

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            return [
                "success" => true,
                "role" => $user['role'],
                "fullName" => $user['full_name'],
                "message" => "Login successful as " . $user['role']
            ];
        }

        return ["success" => false, "message" => "Invalid login credentials."];
    }
}

$user = new User();

// Read raw JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Get operation from URL (?operation=login or ?operation=register)
$operation = $_GET['operation'] ?? '';

if ($operation === "register") {
    echo json_encode($user->register($data));
} elseif ($operation === "login") {
    echo json_encode($user->login($data));
} else {
    echo json_encode(["success" => false, "message" => "Invalid operation."]);
}
