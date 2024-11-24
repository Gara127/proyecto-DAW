import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../Servicios/usuario.service'; // Importar el servicio
import { Router } from '@angular/router'; // Para redirección opcional

@Component({
  selector: 'app-changepass',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './changePass.component.html',
  styleUrls: ['./changePass.component.css']
})
export class ChangePassComponent {
  changePassForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService, // Inyectar el servicio
    private router: Router // Para redirección opcional
  ) {
    this.changePassForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  }

  onSubmit() {
    if (this.changePassForm.valid) {
      const formData = {
        email: this.changePassForm.get('email')?.value,
        oldPassword: this.changePassForm.get('oldPassword')?.value,
        newPassword: this.changePassForm.get('newPassword')?.value
      };

      this.usuarioService.cambiarPassword(formData).subscribe(
        response => {
          console.log('Cambio de contraseña exitoso:', response);
          alert('Contraseña cambiada con éxito');
          this.router.navigate(['/login']); // Redirige a login o cualquier otra página
        },
        error => {
          console.error('Error al cambiar la contraseña:', error);
          alert('Error al cambiar la contraseña: ' + (error.error?.mensaje || 'Inténtalo de nuevo.'));
        }
      );
    } else {
      console.log('Formulario inválido');
      alert('Por favor, completa todos los campos correctamente.');
    }
  }
}

