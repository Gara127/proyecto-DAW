<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once("database.php");

$con = conectar();
if (!$con) {
    echo json_encode(["error" => "Error al conectar con la base de datos: " . mysqli_connect_error()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    // Obtener encuestas
    case 'GET':
        if (isset($_GET['id_evento'])) {
            // Filtrar encuestas por id_evento
            $id_evento = intval($_GET['id_evento']);
            $query = "
                SELECT ue.id_voting, ue.id_evento, ue.name, ue.date, ue.time, ue.location, 
                       COALESCE(SUM(ev.totalVotos), 0) AS total_votos
                FROM upcoming_events ue
                LEFT JOIN event_votes ev ON ue.id_voting = ev.id_voting
                WHERE ue.id_evento = ?
                GROUP BY ue.id_voting;
            ";
            $stmt = $con->prepare($query);
    
            if (!$stmt) {
                echo json_encode(["error" => "Error al preparar la consulta: " . $con->error]);
                exit;
            }
    
            $stmt->bind_param("i", $id_evento);
            $stmt->execute();
            $result = $stmt->get_result();
    
            $encuestas = $result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($encuestas);
            $stmt->close();
        } else {
            // Obtener todas las encuestas
            $query = "
                SELECT ue.id_voting, ue.id_evento, ue.name, ue.date, ue.time, ue.location, 
                       COALESCE(SUM(ev.totalVotos), 0) AS total_votos
                FROM upcoming_events ue
                LEFT JOIN event_votes ev ON ue.id_voting = ev.id_voting
                GROUP BY ue.id_voting;
            ";
            $result = mysqli_query($con, $query);
    
            if ($result) {
                $encuestas = mysqli_fetch_all($result, MYSQLI_ASSOC);
                echo json_encode($encuestas);
            } else {
                echo json_encode(["error" => "Error al obtener encuestas: " . mysqli_error($con)]);
            }
        }
        break;
    
    // Crear una nueva encuesta
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        error_log("Datos recibidos en POST: " . json_encode($data));

        if (!isset($data['id_usuario'], $data['id_evento'], $data['name'], $data['time'], $data['date'], $data['location'])) {
            error_log("Faltan parámetros: " . json_encode($data));
            http_response_code(400);
            echo json_encode(["error" => "Faltan parámetros"]);
            break;
}

        $id_usuario = intval($data['id_usuario']);
        $id_evento = intval($data['id_evento']);
        $name = mysqli_real_escape_string($con, $data['name']);
        $time = $data['time'];
        $date = $data['date'];
        $location = mysqli_real_escape_string($con, $data['location']);

        $query = "INSERT INTO upcoming_events (id_usuario, id_evento, name, time, date, location) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $con->prepare($query);

        if (!$stmt) {
            echo json_encode(["error" => "Error al preparar la consulta: " . $con->error]);
            exit;
        }

        $stmt->bind_param("iissss", $id_usuario, $id_evento, $name, $time, $date, $location);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Encuesta creada correctamente", "id_voting" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear la encuesta: " . $stmt->error]);
        }

        $stmt->close();
        break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['id_usuario'], $data['id_voting'], $data['voto'])) {
                echo json_encode(["error" => "Faltan parámetros"]);
                break;
            }
        
            $id_usuario = intval($data['id_usuario']);
            $id_voting = intval($data['id_voting']);
            $voto = intval($data['voto']);
        
            // Si el voto es -1, restamos el voto
            $query = "INSERT INTO event_votes (id_usuario, id_voting, totalVotos) 
                      VALUES (?, ?, ?) 
                      ON DUPLICATE KEY UPDATE totalVotos = totalVotos + ?";
            $stmt = $con->prepare($query);
        
            if (!$stmt) {
                echo json_encode(["error" => "Error al preparar la consulta: " . $con->error]);
                exit;
            }
        
            $stmt->bind_param("iiii", $id_usuario, $id_voting, $voto, $voto);
        
            if ($stmt->execute()) {
                echo json_encode(["mensaje" => "Voto registrado correctamente"]);
            } else {
                echo json_encode(["error" => "Error al registrar el voto: " . $stmt->error]);
            }
        
            $stmt->close();
            break;

    case 'DELETE':
    if (isset($_GET['id_usuario'], $_GET['id_voting'])) {
        $id_usuario = intval($_GET['id_usuario']);
        $id_voting = intval($_GET['id_voting']);
    
        // Log para verificar parámetros recibidos
        error_log("Eliminar voto - id_usuario: $id_usuario, id_voting: $id_voting");
    
        // Ejecutar la consulta DELETE
        $query = "UPDATE event_votes SET totalVotos = totalVotos - 1
                  WHERE id_usuario = ? AND id_voting = ? AND totalVotos > 0";
        $stmt = $con->prepare($query);
    
        if (!$stmt) {
            echo json_encode(["error" => "Error al preparar la consulta: " . $con->error]);
            exit;
        }
    
        $stmt->bind_param("ii", $id_usuario, $id_voting);
    
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["mensaje" => "Voto eliminado correctamente"]);
            } else {
                echo json_encode(["error" => "No se encontró el voto para eliminar."]);
            }
        } else {
            echo json_encode(["error" => "Error al ejecutar la consulta: " . $stmt->error]);
        }
    
        $stmt->close();
    } else {
        echo json_encode(["error" => "Faltan parámetros"]);
    }
    break;

        
        
    
}

cerrar_conexion($con);

