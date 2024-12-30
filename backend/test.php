<?php
$host = '31.22.4.234';
$db = 'crewconnect_db';
$user = 'crewconnect_root';
$pass = '5kgXzeZtXD4WZO';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Conexión exitosa a la base de datos";
} catch (PDOException $e) {
    die("Error:" . $e->getMessage());
}
?>
