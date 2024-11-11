<?php
require_once("database.php");
require_once("usuarios.php");

function comprobarRegistro($con) {

    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['nombre']) || empty($data['pass'])) {
        echo json_encode(["error" => "Nombre y contraseña son requeridos."]);
        return;
    }
    $nombre = $data['nombre'];
    $password = $data['pass'];
    $rol = "normal"; // O el rol que prefieras

    // Consulta para insertar el usuario
    $query = "INSERT INTO usuario (nombre, pass, rol) VALUES ('$nombre', '$password', '$rol')";
    
    if (mysqli_query($con, $query)) {
        echo json_encode(["mensaje" => "Usuario creado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al insertar usuario: " . mysqli_error($con)]);
    }
}
?>
