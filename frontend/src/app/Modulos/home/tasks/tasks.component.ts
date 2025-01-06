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
    // Obtener el ID del evento desde los parámetros de la URL
    this.route.queryParams.subscribe((params) => {
      const idEvento = +params['id_evento'];
      if (idEvento) {
        this.obtenerEvento(idEvento); // Cargar los datos del evento
      }
    });
  }

  // Cargar los datos del evento seleccionado
  obtenerEvento(idEvento: number): void {
    this.eventoService.obtenerEventoPorId(idEvento).subscribe((evento) => {
      this.eventoSeleccionado = evento;
      this.checklist = evento.checklist || []; // Cargar la checklist existente
    });
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
    if (this.eventoSeleccionado) {
      this.eventoService
        .actualizarEventoParcial(this.eventoSeleccionado.id_evento, { checklist: this.checklist })
        .subscribe(() => {
          alert('Checklist actualizada con éxito');
        });
    }
  }
  
}
