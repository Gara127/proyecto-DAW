// src/app/componentes/login/login.component.ts
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importa Router para la redirección
import { UsuarioService } from '../../Servicios/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { Component, OnInit } from '@angular/core';


@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule]
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]], // Control para el nombre de usuario
      password: ['', [Validators.required, Validators.minLength(5)]] // Control para la contraseña
    });
  }
  ngOnInit(): void {
    
    // Llama al método para iniciar la bbdd
    this.usuarioService.iniciarUsuarios().subscribe(
      response => {
        console.log('BBDD iniciada correctamente!', response);
      },
      error => {
        console.error('Error al iniciar la BBDD', error);
      }
    );
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }

  irAChangePass(){
    this.router.navigate(['change-password']);
  }

  onSubmit() {
    
    if (this.loginForm.valid) {
      // Captura los datos del formulario y agrega el campo "action"
      const loginData = {
          ...this.loginForm.value, // Obtiene todos los valores del formulario
          action: 'login' // Añade el campo action
      };
      
      // Llama al método iniciarSesion del servicio
      this.usuarioService.iniciarSesion(loginData).subscribe(
        (response: any) => { // Asegúrate de que el backend devuelva un objeto con el rol
          console.log('Inicio de sesión exitoso!', response);
          localStorage.setItem('username', response.nombre); // guardamos el nombre en localstorage
          localStorage.setItem('id', response.id);
          
          if (response && response.rol) {
            // Verifica el rol y redirige
            if (response.rol === 'admin') {
              this.router.navigate(['/home']);
            } else if (response.rol === 'user') {
              this.router.navigate(['/home-user']);
            } else {
              console.error('Rol desconocido:', response.rol);
              alert('Rol desconocido, contacte al administrador.');
            }
          } else {
            console.error('Respuesta sin rol:', response);
            alert('Error al procesar el inicio de sesión.');
          }
        },
        error => {
          console.error('Error en el inicio de sesión', error);
          alert('Usuario o contraseña no encontrados.');
        }
      );
    } else {
      console.log('Formulario inválido');
      alert('Formulario inválido.');
    }
  }
}  
