import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importar FormsModule

@Component({
  selector: 'app-prueba',
  standalone: true, // Declarar que es standalone
  imports: [FormsModule], // Asegúrate de incluir FormsModule aquí
  templateUrl: './prueba.component.html',
  styleUrls: ['./prueba.component.css']
})
export class PruebaComponent {
  testValue: string = '';
}


