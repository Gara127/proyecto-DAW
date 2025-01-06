<?php
include_once 'database.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

function crear_tarea_con_checklist($con, $titulo, $id_evento, $checklist) {
    mysqli_query($con, "INSERT INTO tareas (titulo, id_evento) VALUES ('$titulo', $id_evento)");
    $id_tarea = mysqli_insert_id($con);

    foreach ($checklist as $item) {
        mysqli_query($con, "INSERT INTO checklist (id_tarea, descripcion) VALUES ($id_tarea, '$item')");
    }

    return $id_tarea;
}

function obtener_tareas_con_checklist($con, $id_evento) {
    $query = "
        SELECT t.id_tarea, t.titulo, c.id_checklist, c.descripcion, c.estado
        FROM tareas t
        LEFT JOIN checklist c ON t.id_tarea = c.id_tarea
        WHERE t.id_evento = $id_evento
    ";
    $resultado = mysqli_query($con, $query);
    $tareas = [];

    while ($row = mysqli_fetch_assoc($resultado)) {
        $id_tarea = $row['id_tarea'];
        if (!isset($tareas[$id_tarea])) {
            $tareas[$id_tarea] = [
                'titulo' => $row['titulo'],
                'checklist' => []
            ];
        }
        $tareas[$id_tarea]['checklist'][] = [
            'id_checklist' => $row['id_checklist'],
            'descripcion' => $row['descripcion'],
            'estado' => $row['estado']
        ];
    }

    return $tareas;
}

function actualizar_estado_checklist($con, $id_checklist, $estado) {
    $estado = $estado ? 1 : 0;
    mysqli_query($con, "UPDATE checklist SET estado = $estado WHERE id_checklist = $id_checklist");
}

// Manejo de solicitudes
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'crear_tarea') {
    $data = json_decode(file_get_contents('php://input'), true);
    $titulo = $data['titulo'];
    $id_evento = $data['id_evento'];
    $checklist = $data['checklist'];

    crear_tarea_con_checklist($con, $titulo, $id_evento, $checklist);
    echo json_encode(['message' => 'Tarea creada con éxito']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'obtener_tareas') {
    $id_evento = $_GET['id_evento'];
    $tareas = obtener_tareas_con_checklist($con, $id_evento);
    echo json_encode($tareas);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $_GET['action'] === 'actualizar_estado_checklist') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_checklist = $data['id_checklist'];
    $estado = $data['estado'];

    actualizar_estado_checklist($con, $id_checklist, $estado);
    echo json_encode(['message' => 'Estado actualizado con éxito']);
}

?>

