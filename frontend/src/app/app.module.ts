import { NgModule } from '@angular/core'; // Importar NgModule
import { BrowserModule } from '@angular/platform-browser'; // Importar BrowserModule
import { AppComponent } from './app.component'; // Importar el componente raíz
import { AuthModule } from './Modulos/auth/auth.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './Modulos/auth/login/login.component';
import { AdmiHomeComponent } from './Modulos/auth/home-admi/home-admi.component';
import { RegisterComponent } from './Modulos/auth/register/register.component';
import { HomeModule } from './Modulos/home/home.module';
import { ChangePassComponent } from './Modulos/auth/changePass/changePass.component';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, // Importar el módulo del navegador
    AuthModule, // Importa el módulo de autenticación
    ReactiveFormsModule,
    FormsModule, 
    HomeModule
  ],
  providers: [
    provideHttpClient(),

  ],
  bootstrap: [AppComponent] // Especificar el componente raíz que se debe iniciar
})
export class AppModule { } // Exportar la clase AppModule
