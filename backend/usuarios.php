<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once("database.php");
require_once("comprobacionDatos.php"); 
require_once("comprobacionRegistro.php"); 

$con = conectar();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        // Verificar si se proporciona el parámetro id_usuario en la URL
        if (isset($_GET['id_usuario'])) {
            $id_usuario = intval($_GET['id_usuario']);
            $query = "SELECT * FROM usuario WHERE id_usuario = $id_usuario";
            $resultado = mysqli_query($con, $query);

            if ($resultado && mysqli_num_rows($resultado) > 0) {
                echo json_encode(mysqli_fetch_assoc($resultado));
            } else {
                echo json_encode(["error" => "Usuario no encontrado"]);
            }
        } elseif (isset($_GET['init']) && boolval($_GET['init'])) {
            init();
        } else {
            // Obtener todos los usuarios si no se proporciona id_usuario
            $usuarios = mysqli_query($con, "SELECT * FROM usuario");
            $resultado = mysqli_fetch_all($usuarios, MYSQLI_ASSOC);
            echo json_encode($resultado);
        }
        break;
        
    case 'POST':
        $data =json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['action']) && $data['action'] === 'login') {
            comprobarLogin($con);
        } elseif (isset($data['action']) && $data['action']=== 'register') {
            comprobarRegistro($con);
        } else {
            echo json_encode(["error" => "Acción no válida. Debe ser 'login' o 'register'."]);
        }
        break;
    
    case 'DELETE':
        // No es necesario decodificar el JSON aquí porque el ID está en la URL
        if (!isset($_SERVER['PATH_INFO']) || empty($_SERVER['PATH_INFO'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID de usuario no proporcionado."]);
            exit;
        }
    
        // Extrae el ID del usuario de la URL
        $id_usuario = intval(basename($_SERVER['PATH_INFO']));
    
        // Primero, verificar cuántos usuarios admin hay en la base de datos
        $query = "SELECT COUNT(*) as admin_count FROM usuario WHERE rol = 'admin'";
        $result = mysqli_query($con, $query);
        $row = mysqli_fetch_assoc($result);
        
        if ($row['admin_count'] <= 1)  {
            $query = "SELECT id_usuario FROM usuario WHERE rol = 'admin'";
            $result = mysqli_query($con, $query);
            $row = mysqli_fetch_assoc($result);

            if ($row['id_usuario'] == $id_usuario) {
                http_response_code(403); // Forbidden
                echo json_encode(["error" => "No se puede eliminar el último usuario con rol admin."]);
                exit;
            }
        }
    
        // Ejecuta la consulta de eliminación
        $query = "DELETE FROM usuario WHERE id_usuario = $id_usuario";
        if (mysqli_query($con, $query)) {
            echo json_encode(["mensaje" => "Usuario eliminado con éxito"]);
        } else {
            echo json_encode(["error" => "Error al eliminar usuario: " . mysqli_error($con)]);
        }
        break;
     
    case 'PUT': // actualizar

        //MANEJO  DE CAMBIO DE CONTRASEÑA

        // Decodifica los datos JSON recibidos
        $data = json_decode(file_get_contents("php://input"), true);

        // **Manejo de cambio de contraseña**
        if (isset($data['email']) && isset($data['oldPassword']) && isset($data['newPassword'])) {
        $email = $data['email'];
        $oldPassword = $data['oldPassword'];
        $newPassword = $data['newPassword'];

        // Verifica si el email y la contraseña antigua coinciden
        $query = "SELECT * FROM usuario WHERE nombre = '$email' AND pass = '$oldPassword'";
        $resultado = mysqli_query($con, $query);

        if (mysqli_num_rows($resultado) === 0) {
            http_response_code(400);
            echo json_encode(["error" => "Correo o contraseña actual incorrectos"]);
            exit;
        }

        // Actualiza la contraseña
        $updateQuery = "UPDATE usuario SET pass = '$newPassword' WHERE nombre = '$email'";
        if (mysqli_query($con, $updateQuery)) {
            echo json_encode(["mensaje" => "Contraseña cambiada con éxito"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar la contraseña: " . mysqli_error($con)]);
        }
        exit; // Importante: Salir después de manejar el cambio de contraseña
    }
        //FIN MANEJO  CAMBIO DE CONTRASEÑA


        // Obtiene el ID del usuario desde la URL
        if (isset($_GET['id_usuario'])) {
            $id_usuario = intval($_GET['id_usuario']);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "ID de usuario no proporcionado"]);
            exit;
        }

        // Decodifica los datos JSON recibidos
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['nombre']) || !isset($data['pass']) || !isset($data['rol'])) {
            http_response_code(400);
            echo json_encode(["error" => "Datos no válidos"]);
            exit;
        }

        // Obtiene los valores de nombre, contraseña y rol
        $nombre = $data['nombre'];
        $pass = $data['pass'];
        $rol = $data['rol'];

        // Ejecuta la consulta de actualización
        $query = "UPDATE usuario SET nombre = '$nombre', pass = '$pass', rol = '$rol' WHERE id_usuario = $id_usuario";
        if (mysqli_query($con, $query)) {
            echo json_encode(["mensaje" => "Usuario actualizado con éxito"]);
        } else {
            echo json_encode(["error" => "Error al actualizar usuario: " . mysqli_error($con)]);
        }
        break;

 
}            
        

// Cerrar conexión
cerrar_conexion($con);
?>
