import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../Servicios/evento.service';

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-user.component.html',
  styleUrls: ['./home-user.component.css']
})
export class HomeUserComponent implements OnInit {
  eventos: any[] = []; // Lista de eventos
  username: string | null = null; // Para login usuario

  constructor(private router: Router, private eventoService: EventoService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username'); // Recuperar usuario
    this.cargarEventos(); // Cargar eventos existentes al iniciar

    // Escuchar nuevos eventos creados y agregar dinámicamente a la lista
    this.eventoService.obtenerEventoCreado$().subscribe((nuevoEvento) => {
      if (nuevoEvento) {
        this.eventos.unshift(nuevoEvento); // Agregar el nuevo evento al inicio de la lista
      }
    });
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['/event-creator']); // Navegar al formulario de creación de eventos
  }

  cargarEventos(): void {
    this.eventoService.obtenerEventos().subscribe((data) => {
      if (data && Array.isArray(data)) {
        this.eventos = data; // Asignar eventos obtenidos al array
      } else {
        console.error('Error: Los datos de eventos no son un array válido.');
        this.eventos = [];
      }
    }, (error) => {
      console.error('Error al cargar eventos:', error);
      this.eventos = [];
    });
  }
}
