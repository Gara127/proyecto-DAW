import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [ReactiveFormsModule]
})

export class LoginComponent {
                        // forGrupo: representa un grupo de controles en el formulario
  loginForm!: FormGroup; //declaramos la variable de tipo formgroup que contiene los datos y la inicializamos con el constructor

    constructor(private fb: FormBuilder) { //group método de FormBuilder que se crea para crear un nuevo FormGroup y le pasas los objetos que definen los controles
    // Inicialización del FormGroup con controles y validaciones. this.loginForm instancia de loginComponent
    this.loginForm = this.fb.group({ // creamos una instancia (fb de la clase FormBuilder) para gestionar los controles del formulario (username y password).
        username: ['', [Validators.required, Validators.email]], // Control para el nombre de usuario. Validación: valor inicial vacio, requerido
        password: ['', [Validators.required, Validators.minLength(6)]], // Control para la contraseña.Validación: valor inicial vacio, requerido
    });
  }

  onSubmit() { 
    // Al enviar el formulario, se accede a los valores del FormGroup
    if (this.loginForm.valid) { // valido, todos los controles cumples las validaciones
      console.log('Formulario enviado!', this.loginForm.value); // Muestra los valores en la consola
    } else {
      console.log('Formulario inválido');
    }
  }
}


