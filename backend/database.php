<?php
    $host = "localhost";
    $user = "root";
    $pass = "Cocacola01.";
    $db_name = "ProyectoDaw";

    function init(){
        $con = conectar(); // Conectar a la base de datos
        crear_tabla_usuario($con); // Crear tabla de usuario
        cerrar_conexion($con); // Cerrar la conexión
    }

    function conectar(){
        $con = mysqli_connect($GLOBALS["host"], $GLOBALS["user"], $GLOBALS["pass"]) or die("Error al conectar con la base de datos");
        crear_bdd($con);
        mysqli_select_db($con, $GLOBALS["db_name"]);
        return $con;
    }
    

    function crear_bdd($con){
        mysqli_query($con, "create database if not exists ProyectoDaw;");
    }

    function crear_tabla_usuario($con){
        mysqli_query($con, "create table if not exists usuario(
                    id_usuario int primary key auto_increment, 
                    nombre varchar(225), 
                    pass varchar(225), 
                    rol varchar(25)
                    )") or die("Error al crear la tabla usuario: " . mysqli_error($con));

        // Verificar si la tabla está vacía
        $usuarios = mysqli_query($con, "select * from usuario");
        $num_filas = obtener_num_filas($usuarios);

        // Si no hay registros, insertar un usuario administrador
        if ($num_filas == 0) {
            $rol = 'admin';
            $nombre = 'admin@gmail.com';
            $password = 'admin';

            // Insertar el usuario administrador
            mysqli_query($con, "insert into usuario (nombre, pass, rol) values ('$nombre', '$password', '$rol')");
        }
    }
    

    // AUX

    function cerrar_conexion($con){
        mysqli_close($con);
    }

    function obtener_info($resultado){
        return mysqli_fetch_array($resultado);
    }

    function obtener_num_filas($resultado){
        return mysqli_num_rows($resultado);
    }

    // USUARIOS

    // function obtener_usuarios($con){
    //     $consulta = "select * from usuario";
    //     $usuarios = mysqli_query($con, $consulta);
    //     return $usuarios;      
    // }

    // function obtener_usuario_id($con, $id_usuario){
    //     $consulta = "select * from usuario where id_usuario=$id_usuario";
    //     $usuario = mysqli_query($con, $consulta);
    //     return $usuario;      
    // }

    // function obtener_usuario($con, $nombre, $password){
    //     $consulta = "select * from usuario where nombre='$nombre' and pass='$password'";
    //     $usuario = mysqli_query($con, $consulta);
    //     return $usuario;      
    // }

    // function crear_usuario($con, $rol, $nombre, $password){
    //     mysqli_query($con, "insert into usuario(nombre, pass, rol) values('$nombre', '$password', $rol)");
    // }

    // function modificar_usuario($con, $id_usuario, $rol, $nombre, $password){
    //     $consulta = "update usuario set rol=$rol, nombre='$nombre', pass='$password' where id_usuario=$id_usuario";
    //     mysqli_query($con, $consulta);
    // }

    // function borrar_usuarios($con, $codigos){
    //     $consulta = "delete from usuario where id_usuario in (".implode(", ", $codigos).")";
    //     mysqli_query($con, $consulta);
    // }
?>