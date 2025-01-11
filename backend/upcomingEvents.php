<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


require_once("database.php");

$con = conectar();
if (!$con) {
    echo json_encode(["error" => "Error al conectar con la base de datos: " . mysqli_connect_error()]);
    exit;
}
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Verifica si el parámetro id_grupo está presente
        if (isset($_GET['id_grupo'])) {
            $id_grupo = intval($_GET['id_grupo']);
            $query = "SELECT * FROM upcoming_events WHERE id_grupo = ?";
            $stmt = $con->prepare($query);
    
            if (!$stmt) {
                ob_clean(); // Limpia cualquier salida previa
                echo json_encode(["error" => "Error al preparar la consulta: " . $con->error]);
                exit; // Detén la ejecución para evitar salidas adicionales
            }
    
            $stmt->bind_param("i", $id_grupo);
    
            if (!$stmt->execute()) {
                ob_clean();
                echo json_encode(["error" => "Error al ejecutar la consulta: " . $stmt->error]);
                $stmt->close();
                exit;
            }
    
            $result = $stmt->get_result();
    
            if ($result) {
                $eventos = $result->fetch_all(MYSQLI_ASSOC);
                ob_clean();
                echo json_encode($eventos); // Salida JSON válida
                exit;
            } else {
                ob_clean();
                echo json_encode(["error" => "Error al obtener los resultados: " . $con->error]);
                exit;
            }
    
            $stmt->close();
        } else {
            ob_clean();
            echo json_encode(["error" => "Faltan parámetros obligatorios"]);
            exit;
        }

    // Crear evento
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id_grupo'], $data['id_usuario'], $data['name'], $data['time'], $data['date'], $data['location'])) {
            echo json_encode(["error" => "Faltan parámetros"]);
            break;
        }

        $id_grupo = intval($data['id_grupo']);
        $id_usuario = intval($data['id_usuario']);
        $name = mysqli_real_escape_string($con, $data['name']);
        $time = $data['time'];
        $date = $data['date'];
        $location = mysqli_real_escape_string($con, $data['location']);
        $votes = 0;
        
        $query = "INSERT INTO upcoming_events (id_usuario, id_grupo, name, time, date, location, votes) VALUES (?,?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($con, $query);
        // $stmt->bind_param("iissss", $id_usuario, $id_grupo, $name, $time, $date, $location);
        mysqli_stmt_bind_param($stmt, "iissssi", $id_usuario, $id_grupo, $name, $time, $date, $location, $votes);
        

        if ($stmt->execute()) {
            echo json_encode(["mensaje" => "Evento creado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al crear el evento: " . $con->error]);
        }
        $stmt->close();
        break;

    // Actualizar votos
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id_usuario'], $data['id_voting'], $data['voto'])) {
            echo json_encode(["error" => "Faltan parámetros"]);
            break;
        }

        $id_usuario = intval($data['id_usuario']);
        $id_voting = intval($data['id_voting']);
        $voto = intval($data['voto']);

        $query = "INSERT INTO event_votes (id_usuario, id_voting, voto) VALUES (?, ?, ?)
                  ON DUPLICATE KEY UPDATE voto = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param("iiii", $id_usuario, $id_voting, $voto, $voto);

        if ($stmt->execute()) {
            echo json_encode(["mensaje" => "Voto registrado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al registrar el voto: " . $con->error]);
        }
        $stmt->close();
        break;

    // Eliminar voto
    case 'DELETE':
        if (isset($_GET['id_usuario'], $_GET['id_voting'])) {
            $id_usuario = intval($_GET['id_usuario']);
            $id_voting = intval($_GET['id_voting']);

            $query = "DELETE FROM event_votes WHERE id_usuario = ? AND id_voting = ?";
            $stmt = $con->prepare($query);
            $stmt->bind_param("ii", $id_usuario, $id_voting);

            if ($stmt->execute()) {
                echo json_encode(["mensaje" => "Voto eliminado correctamente"]);
            } else {
                echo json_encode(["error" => "Error al eliminar el voto: " . $con->error]);
            }
            $stmt->close();
        } else {
            echo json_encode(["error" => "Faltan parámetros"]);
        }
        break;
}

cerrar_conexion($con);
?>
