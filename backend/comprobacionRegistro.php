<?php
require_once("database.php");
require_once("usuarios.php");

function comprobarRegistro($con, $data) {
    // Decodifica los datos enviados por el cliente (ya está decodificado en el controlador, no es necesario aquí)
    // $data = json_decode(file_get_contents("php://input"), true);

    // Verifica si los datos necesarios están presentes
    if (empty($data['nombre']) || empty($data['pass'])) {
        echo json_encode(["error" => "Nombre y contraseña son requeridos."]);
        return;
    }

    $nombre = $data['nombre'];
    $password = $data['pass'];
    $rol = "user"; // O el rol que prefieras

    // Verificación de si el usuario ya existe
    $query_check = "SELECT * FROM usuario WHERE nombre = ?";
    $stmt_check = mysqli_prepare($con, $query_check);
    mysqli_stmt_bind_param($stmt_check, "s", $nombre);
    mysqli_stmt_execute($stmt_check);
    $result_check = mysqli_stmt_get_result($stmt_check);

    if (mysqli_num_rows($result_check) > 0) {
        // Si el usuario ya existe, devolver un error
        echo json_encode(["error" => "El usuario ya existe."]);
        return; // Salir de la función si el usuario ya existe
    }

    // Inserción utilizando una consulta preparada
    $query = "INSERT INTO usuario (nombre, pass, rol) VALUES (?, ?, ?)";
    $stmt = mysqli_prepare($con, $query);
    mysqli_stmt_bind_param($stmt, "sss", $nombre, $password, $rol);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["mensaje" => "Usuario creado con éxito"]);
    } else {
        $error_code = mysqli_errno($con);
        if ($error_code == 1062) {
            echo json_encode(["error" => "El nombre ya está registrado."]);
        } else {
            echo json_encode(["error" => "Error al insertar usuario: " . mysqli_error($con)]);
        }
    }
}
?>

