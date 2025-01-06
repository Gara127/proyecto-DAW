import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { AdmiHomeComponent } from './home-admi/home-admi.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { RegisterComponent } from './register/register.component';
import { RouterModule } from '@angular/router';
import { HomeRoutingModule } from '../home/home-routing.module';



@NgModule({
  declarations: [
    LoginComponent, // declaramos los componentes creados en el archivo de config. del módulo padre.
    AdmiHomeComponent,
    EditUserComponent,
    RegisterComponent,
    CommonModule,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    HomeRoutingModule
  ],
  providers: [
    provideHttpClient(), // Mantén esto
  ],
})
export class AuthModule { }
