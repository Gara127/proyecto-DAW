import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../Servicios/usuario.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})

export class EditUserComponent implements OnInit {
  
  usuario: any = { nombre: '', contrasena: '', rol: '' };
  id_usuario: number | null = null;
  username: string | null = null; // para login usuario

  constructor(
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_usuario = idParam ? +idParam : null; // Maneja null

    if (this.id_usuario) {
      this.cargarUsuario();
    }
  }

  cargarUsuario() {
    this.usuarioService.obtenerUsuarioPorId(this.id_usuario!).subscribe(
        (data: any) => {
            if (data.error) {
                console.error('Error:', data.error);
            } else {
                this.usuario = data; // Aquí se asigna el objeto directamente
                console.log('Usuario cargado para edición:', this.usuario);
            }
        },
        (error: any) => {
            console.error('Error al cargar usuario:', error);
        }
    );
}

  guardarCambios() {
    this.usuarioService.actualizarUsuario(this.id_usuario!, {
        nombre: this.usuario.nombre,
        pass: this.usuario.pass,  
        rol: this.usuario.rol
    }).subscribe(
        (response: any) => {
            console.log('Usuario actualizado:', response);
            this.router.navigate(['./home']);
            alert('Campo modificado');
        },
        (error: any) => {
            console.error('Error al actualizar usuario:', error);
            alert('Error al actualizar usuario');
        }
    );
  }

}