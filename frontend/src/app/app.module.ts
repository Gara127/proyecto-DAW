import { NgModule } from '@angular/core'; // Importar NgModule
import { BrowserModule } from '@angular/platform-browser'; // Importar BrowserModule
import { AppComponent } from './app.component'; // Importar el componente raíz
import { AuthModule } from './Modulos/auth/auth.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent, // Declarar el componente raíz
  ],
  imports: [
    BrowserModule, // Importar el módulo del navegador
    ReactiveFormsModule,
    AuthModule // Importa el módulo de autenticación
  ],
  providers: [],
  bootstrap: [AppComponent] // Especificar el componente raíz que se debe iniciar
})
export class AppModule { } // Exportar la clase AppModule
