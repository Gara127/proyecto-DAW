import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../Servicios/evento.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-user.component.html',
  styleUrls: ['./home-user.component.css']
})
export class HomeUserComponent implements OnInit {
  eventos: any[] = [];
  username: string | null = null;
  fechaMin: string | null = null;
  fechaMax: string | null = null;
  mostrarSoloCaducados: boolean = false;

  checklist: string[] = []; // Checklist actual
  checklistItem: string = ''; // Nuevo ítem de la checklist
  eventoSeleccionado: any = null; // Evento actualmente seleccionado para el modal

  constructor(private router: Router, private eventoService: EventoService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    this.cargarEventos();

    // Escuchar actualizaciones en los eventos (checklist actualizada)
    this.eventoService.obtenerEventoCreado$().subscribe(() => {
      this.cargarEventos(); // Recargar eventos al recibir notificación
    });
  }

  cargarEventos(): void {
    this.eventoService.obtenerEventos().subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.eventos = data.map((evento) => ({
            ...evento,
            checklist: Array.isArray(evento.checklist)
              ? evento.checklist
              : typeof evento.checklist === 'string'
              ? JSON.parse(evento.checklist)
              : [],
            participants: Array.isArray(evento.participants)
              ? evento.participants
              : [],
          }));
        } else {
          console.error('Datos de eventos inválidos:', data);
          this.eventos = [];
        }
      },
      (error) => {
        console.error('Error al cargar eventos:', error);
        this.eventos = [];
      }
    );
  }

  eliminarEvento(id_evento: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      this.eventoService.eliminarEvento(id_evento).subscribe(() => {
        this.eventos = this.eventos.filter(evento => evento.id_evento !== id_evento);
        alert('Evento eliminado con éxito.');
      }, error => {
        console.error('Error al eliminar el evento:', error);
        alert('Error al eliminar el evento.');
      });
    }
  }

  editarEvento(evento: any): void {
    this.router.navigate(['/event-creator'], { queryParams: { id_evento: evento.id_evento } });
  }

  aplicarFiltros(): void {
    this.eventoService.obtenerEventosFiltrados(
      this.fechaMin || undefined, 
      this.fechaMax || undefined, 
      this.mostrarSoloCaducados
    ).subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.eventos = data;
        } else {
          console.error('Error: Los datos de eventos no son válidos.');
          this.eventos = [];
        }
      },
      (error) => {
        console.error('Error al aplicar filtros:', error);
        this.eventos = [];
      }
    );
  }

  abrirChecklist(idEvento: number): void {
    this.eventoSeleccionado = this.eventos.find(evento => evento.id_evento === idEvento);
    if (this.eventoSeleccionado) {
      this.checklist = Array.isArray(this.eventoSeleccionado.checklist)
        ? this.eventoSeleccionado.checklist
        : typeof this.eventoSeleccionado.checklist === 'string'
        ? JSON.parse(this.eventoSeleccionado.checklist)
        : [];
    }
  }

  agregarElemento(): void {
    if (this.checklistItem.trim()) {
      if (!this.checklist.includes(this.checklistItem.trim())) {
        this.checklist.push(this.checklistItem.trim());
      }
      this.checklistItem = '';
    }
  }

  eliminarElemento(index: number): void {
    this.checklist.splice(index, 1);
  }

  guardarChecklist(): void {
    if (this.eventoSeleccionado && this.eventoSeleccionado.id_evento) {
      const datosActualizar = {
        checklist: JSON.stringify(this.checklist)
      };

      this.eventoService.actualizarEventoParcial(this.eventoSeleccionado.id_evento, datosActualizar)
        .subscribe(
          () => {
            alert('Checklist actualizada con éxito.');
            this.eventoSeleccionado.checklist = [...this.checklist];
          },
          (error) => {
            console.error('Error al actualizar la checklist:', error);
            alert('No se pudo actualizar la checklist. Revisa la consola.');
          }
        );
    }
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['/event-creator']);
  }
}
