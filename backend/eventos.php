<?php
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
// Configurar los encabezados para respuestas JSON y permitir el acceso desde cualquier origen
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Archivo de conexión a la base de datos
require_once("database.php");

// Carga automáticamente las dependencias instaladas
if (!file_exists('vendor/autoload.php')) {
    die("Error: No se encuentra el archivo vendor/autoload.php");
}
require 'vendor/autoload.php';


// Se establece conexión con la base de datos
$con = conectar();

// Obtener el método HTTP utilizado en la solicitud
$method = $_SERVER['REQUEST_METHOD'];

// Instanciar la clase PHPMailer
$mail = new PHPMailer(true);

// Tiempo máximo de espera en segundos
$mail->Timeout = 30;

// Para mostrar logs de depuración en local
// $mail->SMTPDebug = 2;

// Manejar la solicitud según el método HTTP
switch ($method) {

    // Obtener todos los eventos
    case 'GET':
        if (isset($_GET['id_usuario'])) {
            $id_usuario = intval($_GET['id_usuario']);
            
            // Consultar eventos donde el usuario es creador o participante
            $query = "SELECT 
                e.id_evento, 
                e.title, 
                e.date, 
                e.time, 
                e.location, 
                e.description, 
                COALESCE(e.checklist, '[]') AS checklist, 
                (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('nombre', u.nombre)), ']') 
                 FROM evento_participantes ep 
                 JOIN usuario u ON ep.id_usuario = u.id_usuario 
                 WHERE ep.id_evento = e.id_evento) AS participants
            FROM eventos e
            LEFT JOIN evento_participantes ep ON e.id_evento = ep.id_evento
            WHERE e.id_usuario = $id_usuario OR ep.id_usuario = $id_usuario
            GROUP BY e.id_evento";
    
            $result = mysqli_query($con, $query);
    
            if ($result) {
                $eventos = [];
                while ($evento = mysqli_fetch_assoc($result)) {
                    $evento['checklist'] = json_decode($evento['checklist']) ?: [];
                    $evento['participants'] = $evento['participants'] ? json_decode($evento['participants']) : [];
                    $eventos[] = $evento;
                }
                echo json_encode($eventos);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al obtener eventos: " . mysqli_error($con)]);
            }
        } elseif (isset($_GET['id_evento'])) {
            // Consultar un evento específico
            $id_evento = intval($_GET['id_evento']);
            $query = "SELECT 
                e.id_evento, 
                e.title, 
                e.date, 
                e.time, 
                e.location, 
                e.description, 
                COALESCE(e.checklist, '[]') AS checklist, 
                (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('nombre', u.nombre)), ']') 
                 FROM evento_participantes ep 
                 JOIN usuario u ON ep.id_usuario = u.id_usuario 
                 WHERE ep.id_evento = e.id_evento) AS participants
            FROM eventos e
            WHERE e.id_evento = $id_evento";
    
            $result = mysqli_query($con, $query);
    
            if ($result) {
                $evento = mysqli_fetch_assoc($result);
                $evento['checklist'] = json_decode($evento['checklist']) ?: [];
                $evento['participants'] = $evento['participants'] ? json_decode($evento['participants']) : [];
                echo json_encode($evento);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al obtener evento: " . mysqli_error($con)]);
            }
        } else {
            // Consultar todos los eventos
            $query = "SELECT 
                e.id_evento, 
                e.title, 
                e.date, 
                e.time, 
                e.location, 
                e.description, 
                COALESCE(e.checklist, '[]') AS checklist, 
                (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('nombre', u.nombre)), ']') 
                 FROM evento_participantes ep 
                 JOIN usuario u ON ep.id_usuario = u.id_usuario 
                 WHERE ep.id_evento = e.id_evento) AS participants
            FROM eventos e";
    
            $result = mysqli_query($con, $query);
    
            if ($result) {
                $eventos = [];
                while ($evento = mysqli_fetch_assoc($result)) {
                    $evento['checklist'] = json_decode($evento['checklist']) ?: [];
                    $evento['participants'] = $evento['participants'] ? json_decode($evento['participants']) : [];
                    $eventos[] = $evento;
                }
                echo json_encode($eventos);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al obtener eventos: " . mysqli_error($con)]);
            }
        }
        break;
    
    
    
        // Actualizar parcialmente un evento (PATCH)
        case 'PATCH':
            $_PATCH = json_decode(file_get_contents("php://input"), true);
            if (isset($_GET['id_evento'])) {
                $id_evento = intval($_GET['id_evento']);
                $checklist = $_PATCH['checklist'] ?? null;
                $participants = $_PATCH['participants'] ?? null;
        
                // Actualizar el checklist
                if ($checklist !== null) {
                    $checklistEscaped = mysqli_real_escape_string($con, json_encode($checklist));
                    $query = "UPDATE eventos SET checklist = '$checklistEscaped' WHERE id_evento = $id_evento";
                    if (!mysqli_query($con, $query)) {
                        http_response_code(500);
                        echo json_encode(["error" => "Error al actualizar el checklist: " . mysqli_error($con)]);
                        exit;
                    }
                }
        
                // Actualizar participantes
                if ($participants !== null) {
                    $deleteQuery = "DELETE FROM evento_participantes WHERE id_evento = $id_evento";
                    if (!mysqli_query($con, $deleteQuery)) {
                        http_response_code(500);
                        echo json_encode(["error" => "Error al eliminar participantes existentes: " . mysqli_error($con)]);
                        exit;
                    }
        
                    foreach ($participants as $id_usuario) {
                        $id_usuario = intval($id_usuario);
                        $insertQuery = "INSERT INTO evento_participantes (id_evento, id_usuario) VALUES ($id_evento, $id_usuario)";
                        if (!mysqli_query($con, $insertQuery)) {
                            http_response_code(500);
                            echo json_encode([
                                "error" => "Error al agregar participante: " . mysqli_error($con),
                                "query" => $insertQuery // Log de la consulta para depuración
                            ]);
                            exit;
                        }
                    }
                }
        
                // Retornar una respuesta JSON válida
                echo json_encode(["success" => true, "message" => "Evento actualizado con éxito."]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "ID del evento no especificado."]);
            }
            break;
                  
        // Crear un nuevo evento
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
        
            // Validar los campos obligatorios
            if (!empty($data['title']) && !empty($data['id_usuario'])) {
                // Escapar datos para prevenir inyección SQL
                $title = mysqli_real_escape_string($con, $data['title']);
                $date = !empty($data['date']) ? mysqli_real_escape_string($con, $data['date']) : null;
                $time = !empty($data['time']) ? mysqli_real_escape_string($con, $data['time']) : null;
                $location = !empty($data['location']) ? mysqli_real_escape_string($con, $data['location']) : null;
                $description = !empty($data['description']) ? mysqli_real_escape_string($con, $data['description']) : null;
                $id_usuario = intval($data['id_usuario']); // ID del usuario creador
        
                $query = "INSERT INTO eventos (title, date, time, location, description, id_usuario) 
                          VALUES ('$title', '$date', '$time', '$location', '$description', $id_usuario)";
        
                if (mysqli_query($con, $query)) {
                    $id_evento = mysqli_insert_id($con);
        
                    // Agregar participantes al evento (si existen)
                    if (!empty($data['participants']) && is_array($data['participants'])) {
                        foreach ($data['participants'] as $id_participante) {
                            $id_participante = intval($id_participante);
                            $insertQuery = "INSERT INTO evento_participantes (id_evento, id_usuario) 
                                            VALUES ($id_evento, $id_participante)";
                            mysqli_query($con, $insertQuery);
                        }
                    }
        
                    echo json_encode(["success" => true, "message" => "Evento creado con éxito.", "id_evento" => $id_evento]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al crear el evento: " . mysqli_error($con)]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Datos incompletos para crear el evento."]);
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
            $data = json_decode(file_get_contents("php://input"), true);
        
            if (!empty($_GET['id_evento'])) {
                $id_evento = intval($_GET['id_evento']);
                $updates = [];
        
                // Actualizar campos básicos
                if (isset($data['title'])) {
                    $title = mysqli_real_escape_string($con, $data['title']);
                    $updates[] = "title = '$title'";
                }
                if (isset($data['date'])) {
                    $date = mysqli_real_escape_string($con, $data['date']);
                    $updates[] = "date = '$date'";
                }
                if (isset($data['time'])) {
                    $time = mysqli_real_escape_string($con, $data['time']);
                    $updates[] = "time = '$time'";
                }
                if (isset($data['location'])) {
                    $location = mysqli_real_escape_string($con, $data['location']);
                    $updates[] = "location = '$location'";
                }
                if (isset($data['description'])) {
                    $description = mysqli_real_escape_string($con, $data['description']);
                    $updates[] = "description = '$description'";
                }
        
                // Actualizar evento
                if (!empty($updates)) {
                    $query = "UPDATE eventos SET " . implode(", ", $updates) . " WHERE id_evento = $id_evento";
        
                    if (!mysqli_query($con, $query)) {
                        http_response_code(500);
                        echo json_encode(["error" => "Error al actualizar el evento: " . mysqli_error($con)]);
                        exit;
                    }
                }
        
                // Actualizar participantes
                if (isset($data['participants'])) {
                    // Eliminar participantes existentes
                    $delete_query = "DELETE FROM evento_participantes WHERE id_evento = $id_evento";
                    if (!mysqli_query($con, $delete_query)) {
                        http_response_code(500);
                        echo json_encode(["error" => "Error al eliminar participantes existentes: " . mysqli_error($con)]);
                        exit;
                    }
        
                    // Insertar nuevos participantes
                    foreach ($data['participants'] as $id_usuario) {
                        $id_usuario = intval($id_usuario);
                        $insert_query = "INSERT INTO evento_participantes (id_evento, id_usuario) VALUES ($id_evento, $id_usuario)";
                        if (!mysqli_query($con, $insert_query)) {
                            http_response_code(500);
                            echo json_encode(["error" => "Error al agregar participante: " . mysqli_error($con)]);
                            exit;
                        }
                    }
                }
        
                echo json_encode(["success" => true, "message" => "Evento actualizado con éxito."]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "ID del evento no especificado."]);
            }
            break;
        
        
    }

// Cerrar conexión con la base de datos
cerrar_conexion($con);
?>
