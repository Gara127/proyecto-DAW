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
      const loginData = { ...this.loginForm.value, action: 'login' };
  
      this.usuarioService.iniciarSesion(loginData).subscribe(
        (response: any) => {
          console.log('Respuesta del backend:', response);
  
          if (response && response.id_usuario) {
            // Guardar usuario en localStorage
            localStorage.setItem('usuario', JSON.stringify(response));
            console.log('Usuario almacenado en localStorage:', response);
  
            // Redirigir según el rol
            if (response.rol === 'user') {
              this.router.navigate(['/home-user']);
            } else if (response.rol === 'admin') {
              this.router.navigate(['/home']);
            }
          } else {
            console.error('Error en la respuesta del backend:', response);
            alert('Error al procesar el inicio de sesión.');
          }
        },
        (error) => {
          console.error('Error en el inicio de sesión:', error);
          alert('Usuario o contraseña no encontrados.');
        }
      );
    } else {
      console.log('Formulario inválido');
      alert('Formulario inválido.');
    }
  }
  
  
  
}  
