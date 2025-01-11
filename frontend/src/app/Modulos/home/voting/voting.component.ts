import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VotoService } from '../../Servicios/voto.service';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css'],
})
export class VotingComponent implements OnInit {
  eventForm: FormGroup;
  newSuggestion: string = '';
  suggestions: { id_voting: number; name: string; votes: number; date: string; time: string; location: string }[] = [];
  mensaje: string = '';
  idGrupo: number = 1;

  constructor(private fb: FormBuilder, private votoService: VotoService) {
    this.eventForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.obtenerEventos();
  }

  // Obtener eventos del grupo desde el backend
  obtenerEventos() {
    this.votoService.obtenerUpcomingEventsPorGrupo(this.idGrupo).subscribe({
      next: (data) => (this.suggestions = data),
      error: () => (this.mensaje = 'Error al cargar los eventos. Intente de nuevo.'),
    });
  }

  // Agregar una nueva sugerencia
  addSuggestion() {
    if (this.newSuggestion.trim() && this.eventForm.valid) {
      const newEvent = {
        id_voting: Math.floor(Math.random() * 10000), // Generar un ID aleatorio
        name: this.newSuggestion,
        votes: 0,
        date: this.eventForm.value.date, // Enviar fecha directamente
        time: this.eventForm.value.time + ':00', // Asegurar el formato HH:mm:ss
        location: this.eventForm.value.location,
      };

      console.log('Datos enviados al backend:', newEvent); // Verificar datos enviados

      
      this.votoService.crearUpcomingEvent(1, this.idGrupo, newEvent.name, newEvent.time, newEvent.date, newEvent.location).subscribe({
        next: () => {
          this.suggestions.push(newEvent); // Agregar la nueva sugerencia localmente
          this.newSuggestion = ''; // Limpiar el input de texto
          this.eventForm.reset(); // Limpiar el formulario
          this.mensaje = 'Propuesta agregada exitosamente.';
        },
        error: (error) => {
          console.error('Error al crear propuesta plan:', error);
          this.mensaje = 'Hubo un error al agregar la propuesta.';
        },
      });
    }
  }
// Votar por un evento
vote(suggestion: { id_voting: number; name: string; votes: number; date: string; time: string; location: string }) {
  const updatedVotes = suggestion.votes + 1; // Calcula el nuevo número de votos

  this.votoService.votarUpcomingEvent(1, suggestion.id_voting, updatedVotes).subscribe({
    next: () => {
      // Actualizar los votos localmente solo si el backend confirma el éxito
      suggestion.votes = updatedVotes; 
      console.log(`Voto registrado para ${suggestion.name}. Votos actuales: ${suggestion.votes}`);
    },
    error: (error) => {
      // Manejar errores de forma más informativa
      console.error(`Error al votar por el evento ${suggestion.name}:`, error);
      alert(`Hubo un error al registrar tu voto para "${suggestion.name}". Intenta nuevamente.`);
    },
  });
}

// Getter para ordenar sugerencias por votos
get sortedSuggestions() {
  return this.suggestions.slice().sort((a, b) => b.votes - a.votes); // Copiar el array antes de ordenar
}

}

