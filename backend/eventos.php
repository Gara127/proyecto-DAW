<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // Responde sin contenido para las solicitudes OPTIONS
    exit();
}
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
// Configurar los encabezados para respuestas JSON y permitir el acceso desde cualquier origen


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
        if (isset($_GET['id_evento'])) {
            $id_evento = intval($_GET['id_evento']);
            $query = "
                SELECT 
                    e.id_evento,
                    e.title,
                    e.date,
                    e.time,
                    e.location,
                    e.description,
                    COALESCE(e.checklist, '[]') AS checklist,
                    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id_usuario', u.id_usuario, 'nombre', u.nombre)) 
                     FROM evento_participantes ep 
                     JOIN usuario u ON ep.id_usuario = u.id_usuario 
                     WHERE ep.id_evento = e.id_evento) AS participants
                FROM eventos e
                WHERE e.id_evento = $id_evento";
    
            $result = mysqli_query($con, $query);
    
            if ($result && mysqli_num_rows($result) > 0) {
                $evento = mysqli_fetch_assoc($result);
                $evento['checklist'] = json_decode($evento['checklist']) ?: [];
                $evento['participants'] = $evento['participants'] ? json_decode($evento['participants']) : [];
                echo json_encode($evento);
            } else {
                // Responder con un evento vacío si no se encuentra el ID
                http_response_code(200); // Usar 200 para mantener la compatibilidad con el frontend
                echo json_encode([
                    "id_evento" => $id_evento,
                    "title" => "",
                    "date" => null,
                    "time" => null,
                    "location" => "",
                    "description" => "",
                    "checklist" => [],
                    "participants" => []
                ]);
            }
        } elseif (isset($_GET['id_usuario'])) {
            $id_usuario = intval($_GET['id_usuario']);
            $query = "
                SELECT 
                    e.id_evento,
                    e.title,
                    e.date,
                    e.time,
                    e.location,
                    e.description,
                    COALESCE(e.checklist, '[]') AS checklist,
                    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id_usuario', u.id_usuario, 'nombre', u.nombre)) 
                     FROM evento_participantes ep 
                     JOIN usuario u ON ep.id_usuario = u.id_usuario 
                     WHERE ep.id_evento = e.id_evento) AS participants
                FROM eventos e
                LEFT JOIN evento_participantes ep ON e.id_evento = ep.id_evento
                WHERE ep.id_usuario = $id_usuario
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
                http_response_code(200); // Usar 200 y devolver un array vacío
                echo json_encode([]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Faltan parámetros"]);
        }
        break;
    
    
    
    
    
    
    
    
    
        // Actualizar parcialmente un evento (PATCH)
        case 'PATCH':
            $_PATCH = json_decode(file_get_contents("php://input"), true);
            if (isset($_GET['id_evento'])) {
                $id_evento = intval($_GET['id_evento']);
                $checklist = $_PATCH['checklist'] ?? null;
                $participants = $_PATCH['participants'] ?? null;
    
                if ($checklist !== null) {
                    $checklistEscaped = mysqli_real_escape_string($con, json_encode($checklist));
                    $query = "UPDATE eventos SET checklist = '$checklistEscaped' WHERE id_evento = $id_evento";
                    if (!mysqli_query($con, $query)) {
                        http_response_code(500);
                        echo json_encode(["error" => "Error al actualizar el checklist: " . mysqli_error($con)]);
                        exit;
                    }
                }
    
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
                  
        // Crear un nuevo evento
       // Crear un nuevo evento
       // Crear un nuevo evento
       // Crear un nuevo evento
       case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
    
        // Validar los campos obligatorios
        if (!empty($data['title'])) {
            $title = mysqli_real_escape_string($con, $data['title']);
            $date = !empty($data['date']) ? mysqli_real_escape_string($con, $data['date']) : null;
            $time = !empty($data['time']) ? mysqli_real_escape_string($con, $data['time']) : null;
            $location = !empty($data['location']) ? mysqli_real_escape_string($con, $data['location']) : null;
            $description = !empty($data['description']) ? mysqli_real_escape_string($con, $data['description']) : null;
    
            // Obtener el ID del creador desde la solicitud
            $id_creador = !empty($data['id_creador']) ? intval($data['id_creador']) : null;
            if (!$id_creador) {
                http_response_code(400);
                echo json_encode(["error" => "El ID del creador es obligatorio."]);
                exit();
            }
    
            // Insertar el evento en la tabla "eventos"
            $query = "INSERT INTO eventos (title, date, time, location, description) 
                      VALUES ('$title', '$date', '$time', '$location', '$description')";
    
            if (mysqli_query($con, $query)) {
                $id_evento = mysqli_insert_id($con);
    
                // Agregar al creador como participante en "evento_participantes"
                $query_creador = "INSERT INTO evento_participantes (id_evento, id_usuario) 
                                  VALUES ($id_evento, $id_creador)";
                mysqli_query($con, $query_creador);
    
                // Agregar otros participantes, si existen
                if (!empty($data['participants']) && is_array($data['participants'])) {
                    foreach ($data['participants'] as $id_participante) {
                        $id_participante = intval($id_participante);
                        if ($id_participante !== $id_creador) { // Evitar duplicados
                            $query_participante = "INSERT INTO evento_participantes (id_evento, id_usuario) 
                                                   VALUES ($id_evento, $id_participante)";
                            mysqli_query($con, $query_participante);
                        }
                    }
                }
    
                // Responder con éxito
                echo json_encode(["success" => true, "message" => "Evento creado con éxito.", "id_evento" => $id_evento]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al crear el evento.", "details" => mysqli_error($con)]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "El título del evento es obligatorio."]);
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
        
                // Actualizar el evento
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
