import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VotoService } from '../../Servicios/voto.service';
import { EventoService } from '../../Servicios/evento.service';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css'],
})
export class VotingComponent implements OnInit {

  encuestaForm: FormGroup; // Nuevo: Formulario específico para encuestas
  suggestions: any[] = [];
  mensaje: string = '';
  newSuggestion: string = '';

  eventosSelect: { id_evento: number; title: string }[] = []; // Lista de eventos para el select

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private votoService: VotoService,
    private eventoService: EventoService
  ) {
    this.encuestaForm = this.fb.group({
      id_evento: ['', Validators.required], // Selección de evento
      name: ['', Validators.required], // Nombre de la encuesta
      date: [''], // Fecha de la encuesta
      time: [''], // Hora de la encuesta
      location: [''], // Ubicación o detalles
    });
  }

  ngOnInit(): void {
    // this.obtenerEncuestas();
    this.cargarEventosParaSelect();
  }


  // Cargar eventos para el select
  cargarEventosParaSelect(): void {
    const idUsuario = parseInt(localStorage.getItem('id') || '0'); // Obtener ID del usuario logueado
    if (!idUsuario) {
      console.error('Usuario no logueado');
      return;
    }
  
    this.eventoService.getEventosPorUsuario(idUsuario).subscribe({
      next: (data) => {
        this.eventosSelect = data.map((evento: any) => ({
          id_evento: evento.id_evento,
          title: evento.title,
        }));
        console.log('Eventos para el select:', this.eventosSelect);
      },
      error: (error) => {
        console.error('Error al cargar eventos para el select:', error);
      },
    });
  }
  

  // Crear una nueva encuesta
  addSurvey(): void {
    if (this.encuestaForm.valid) {
      const id = parseInt(localStorage.getItem('id') || '0');
      const nuevaEncuesta = {
        id_usuario: id,
        id_evento: this.encuestaForm.value.id_evento,
        name: this.encuestaForm.value.name,
        date: this.encuestaForm.value.date ?? "",
        time: this.encuestaForm.value.time ?? "",
        location: this.encuestaForm.value.location ?? "",
      };

      console.log('Datos enviados al backend:', nuevaEncuesta);

      this.votoService.crearEncuesta(
        nuevaEncuesta.id_usuario,
        nuevaEncuesta.id_evento,
        nuevaEncuesta.name,
        nuevaEncuesta.time,
        nuevaEncuesta.date,
        nuevaEncuesta.location
      ).subscribe({
        next: () => {
          console.log('Encuesta creada con éxito.');
          this.router.navigate(['/home-user']); // Redirigir a Home-User
        },
        error: (error) => {
          console.error('Error al crear la encuesta:', error.message);
        },
      });
    }
}


  

  

  // Votar por una encuesta
  // vote(suggestion: {
  //   id_voting: number;
  //   name: string;
  //   votes: number;
  //   date: string;
  //   time: string;
  //   location: string;
  // }): void {
  //   const updatedVotes = suggestion.votes + 1;

  //   this.votoService.votarEncuesta(1, suggestion.id_voting, updatedVotes).subscribe({
  //     next: () => {
  //       suggestion.votes = updatedVotes;
  //       console.log(`Voto registrado para ${suggestion.name}. Votos actuales: ${suggestion.votes}`);
  //     },
  //     error: (error) => {
  //       console.error(`Error al votar por la encuesta ${suggestion.name}:`, error);
  //       alert(`Hubo un error al registrar tu voto para "${suggestion.name}". Intenta nuevamente.`);
  //     },
  //   });
  // }
}
