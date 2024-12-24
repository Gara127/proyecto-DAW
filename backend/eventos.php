<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once("database.php");

$con = conectar();
$method = $_SERVER['REQUEST_METHOD'];


switch ($method) {

    case 'GET':
        
        // Consulta para obtener todos los eventos con sus participantes
        $query = "SELECT e.id_evento, e.title, e.date, e.time, e.location, e.description, 
                         GROUP_CONCAT(u.nombre) AS participants
                  FROM eventos e
                  LEFT JOIN evento_participantes ep ON e.id_evento = ep.id_evento
                  LEFT JOIN usuario u ON ep.id_usuario = u.id_usuario
                  GROUP BY e.id_evento";
        $result = mysqli_query($con, $query);

        if ($result) {
            $eventos = mysqli_fetch_all($result, MYSQLI_ASSOC);
            echo json_encode($eventos); // Devuelve un array JSON válido
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener eventos: " . mysqli_error($con)]);
        }
        break;
    
        
    case 'POST':

        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data['title']) && !empty($data['date']) && !empty($data['time'])) {
            $title = mysqli_real_escape_string($con, $data['title']);
            $date = mysqli_real_escape_string($con, $data['date']);
            $time = mysqli_real_escape_string($con, $data['time']);
            $location = mysqli_real_escape_string($con, $data['location'] ?? '');
            $description = mysqli_real_escape_string($con, $data['description'] ?? '');

            // Inserta el evento en la tabla `eventos`
            $query = "INSERT INTO eventos (title, date, time, location, description) 
                      VALUES ('$title', '$date', '$time', '$location', '$description')";

            if (mysqli_query($con, $query)) {
                $id_evento = mysqli_insert_id($con);

                // Inserta los participantes en `evento_participantes`
                if (!empty($data['participants'])) {
                    foreach ($data['participants'] as $id_usuario) {
                        $id_usuario = (int)$id_usuario;
                        $relacion_query = "INSERT INTO evento_participantes (id_evento, id_usuario) 
                                           VALUES ($id_evento, $id_usuario)";
                        if (!mysqli_query($con, $relacion_query)) {
                            http_response_code(500);
                            echo json_encode([
                                "success" => false,
                                "message" => "Error al agregar participante: " . mysqli_error($con)
                            ]);
                            exit;
                        }
                    }
                }
                echo json_encode([
                    "success" => true,
                    "message" => "Evento creado con éxito",
                    "id_evento" => $id_evento
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    "success" => false,
                    "message" => "Error al crear el evento: " . mysqli_error($con)
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Datos incompletos para crear un evento"
            ]);
        }
        break;
    
    case 'DELETE':
        
        break;
     
    case 'PUT': 
        break;

 
}            
        
cerrar_conexion($con);
?>
