import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../Servicios/usuario.service';
import { Router } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [FormsModule]
})

export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirm: string = '';

  constructor(private usuarioService: UsuarioService, private router: Router) {} // Inyectamos el servicio y el router

  onSubmit(event: Event) {
    event.preventDefault(); // Evita que la página se recargue

    if (this.password !== this.confirm) {
      console.error("Las contraseñas no coinciden");
      alert('Las contraseñas no coinciden');
      return;
    }

    const registerData = {
      nombre: this.email, // Usamos email como nombre, asegúrate de que esto sea lo que deseas
      pass: this.password,
      rol: "normal", // Puedes definir el rol aquí, asumiendo que siempre es "normal"
      action: 'register'
    };

    // Llamamos al servicio para crear el usuario
    this.usuarioService.crearUsuario(registerData).subscribe(
      (response: any) => {
        console.log(response);
        // Redirige a otra página, por ejemplo, a la página de inicio
        this.router.navigate(['./login']);
      },
      (error: any) => {
        console.error('Error al crear usuario:', error);
        alert('Error al crear usuario');
      }
    );
  }
  // signInWithGoogle() {
  //   // Implementa la lógica para la autenticación con Google aquí
  //   console.log('Registro con Google');
  //   // Aquí puedes integrar la API de autenticación de Google
  // }

  // signInWithFacebook() {
  //   // Implementa la lógica para la autenticación con Facebook aquí
  //   console.log('Registro con Facebook');
  //   // Aquí puedes integrar la API de autenticación de Facebook
  // }
}