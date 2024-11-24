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
        echo json_encode(["status" => "success", "message" => "Inicio de sesión exitoso"]);
    } else {
        http_response_code(401); // Código 401 para credenciales incorrectas
        echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
    }
}
?>
