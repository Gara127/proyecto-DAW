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
  mensajeChecklist: string | null = null;

  constructor(
    private router: Router,
    private eventoService: EventoService,
    private votoService: VotoService
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    const idUsuario = localStorage.getItem('id'); // Obtener ID del usuario
    this.cargarEncuestas();

    if (!idUsuario) {
      console.error('Usuario no logueado');
      this.router.navigate(['/login']);
      return;
    }

    console.log('ID de usuario obtenido:', idUsuario);

        // Obtener eventos y encuestas del backend
    this.eventoService.getEventosPorUsuario(Number(idUsuario)).subscribe(
      (eventos) => {
        if (Array.isArray(eventos)) {
          console.log('Eventos recibidos desde el backend:', eventos);
          this.eventos = eventos.map(this.formatearEvento);
          this.eventosFiltrados = [...this.eventos];
          this.cargarEncuestas(); // Cargar encuestas después de obtener los eventos
    } else {
      console.error('La respuesta del backend no es un array:', eventos);
      this.eventos = [];
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
      (encuestas) => {
        this.encuestas = encuestas;
        this.encuestas = Array.isArray(encuestas) ? encuestas : [];
        this.agruparEncuestasPorEvento();
  
        // Obtener los votos acumulados
        this.votoService.obtenerVotos().subscribe(
          (votos) => {
            this.encuestas = this.encuestas.map((encuesta) => {
              const voto = votos.find((v) => v.id_voting === encuesta.id_voting);
              console.log("los votos sonnn:", voto);
              return {
                ...encuesta,
                total_votos: voto ? voto.total_votos : 0, // Asignar los votos acumulados
              };
            });
          },
          (error) => console.error('Error al cargar votos:', error)
        );
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
    console.log('Agrupación de encuestas:', this.encuestasPorEvento);
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
          // Filtrar el evento eliminado tanto en 'eventos' como en 'eventosFiltrados'
          this.eventos = this.eventos.filter((evento) => evento.id_evento !== id_evento);
          this.eventosFiltrados = this.eventosFiltrados.filter((evento) => evento.id_evento !== id_evento);
          alert('Evento eliminado con éxito.');
        },
        (error) => {
          console.error('Error al eliminar el evento:', error);
          alert('Error al eliminar el evento.');
        }
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
        () => {
          alert('Checklist actualizada con éxito.');
          this.router.navigate(['/home-user']); // Redirigir a Home User
        },
        (error) => console.error('Error al actualizar la checklist:', error)
      );
    }
  }

  //  // Función para cargar encuestas con los votos acumulados
  //  cargarEncuestasConVotos(): void {
  //   this.votoService.obtenerTodasEncuestas().subscribe(
  //     (encuestas) => {
  //       this.encuestas = encuestas;
  
  //       // Obtener los votos acumulados
  //       this.votoService.obtenerVotos().subscribe(
  //         (votos) => {
  //           this.encuestas = this.encuestas.map((encuesta) => {
  //             const voto = votos.find((v) => v.id_voting === encuesta.id_voting);
  //             return {
  //               ...encuesta,
  //               total_votos: voto ? voto.total_votos : 0, // Asignar los votos acumulados
  //             };
  //           });
  //         },
  //         (error) => console.error('Error al cargar votos:', error)
  //       );
  //     },
  //     (error) => console.error('Error al cargar encuestas:', error)
  //   );
  // }

  votarEncuesta(idVoting: number): void {
    const idUsuario = localStorage.getItem('id');
    if (!idUsuario) {
      alert('Debes iniciar sesión para votar.');
      return;
    }
  
    const voto = 1; // Valor del voto (puedes configurarlo a 1 o 0)
  
    // Llamar al servicio para registrar el voto
    this.votoService.votarEncuesta(Number(idUsuario), idVoting, voto).subscribe(
      () => {
        alert('Voto registrado correctamente.');
        this.cargarEncuestas();
  
        // Actualizamos los votos en el frontend inmediatamente
        const encuesta = this.encuestas.find(e => e.id_voting === idVoting);
        if (encuesta) {
          encuesta.total_votos = (encuesta.total_votos || 0) + 1;  // Sumar votos en el frontend
        }
  
        // Recargar las encuestas con los votos actualizados desde el backend
        this.cargarEncuestas();
      },
      (error) => {
        console.error('Error al votar en la encuesta:', error);
        alert('Hubo un error al registrar el voto.');
      }
    );
  }

  eliminarVoto(idVoting: number): void {
    const idUsuario = localStorage.getItem('id');
    if (!idUsuario) {
      alert('Debes iniciar sesión para eliminar el voto.');
      return;
    }
    // Llamar al servicio para eliminar el voto
    console.log("aquíiii", idVoting);
    this.votoService.eliminarVotoEncuesta(Number(idUsuario), idVoting).subscribe(
      () => {
        // Recargar las encuestas con los votos actualizados desde el backend
        this.cargarEncuestas();
  
        alert('Voto eliminado correctamente.');
      },
      (error) => {
        console.error('Error al eliminar el voto:', error);
        alert('Hubo un error al eliminar el voto.');
      }
    );
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


