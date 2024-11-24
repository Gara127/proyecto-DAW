<?php
require_once("database.php");

function comprobarChangePass($con) {
    // Obtener los datos enviados desde el frontend
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['email']) || empty($data['oldPassword']) || empty($data['newPassword'])) {
        echo json_encode(["error" => "Todos los campos son requeridos"]);
        return;
    }

    $email = $data['email'];
    $oldPassword = $data['oldPassword'];
    $newPassword = $data['newPassword'];

    // Verificar si el usuario existe y la contraseña antigua es correcta
    $query = "SELECT * FROM usuario WHERE nombre = '$email' AND pass = '$oldPassword'";
    $resultado = mysqli_query($con, $query);

    if (mysqli_num_rows($resultado) === 0) {
        echo json_encode(["error" => "Correo o contraseña antigua incorrectos"]);
        return;
    }

    // Actualizar la contraseña con la nueva
    $updateQuery = "UPDATE usuario SET pass = '$newPassword' WHERE nombre = '$email'";
    if (mysqli_query($con, $updateQuery)) {
        echo json_encode(["mensaje" => "Contraseña actualizada con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar la contraseña: " . mysqli_error($con)]);
    }
}
?>
