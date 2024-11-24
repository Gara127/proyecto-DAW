<?php
require_once("database.php");

function comprobarChangePass($con) {
    // Obtener los datos enviados desde el frontend
    $data = json_decode(file_get_contents("php://input"), true);

    // Verificar que todos los campos requeridos están presentes
    if (empty($data['email']) || empty($data['oldPassword']) || empty($data['newPassword'])) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Todos los campos son requeridos"]);
        return;
    }

    $email = $data['email'];
    $oldPassword = $data['oldPassword'];
    $newPassword = $data['newPassword'];

    // Verificar si el usuario existe y si la contraseña antigua es correcta
    $stmt = $con->prepare("SELECT pass FROM usuario WHERE nombre = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $row = $resultado->fetch_assoc();

    if (!$row || !password_verify($oldPassword, $row['pass'])) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Correo o contraseña antigua incorrectos"]);
        return;
    }

    // Encriptar la nueva contraseña
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // Actualizar la contraseña con la nueva
    $updateStmt = $con->prepare("UPDATE usuario SET pass = ? WHERE nombre = ?");
    $updateStmt->bind_param("ss", $hashedPassword, $email);

    if ($updateStmt->execute()) {
        echo json_encode(["mensaje" => "Contraseña actualizada con éxito"]);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(["error" => "Error al actualizar la contraseña: " . $updateStmt->error]);
    }
}
?>

