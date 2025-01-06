import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EventoService } from '../../Servicios/evento.service'; // Servicio de eventos

@Component({
  selector: 'app-tasks',
  standalone: true, // Definimos este componente como standalone
  imports: [CommonModule, FormsModule], // Importamos CommonModule y FormsModule
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  checklistItem: string = ''; // Elemento actual del formulario
  checklist: string[] = []; // Lista de elementos añadidos a la checklist
  eventoSeleccionado: any = null; // Objeto del evento seleccionado

  constructor(private route: ActivatedRoute, private eventoService: EventoService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      console.log('Query params:', params); // Verifica todos los parámetros de la URL
      const idEvento = +params['id_evento']; // Obtén el ID desde los parámetros
      console.log('ID del evento desde la URL:', idEvento); // Verifica si el ID es correcto
      if (idEvento) {
        this.obtenerEvento(idEvento);
      } else {
        console.error('ID del evento no proporcionado en la URL'); // Si no hay ID
      }
    });
  }
  
  
  
  

  // Cargar los datos del evento seleccionado
  obtenerEvento(idEvento: number): void {
    console.log('Llamando a obtenerEvento con ID:', idEvento); // Verifica el ID recibido
    this.eventoService.obtenerEventoPorId(idEvento).subscribe(
      (evento) => {
        console.log('Evento obtenido del backend:', evento); // Verifica la respuesta del backend
        if (evento) {
          this.eventoSeleccionado = evento; // Asigna directamente el evento
          console.log('Evento seleccionado:', this.eventoSeleccionado); // Verifica la asignación
          this.checklist = Array.isArray(this.eventoSeleccionado.checklist)
            ? this.eventoSeleccionado.checklist
            : typeof this.eventoSeleccionado.checklist === 'string'
            ? JSON.parse(this.eventoSeleccionado.checklist)
            : [];
          console.log('Checklist inicial:', this.checklist); // Verifica la checklist
        } else {
          console.error('Evento no encontrado para el ID proporcionado');
        }
      },
      (error) => {
        console.error('Error al obtener el evento del backend:', error);
      }
    );
  }
  
  
  
  
  
  
  

  // Añadir un elemento a la checklist
  agregarElemento(): void {
    if (this.checklistItem.trim()) {
      this.checklist.push(this.checklistItem.trim());
      this.checklistItem = ''; // Limpiar el campo de entrada
    }
  }

  // Guardar la checklist en el evento seleccionado
  guardarChecklist(): void {
    console.log('Evento seleccionado antes de guardar:', this.eventoSeleccionado); // Verifica si el evento está definido
    if (this.eventoSeleccionado && this.eventoSeleccionado.id_evento) {
      const idEvento = this.eventoSeleccionado.id_evento;
      console.log('ID del evento para guardar checklist:', idEvento); // Verifica el ID
      console.log('Checklist a guardar:', this.checklist); // Verifica la checklist
  
      this.eventoService
        .actualizarEventoParcial(idEvento, { checklist: JSON.stringify(this.checklist) })
        .subscribe(
          () => {
            alert('Checklist actualizada con éxito');
          },
          (error) => {
            console.error('Error al actualizar la checklist:', error);
          }
        );
    } else {
      console.error('ID del evento no definido o evento seleccionado no cargado.');
    }
  }
  
  

  
  
  
  
  
  
  
  
}
