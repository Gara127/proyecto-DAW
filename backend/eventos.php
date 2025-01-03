<?php
// Configurar los encabezados para respuestas JSON y permitir el acceso desde cualquier origen
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

// Archivo de conexión a la base de datos
require_once("database.php");

// Se establece conexión con la base de datos
$con = conectar();

// Obtener el método HTTP utilizado en la solicitud
$method = $_SERVER['REQUEST_METHOD'];

// Manejar la solicitud según el método HTTP
switch ($method) {

    // Obtener todos los eventos
    case 'GET':
        $fecha_min = isset($_GET['fecha_min']) ? $_GET['fecha_min'] : null;
        $fecha_max = isset($_GET['fecha_max']) ? $_GET['fecha_max'] : null;
        $solo_caducados = isset($_GET['solo_caducados']) ? boolval($_GET['solo_caducados']) : false;

        $query = "SELECT e.id_evento, e.title, e.date, e.time, e.location, e.description, 
                         GROUP_CONCAT(u.nombre) AS participants
                  FROM eventos e
                  LEFT JOIN evento_participantes ep ON e.id_evento = ep.id_evento
                  LEFT JOIN usuario u ON ep.id_usuario = u.id_usuario";

        $where_clauses = [];
        if ($fecha_min) {
            $where_clauses[] = "e.date >= '$fecha_min'";
        }
        if ($fecha_max) {
            $where_clauses[] = "e.date <= '$fecha_max'";
        }
        if ($solo_caducados) {
            $today = date('Y-m-d');
            $where_clauses[] = "e.date < '$today'";
        }

        if (!empty($where_clauses)) {
            $query .= " WHERE " . implode(" AND ", $where_clauses);
        }

        $query .= " GROUP BY e.id_evento";

        $result = mysqli_query($con, $query);

        if ($result) {
            $eventos = mysqli_fetch_all($result, MYSQLI_ASSOC);
            echo json_encode($eventos);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener eventos: " . mysqli_error($con)]);
        }
        break;

    // Crear un nuevo evento
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true); // Obtener datos del cuerpo de la solicitud

        // Validar los campos obligatorios
        if (!empty($data['title']) && !empty($data['date']) && !empty($data['time'])) {
            // Escapar datos para prevenir inyección SQL
            $title = mysqli_real_escape_string($con, $data['title']);
            $date = mysqli_real_escape_string($con, $data['date']);
            $time = mysqli_real_escape_string($con, $data['time']);
            $location = mysqli_real_escape_string($con, $data['location'] ?? '');
            $description = mysqli_real_escape_string($con, $data['description'] ?? '');

            // Insertar el evento en la base de datos
            $query = "INSERT INTO eventos (title, date, time, location, description) 
                      VALUES ('$title', '$date', '$time', '$location', '$description')";

            if (mysqli_query($con, $query)) {
                $id_evento = mysqli_insert_id($con); // Obtener el ID del evento recién creado

                // Agregar participantes al evento
                if (!empty($data['participants'])) {
                    foreach ($data['participants'] as $id_usuario) {
                        $id_usuario = (int)$id_usuario;
                        $relacion_query = "INSERT INTO evento_participantes (id_evento, id_usuario) 
                                           VALUES ($id_evento, $id_usuario)";
                        if (!mysqli_query($con, $relacion_query)) {
                            http_response_code(500); // Error al agregar participantes
                            echo json_encode([
                                "success" => false,
                                "message" => "Error al agregar participante: " . mysqli_error($con)
                            ]);
                            exit;
                        }
                    }
                }

                // Responder con éxito
                echo json_encode([
                    "success" => true,
                    "message" => "Evento creado con éxito",
                    "id_evento" => $id_evento
                ]);
            } else {
                http_response_code(500); // Error interno del servidor
                echo json_encode([
                    "success" => false,
                    "message" => "Error al crear el evento: " . mysqli_error($con)
                ]);
            }
        } else {
            http_response_code(400); // Solicitud incorrecta
            echo json_encode([
                "success" => false,
                "message" => "Datos incompletos para crear un evento"
            ]);
        }
        break;

    // Eliminar un evento
    case 'DELETE':
        // Verificar si se especificó el ID del evento
        if (isset($_GET['id_evento'])) {
            $id_evento = intval($_GET['id_evento']);
            $query = "DELETE FROM eventos WHERE id_evento = $id_evento";

            if (mysqli_query($con, $query)) {
                echo json_encode(["success" => true, "message" => "Evento eliminado con éxito."]);
            } else {
                http_response_code(500); // Error interno del servidor
                echo json_encode(["success" => false, "message" => "Error al eliminar el evento: " . mysqli_error($con)]);
            }
        } else {
            http_response_code(400); // Solicitud incorrecta
            echo json_encode(["success" => false, "message" => "ID del evento no especificado."]);
        }
        break;

    // Actualizar un evento
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true); // Obtener datos del cuerpo de la solicitud

        // Validar los campos obligatorios
        if (!empty($data['id_evento']) && !empty($data['title']) && !empty($data['date']) && !empty($data['time'])) {
            $id_evento = intval($data['id_evento']);
            $title = mysqli_real_escape_string($con, $data['title']);
            $date = mysqli_real_escape_string($con, $data['date']);
            $time = mysqli_real_escape_string($con, $data['time']);
            $location = mysqli_real_escape_string($con, $data['location'] ?? '');
            $description = mysqli_real_escape_string($con, $data['description'] ?? '');

            // Actualizar el evento en la base de datos
            $query = "UPDATE eventos SET title = '$title', date = '$date', time = '$time', location = '$location', description = '$description' WHERE id_evento = $id_evento";

            if (mysqli_query($con, $query)) {
                echo json_encode(["success" => true, "message" => "Evento actualizado con éxito."]);
            } else {
                http_response_code(500); // Error interno del servidor
                echo json_encode(["success" => false, "message" => "Error al actualizar el evento: " . mysqli_error($con)]);
            }
        } else {
            http_response_code(400); // Solicitud incorrecta
            echo json_encode(["success" => false, "message" => "Datos incompletos para actualizar el evento."]);
        }
        break;
}

// Cerrar conexión con la base de datos
cerrar_conexion($con);
?>
