<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Configurar los encabezados para respuestas JSON y permitir el acceso desde cualquier origen
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

// Archivo de conexión a la base de datos
require_once("database.php");

// Carga automáticamente las dependencias instaladas
require 'vendor/autoload.php';

// Se establece conexión con la base de datos
$con = conectar();

// Obtener el método HTTP utilizado en la solicitud
$method = $_SERVER['REQUEST_METHOD'];

// Instanciar la clase PHPMailer
$mail = new PHPMailer(true);
$mail->Timeout = 30; // Tiempo máximo de espera en segundos
$mail->SMTPDebug = 2; // Habilitar logs de depuración para verificar errores

// Manejar la solicitud según el método HTTP
switch ($method) {

    // Obtener todos los eventos
    case 'GET':
        if (isset($_GET['id_evento'])) {
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
                // Decodificar checklist si no está vacío
                $evento['checklist'] = json_decode($evento['checklist']) ?: [];
                // Asegurar que participants sea un array válido
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
                    // Decodificar checklist y participants para cada evento
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
            $data = json_decode(file_get_contents("php://input"), true); // Obtener datos del cuerpo de la solicitud

            // Validar los campos obligatorios
            if (!empty($data['title'])) {
                // Escapar datos para prevenir inyección SQL
                $title = mysqli_real_escape_string($con, $data['title']);
                $date = !empty($data['date']) ? mysqli_real_escape_string($con, $data['date']) : null; // Opcional
                $time = !empty($data['time']) ? mysqli_real_escape_string($con, $data['time']) : null; // Opcional
                $location = !empty($data['location']) ? mysqli_real_escape_string($con, $data['location']) : null; // Opcional
                $description = !empty($data['description']) ? mysqli_real_escape_string($con, $data['description']) : null; // Opcional
        
                // Crear consulta dinámica para manejar campos opcionales
                $fields = ['title', 'date', 'time', 'location', 'description'];
                $values = [$title, $date, $time, $location, $description];
        
                // Construir dinámicamente los campos y valores
                $insertFields = [];
                $insertValues = [];
                foreach ($fields as $index => $field) {
                    if (!is_null($values[$index])) {
                        $insertFields[] = $field;
                        $insertValues[] = "'" . $values[$index] . "'";
                    }
                }
        
                $query = "INSERT INTO eventos (" . implode(", ", $insertFields) . ") 
                          VALUES (" . implode(", ", $insertValues) . ")";
        
                if (mysqli_query($con, $query)) {
                    $id_evento = mysqli_insert_id($con); // Obtener el ID del evento recién creado
        
                    // Agregar participantes al evento (si existen)
                    if (!empty($data['participants']) && is_array($data['participants'])) {
                        foreach ($data['participants'] as $id_usuario) {
                            $id_usuario = (int)$id_usuario; // Asegurarse de que es un entero
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

                    // Enviar correo a los participantes
                    try {
                        echo "Configurando correo...";

                        // Configuración del servidor SMTP
                        // $mail->isSMTP();
                        // $mail->Host = 'crewconnect.rf.gd'; // Servidor SMTP
                        // $mail->SMTPAuth = true; // Requiere autenticación
                        // $mail->Username = '_mainaccount@crewconnect.rf.gd'; // Nombre de usuario del correo
                        // $mail->Password = '5kgXzeZtXD4WZO'; // Contraseña de cPanel asociada
                        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Usa SSL
                        // $mail->Port = 465; // Puerto para SSL

                        // $mail->isSMTP();
                        // $mail->Host = 'mail.crewconnect.rf.gd'; // Servidor SMTP
                        // $mail->SMTPAuth = true; // Autenticación habilitada
                        // $mail->Username = '_mainaccount@crewconnect.rf.gd'; // Nombre de usuario del correo
                        // $mail->Password = 'tu-contraseña-cpanel'; // Contraseña de cPanel asociada
                        // $mail->Port = 587; // Puerto SMTP para conexiones sin SSL
                        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Usa TLS en lugar de SSL

                        $mail->isSMTP();
                        $mail->Host = 'smtp.gmail.com'; // Servidor SMTP de Gmail
                        $mail->SMTPAuth = true; // Habilitar autenticación SMTP
                        $mail->Username = 'app.crew.connect@gmail.com'; // Tu dirección de correo Gmail
                        $mail->Password = 'yubu vibi ucks qzwd'; // Contraseña o token de aplicación de Gmail
                        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Usar encriptación TLS
                        $mail->Port = 587; // Puerto para conexiones TLS

                        $mail->SMTPOptions = [
                            'ssl' => [
                                'verify_peer' => false,
                                'verify_peer_name' => false,
                                'allow_self_signed' => true,
                            ],
                        ];
                    
                        // Configuración del correo
                        $mail->setFrom('app.crew.connect@gmail.com', 'Crew Connect'); // Dirección del remitente
                        $mail->addAddress('gara127gs@gmail.com', 'Usuario');
                        $mail->Subject = 'Evento creado';
                        $mail->Body = 'Este es un correo de prueba enviado con PHPMailer.';
                    
                        // Enviar correo
                        echo "Enviando correo...";
                        if (!$mail->send()) {
                            http_response_code(500);
                            echo json_encode([
                                "success" => false,
                                "message" => "Error al enviar correo: " . $mail->ErrorInfo
                            ]);
                            exit;
                        }

                        echo "Correo enviado con éxito";
                    } catch (Exception $e) {
                        http_response_code(500);
                        echo json_encode([
                            "success" => false,
                            "message" => "Excepción al enviar correo: " . $e->getMessage()
                        ]);
                        exit;
                    }
                    
                    // Cerrar la conexión SMTP
                    $mail->smtpClose();

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
