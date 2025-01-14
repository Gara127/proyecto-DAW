import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../Servicios/evento.service';
import { FormsModule } from '@angular/forms';
import { VotoService } from '../../Servicios/voto.service';

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-user.component.html',
  styleUrls: ['./home-user.component.css']
})
export class HomeUserComponent implements OnInit {
  eventos: any[] = [];
  eventosFiltrados: any[] = []; // Eventos tras aplicar filtros
  encuestasPorEvento: { [key: number]: { encuestas: any[], nombreEvento?: string } } = {};  // Mapeo de encuestas por ID de evento
  Object = Object; // Asignar Object para usarlo en el template
  encuestas: any[] = [];
  username: string | null = null;
  fechaMin: string | null = null;
  fechaMax: string | null = null;
  mostrarSoloCaducados: boolean = false;

  checklist: string[] = [];
  checklistItem: string = '';
  eventoSeleccionado: any = null;

  searchQuery: string = ''; // Para el texto del buscador


  constructor(
    private router: Router,
    private eventoService: EventoService,
    private votoService: VotoService
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    const idUsuario = localStorage.getItem('id'); // Obtener ID del usuario

    if (!idUsuario) {
        console.error('Usuario no logueado');
        this.router.navigate(['/login']);
        return;
    }

    console.log('ID de usuario obtenido:', idUsuario);

    // Obtener eventos del backend
    this.eventoService.getEventosPorUsuario(Number(idUsuario)).subscribe(
      (eventos) => {
        if (Array.isArray(eventos)) {
          console.log('Eventos recibidos desde el backend:', eventos);
          this.eventos = eventos.map(this.formatearEvento);
          this.eventosFiltrados = [...this.eventos];
        } else {
          console.error('La respuesta del backend no es un array:', eventos);
          this.eventos = []; // Asegúrate de inicializar con un array vacío
          this.eventosFiltrados = [];
        }
      },
      (error) => {
        console.error('Error al cargar eventos:', error);
        alert('Hubo un problema al cargar los eventos.');
      }
    );
    
    
    
}



  cargarEncuestas(): void {
    this.votoService.obtenerTodasEncuestas().subscribe(
      (data) => {
        this.encuestas = Array.isArray(data) ? data : [];
        this.agruparEncuestasPorEvento();
      },
      (error) => console.error('Error al cargar encuestas:', error)
    );
  }

  agruparEncuestasPorEvento(): void {
    this.encuestasPorEvento = {};
    this.encuestas.forEach((encuesta) => {
      const eventoId = encuesta.id_evento;
      if (!this.encuestasPorEvento[eventoId]) {
        const eventoRelacionado = this.eventos.find(e => e.id_evento === eventoId);
        this.encuestasPorEvento[eventoId] = {
          encuestas: [],
          nombreEvento: eventoRelacionado?.title || 'Evento Desconocido',
        };
      }
      this.encuestasPorEvento[eventoId].encuestas.push(encuesta);
    });
  }
  

  formatearEvento(evento: any): any {
    return {
      ...evento,
      checklist: Array.isArray(evento.checklist)
        ? evento.checklist
        : typeof evento.checklist === 'string'
        ? JSON.parse(evento.checklist || '[]')
        : [],
      participants: Array.isArray(evento.participants)
        ? evento.participants
        : typeof evento.participants === 'string'
        ? JSON.parse(evento.participants || '[]')
        : [],
    };
  }
  

  eliminarEvento(id_evento: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      this.eventoService.eliminarEvento(id_evento).subscribe(
        () => {
          this.eventos = this.eventos.filter((evento) => evento.id_evento !== id_evento);
          alert('Evento eliminado con éxito.');
        },
        (error) => console.error('Error al eliminar evento:', error)
      );
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
      const cumpleMinimo = fechaMinDate ? fechaEvento >= fechaMinDate : true;
      const cumpleMaximo = fechaMaxDate ? fechaEvento <= fechaMaxDate : true;
      const cumpleCaducidad = this.mostrarSoloCaducados ? fechaEvento < ahora : true;
  
      const query = this.searchQuery.toLowerCase();
      const cumpleBusqueda =
        query === '' ||
        evento.title.toLowerCase().includes(query) ||
        (evento.location && evento.location.toLowerCase().includes(query)) ||
        (evento.description && evento.description.toLowerCase().includes(query)) ||
        evento.participants.some((p: any) => p.nombre.toLowerCase().includes(query)) ||
        evento.checklist.some((item: string) => item.toLowerCase().includes(query));
  
      return cumpleMinimo && cumpleMaximo && cumpleCaducidad && cumpleBusqueda;
    });
  }

  abrirChecklist(idEvento: number): void {
    this.eventoSeleccionado = this.eventos.find((evento) => evento.id_evento === idEvento);
    if (this.eventoSeleccionado) {
      this.checklist = Array.isArray(this.eventoSeleccionado.checklist)
        ? this.eventoSeleccionado.checklist
        : typeof this.eventoSeleccionado.checklist === 'string'
        ? JSON.parse(this.eventoSeleccionado.checklist)
        : [];
    }
  }

  agregarElemento(): void {
    if (this.checklistItem.trim() && !this.checklist.includes(this.checklistItem.trim())) {
      this.checklist.push(this.checklistItem.trim());
      this.checklistItem = '';
    }
  }

  eliminarElemento(index: number): void {
    this.checklist.splice(index, 1);
  }

  guardarChecklist(): void {
    if (this.eventoSeleccionado?.id_evento) {
      const datosActualizar = { checklist: JSON.stringify(this.checklist) };
      this.eventoService.actualizarEventoParcial(this.eventoSeleccionado.id_evento, datosActualizar).subscribe(
        () => alert('Checklist actualizada con éxito.'),
        (error) => console.error('Error al actualizar la checklist:', error)
      );
    }
  }
  
  
  resetFilters(): void {
    this.fechaMin = null;
    this.fechaMax = null;
    this.mostrarSoloCaducados = false;
    this.searchQuery = ''; // Reinicia el buscador
    this.eventosFiltrados = [...this.eventos]; // Vuelve a mostrar todos los eventos
  }
  

  navigateToCreateEvent(): void {
    this.router.navigate(['/event-creator']);
  }

  navigateToCreatePoll(): void {
    this.router.navigate(['/voting']);
  }

  cerrarSesion(): void {
    // Eliminar datos de sesión almacenados en localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    localStorage.removeItem('token');
  
    // Redirigir al usuario a la página de inicio de sesión
    this.router.navigate(['/login']);
  }
  
}
