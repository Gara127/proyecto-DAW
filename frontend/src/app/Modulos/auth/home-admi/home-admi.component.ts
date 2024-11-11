import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../Servicios/usuario.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home-admi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-admi.component.html',
  styleUrl: './home-admi.component.css'
})

export class AdmiHomeComponent implements OnInit {
  usuarios: any[] = []; // Array para almacenar los usuarios


  constructor(private usuarioService: UsuarioService,
    private router: Router // Inyecta Router correctamente aquí
  ) {}
    
  ngOnInit() {
    this.cargarUsuarios(); // Cargar los usuarios al inicializar el componente
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe(
        (data) => {
            this.usuarios = data; // Almacena los usuarios en la propiedad del componente
            console.log('Usuarios cargados:', this.usuarios); // Verifica qué usuarios se están cargando
        },
        (error) => {
            console.error('Error al obtener usuarios:', error); // Manejo de errores
        }
    );
}

  borrarUsuario(id_usuario: number): void {
    console.log('ID del usuario a eliminar:', id_usuario);
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        this.usuarioService.eliminarUsuario(id_usuario).subscribe(
            response => {
                console.log('Usuario eliminado:', response);
                alert('Usuario eliminado con éxito');
                // Aquí podrías hacer otra llamada a cargarUsuarios() para asegurarte de que la lista se actualiza
                this.cargarUsuarios(); 
            },
            error => {
              if (error.status === 403) {
                  alert('No se puede eliminar el último usuario con rol admin.');
              } else {
                  console.error('Error al eliminar usuario:', error);
              }
          }
        );
    }
  }
  editarUsuario(id_usuario: number): void {
    console.log('Redirigiendo para editar usuario con ID:', id_usuario);
    this.router.navigate(['./edit-user', id_usuario]); // Redirige a la ruta de edición
  }
}
