<?php
require_once("database.php");
require_once("usuarios.php");

function comprobarLogin($con) {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = mysqli_real_escape_string($con, $data['username']);
    $password = mysqli_real_escape_string($con, $data['password']);

    $query = "SELECT * FROM usuario WHERE nombre = '$username' AND pass = '$password'";
    $result = mysqli_query($con, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        // Obtiene los datos del usuario
        $row = mysqli_fetch_assoc($result);
        $rol = $row['rol'];
        $id_del_usuario = $row['id_usuario'];
        $nombre = $row['nombre'];

        // Asignamos las variables de sesión
        $_SESSION['logged_in'] = true;
        $_SESSION['user_id'] = $id_del_usuario;
        $_SESSION['rol'] = $rol;

        // Devuelve el JSON incluyendo el id_usuario
        echo json_encode([
            "status" => "success",
            "message" => "Inicio de sesión exitoso",
            "id_usuario" => $id_del_usuario, // Incluye el id_usuario
            "rol" => $rol,                  // Incluye el rol
            "nombre" => $nombre             // Incluye el nombre
        ]);
    } else {
        http_response_code(401); // Código 401 para credenciales incorrectas
        echo json_encode([
            "status" => "error",
            "message" => "Credenciales incorrectas"
        ]);
    }
}
?>
