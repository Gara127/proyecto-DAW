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
  eventosFiltrados: any[] = []; // Array para almacenar los eventos después de aplicar filtros
  busqueda: string = ''; // Almacena el término de búsqueda
  username: string | null = null;
  fechaMin: string | null = null;
  fechaMax: string | null = null;
  mostrarSoloCaducados: boolean = false;

  checklist: string[] = []; // Checklist actual
  checklistItem: string = ''; // Nuevo ítem de la checklist
  eventoSeleccionado: any = null; // Evento actualmente seleccionado para el modal

  constructor(private router: Router, private eventoService: EventoService) {}

  ngOnInit(): void {
    // Obtiene el objeto completo del usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.username = usuario.nombre || null; // Extrae el nombre del usuario o asigna null si no existe
  
    this.cargarEventos();
  
    // Escuchar actualizaciones en los eventos (checklist actualizada)
    this.eventoService.obtenerEventoCreado$().subscribe(() => {
      this.cargarEventos(); // Recargar eventos al recibir notificación
    });
  }
  

  cargarEventos(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idUsuario = usuario?.id_usuario || 0;
  
    if (!idUsuario) {
      console.error('No se encontró el ID del usuario autenticado.');
      return;
    }
  
    this.eventoService.obtenerEventosPorUsuario(idUsuario).subscribe(
      (eventos) => {
        this.eventos = eventos
          .map((evento) => ({
            ...evento,
            checklist: Array.isArray(evento.checklist)
              ? evento.checklist
              : JSON.parse(evento.checklist || '[]'),
            participants: Array.isArray(evento.participants)
              ? evento.participants
              : JSON.parse(evento.participants || '[]'),
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Orden descendente por fecha
  
        this.eventosFiltrados = [...this.eventos];
      },
      (error) => {
        console.error('Error al cargar los eventos:', error);
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
    const fechaMinDate = this.fechaMin ? new Date(this.fechaMin) : null;
    const fechaMaxDate = this.fechaMax ? new Date(this.fechaMax) : null;
    const ahora = new Date();
  
    this.eventosFiltrados = this.eventos.filter((evento) => {
      const fechaEvento = new Date(evento.date);
  
      // Verifica si cumple con la fecha mínima
      const cumpleMinimo = fechaMinDate ? fechaEvento >= fechaMinDate : true;
  
      // Verifica si cumple con la fecha máxima
      const cumpleMaximo = fechaMaxDate ? fechaEvento <= fechaMaxDate : true;
  
      // Verifica si está caducado (si mostrarSoloCaducados está activado)
      const cumpleCaducidad = this.mostrarSoloCaducados ? fechaEvento < ahora : true;
  
      // Verifica si el término de búsqueda coincide con el título o descripción
      const cumpleBusqueda = this.busqueda
        ? evento.title.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          (evento.description || '').toLowerCase().includes(this.busqueda.toLowerCase())
        : true;
  
      return cumpleMinimo && cumpleMaximo && cumpleCaducidad && cumpleBusqueda;
    });
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

  borrarFiltros(): void {
    this.fechaMin = null;
    this.fechaMax = null;
    this.mostrarSoloCaducados = false;
    this.busqueda = ''; // Limpia el término de búsqueda
  
    // Restablece los eventos filtrados a la lista completa
    this.eventosFiltrados = [...this.eventos];
  }
  
  

  cerrarSesion(): void {
    localStorage.clear(); // Limpia todo el almacenamiento local
    this.router.navigate(['/login']); // Redirige al login
  }
  
  
}
