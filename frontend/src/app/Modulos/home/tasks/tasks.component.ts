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
    this.eventoService.obtenerEventoPorId(idEvento).subscribe(
      (evento) => {
        if (evento) {
          this.eventoSeleccionado = evento;
          this.checklist = Array.isArray(evento.checklist)
            ? evento.checklist
            : [];
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
    if (this.eventoSeleccionado && this.eventoSeleccionado.id_evento) {
      this.eventoService
        .actualizarEventoParcial(this.eventoSeleccionado.id_evento, { checklist: this.checklist })
        .subscribe(
          () => {
            alert('Checklist actualizada con éxito.');
          },
          (error) => {
            console.error('Error al actualizar la checklist:', error);
          }
        );
    }
  }
  
  
  
  
  

  
  
  
  
  
  
  
  
}
