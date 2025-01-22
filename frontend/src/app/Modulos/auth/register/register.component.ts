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
  formSubmitted: boolean = false;

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault(); // Evita que la página se recargue

     // Expresión regular para validar el correo electrónico
     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

     // Verificar si el email es válido
     if (!emailPattern.test(this.email)) {
       alert('Por favor, introduce un correo electrónico válido.');
       return; // Detenemos la ejecución si el correo electrónico no cumple con los requisitos
     }
    // Expresión regular para validar la contraseña
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>?/\\|`~])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};:'",.<>?/\\|`~]{6,}$/;
    // Comprobamos si la contraseña es válida
    if (!passwordPattern.test(this.password)) {
      alert('La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.');
      return; // Detenemos la ejecución si la contraseña no cumple con los requisitos
    }

    // Verificación de contraseñas
    if (this.password !== this.confirm) {
      console.error("Las contraseñas no coinciden");
      alert('Las contraseñas no coinciden');
      return;
    }

    const registerData = {
      nombre: this.email, // Usamos email como nombre
      pass: this.password,
      rol: "user", // Asumimos rol "user"
      action: 'register'
    };

    // Llamamos al servicio para crear el usuario
    this.usuarioService.crearUsuario(registerData).subscribe(
      (response: any) => {
        console.log(response);
        alert("Usuario creado exitosamente");
        // Redirige a otra página, por ejemplo, a la página de inicio
        this.router.navigate(['./login']);
      },
      (error: any) => {
        console.error('Error al crear usuario:', error);
        alert('Error al crear usuario');
      }
    );
  }
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
