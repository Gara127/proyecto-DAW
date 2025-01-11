<?php
    $host = "localhost";
    $user = "root";
    $pass = "";
    $db_name = "ProyectoDaw";

    function init(){
        $con = conectar(); // Conectar a la base de datos
        crear_tabla_usuario($con); // Crear tabla de usuario
        crear_tabla_grupos($con);
        crear_eventos($con);
        evento_participantes($con);
        crear_tabla_usuario_grupo($con); // Relacionar usuarios con grupos
        crear_tabla_voting($con);
        crear_tabla_event_votes($con); // Crear tabla de votos 
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
                    nombre varchar(225) UNIQUE, 
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

    function crear_eventos($con){
        mysqli_query($con,"create table if not exists eventos(
                    id_evento INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    date DATE NOT NULL,
                    time TIME NOT NULL,
                    location VARCHAR(255),
                    description TEXT,
                    checklist TEXT -- Agregar la columna checklist como tipo TEXT
                    )") or die("Error al crear la tabla evento: " . mysqli_error($con));
    
        // Verificar si la columna 'checklist' ya existe
        $column_check = mysqli_query($con, "SHOW COLUMNS FROM eventos LIKE 'checklist'");
        if (mysqli_num_rows($column_check) == 0) {
            // Si la columna no existe, agregarla
            mysqli_query($con, "ALTER TABLE eventos ADD COLUMN checklist TEXT") or die("Error al agregar la columna checklist: " . mysqli_error($con));
        }
    }
    

    function evento_participantes($con){
         mysqli_query($con,"create table if not exists evento_participantes(
            id_evento INT,
            id_usuario INT,
            PRIMARY KEY (id_evento, id_usuario),
            FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
            FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
            )") or die("Error al crear la tabla evento_participantes: " . mysqli_error($con));    
    }

    // Tabla de grupos
    function crear_tabla_grupos($con){
        mysqli_query($con, "create table if not exists grupos(
                id_grupo INT PRIMARY KEY AUTO_INCREMENT,
                nombre VARCHAR(255) DEFAULT 'Grupo Predeterminado'
                )") or die("Error al crear la tabla grupos: " . mysqli_error($con)); 
    }

    // Tabla para asociar usuarios a grupos
    function crear_tabla_usuario_grupo($con){
       mysqli_query($con, "create table if not exists usuario_grupo(
                    id_usuario INT NOT NULL,
                    id_grupo INT NOT NULL,
                    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
                    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo),
                    UNIQUE(id_usuario, id_grupo) -- Un usuario solo puede pertenecer una vez a un grupo
                    )") or die("Error al crear la tabla usuario_grupo: " . mysqli_error($con));
    }

    // Tabla de eventos provisionales
    function crear_tabla_voting($con){
        mysqli_query($con, "create table if not exists upcoming_events(
                    id_voting INT PRIMARY KEY AUTO_INCREMENT, 
                    id_usuario INT,
                    id_grupo INT, 
                    name VARCHAR(225) UNIQUE NOT NULL,
                    time VARCHAR(15) NOT NULL, 
                    date VARCHAR(15) NOT NULL,
                    location VARCHAR(255) NOT NULL,
                    votes INT DEFAULT 0,
                    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
                    FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) 
                    )") or die("Error al crear la tabla upcoming_events: " . mysqli_error($con));
    }

     // Tabla de votos de eventos
     function crear_tabla_event_votes($con){
        mysqli_query($con, "create table if not exists event_votes(
                    id_vote INT PRIMARY KEY AUTO_INCREMENT,
                    id_usuario INT NOT NULL,
                    id_voting INT NOT NULL,
                    voto INT DEFAULT 0,  -- 1 = voto positivo, 0 = voto negativo
                    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
                    FOREIGN KEY (id_voting) REFERENCES upcoming_events(id_voting),
                    UNIQUE(id_usuario, id_voting) -- Asegura que un usuario solo pueda votar una vez por evento
                    )") or die("Error al crear la tabla event_votes: " . mysqli_error($con));
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