<?php
$connection = fsockopen('smtp.gmail.com', 587);
if ($connection) {
    echo "Conexión exitosa al puerto 587.";
    fclose($connection);
} else {
    echo "No se pudo conectar al puerto 587.";
}
?>
