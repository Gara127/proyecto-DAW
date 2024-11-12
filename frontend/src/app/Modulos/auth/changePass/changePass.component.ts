import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-changepass',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './changePass.component.html',
  styleUrls: ['./changePass.component.css']
})
export class ChangePassComponent {
  changePassForm: FormGroup;

  constructor(private fb: FormBuilder) {
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
      console.log(this.changePassForm.value);
    } else {
      console.log("Formulario inválido");
    }
  }
}
