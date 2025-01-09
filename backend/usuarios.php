<?php
session_start();
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
        }
        // Verificar si se proporciona el parámetro 'init'
        elseif (isset($_GET['init']) && boolval($_GET['init'])) {
            init();
            echo json_encode(["mensaje" => "Backend: BBDD iniciada..."]);
        }
        // Verificar si se proporciona el parámetro 'nombre' para buscar por nombre de usuario
        elseif (isset($_GET['nombre'])) {
            $userName = mysqli_real_escape_string($con, $_GET['nombre']); // Evitar inyección SQL
            $query = "SELECT * FROM usuario WHERE nombre = '$userName'"; // Buscar por nombre
            $resultado = mysqli_query($con, $query);

            if ($resultado && mysqli_num_rows($resultado) > 0) {
                echo json_encode(mysqli_fetch_assoc($resultado));
            } else {
                echo json_encode(["error" => "Usuario no encontrado"]);
            }
        }
        // Si no se proporciona id_usuario, nombre o init, obtener todos los usuarios
        else {
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

            $nombre = mysqli_real_escape_string($con, $data['nombre']);
            if (isset($data['nombre'])) {
            $query = "SELECT nombre FROM usuario WHERE nombre = '$nombre'";
            $resultado = mysqli_query($con, $query);

                if (mysqli_num_rows($resultado) > 0) {
                    echo json_encode(["error" => "El nombre de usuario ya existe"]);
                } else {
                    comprobarRegistro($con, $data);
                }
            } else {
            echo json_encode(["error" => "Falta el nombre de usuario en los datos."]);
            }
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
     
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
    
        // Verifica si se está intentando cambiar la contraseña (puedes usar un campo "action" o directamente los campos oldPassword y newPassword)
        if (isset($data['email']) && isset($data['oldPassword']) && isset($data['newPassword'])) {
            // Cambio de contraseña
    
            $email = mysqli_real_escape_string($con, $data['email']);
            $oldPassword = mysqli_real_escape_string($con, $data['oldPassword']);
            $newPassword = mysqli_real_escape_string($con, $data['newPassword']);
    
            // Verifica que el usuario exista con el email y la oldPassword
            $queryUser = "SELECT id_usuario FROM usuario WHERE nombre = '$email' AND pass = '$oldPassword'";
            $resultUser = mysqli_query($con, $queryUser);
    
            if ($resultUser && mysqli_num_rows($resultUser) > 0) {
                // Si el usuario existe, obtén su id_usuario
                $row = mysqli_fetch_assoc($resultUser);
                $id_usuario = $row['id_usuario'];
    
                // Actualiza la contraseña
                $queryUpdatePass = "UPDATE usuario SET pass = '$newPassword' WHERE id_usuario = $id_usuario";
                if (mysqli_query($con, $queryUpdatePass)) {
                    echo json_encode(["mensaje" => "Contraseña actualizada con éxito"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al actualizar la contraseña: " . mysqli_error($con)]);
                }
            } else {
                http_response_code(401); // No autorizado
                echo json_encode(["error" => "Email o contraseña anterior no coinciden"]);
            }
    
        } else if (isset($_GET['id_usuario'])) {
            // Logica existente para actualizar datos generales del usuario
            $id_usuario = intval($_GET['id_usuario']);
    
            if (!$data || !isset($data['nombre']) || !isset($data['pass']) || !isset($data['rol'])) {
                http_response_code(400);
                echo json_encode(["error" => "Datos no válidos"]);
                exit;
            }
    
            $nombre = mysqli_real_escape_string($con, $data['nombre']);
            $pass = mysqli_real_escape_string($con, $data['pass']);
            $rol = mysqli_real_escape_string($con, $data['rol']);
    
            $query = "UPDATE usuario SET nombre = '$nombre', pass = '$pass', rol = '$rol' WHERE id_usuario = $id_usuario";
            if (mysqli_query($con, $query)) {
                echo json_encode(["mensaje" => "Usuario actualizado con éxito"]);
            } else {
                echo json_encode(["error" => "Error al actualizar usuario: " . mysqli_error($con)]);
            }
    
        } else {
            http_response_code(400);
            echo json_encode(["error" => "No se pudo determinar la acción a realizar"]);
        }
        break;
}

// Cerrar conexión
cerrar_conexion($con);
?>