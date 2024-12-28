import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../Servicios/evento.service';
import { FormsModule } from '@angular/forms'; // Importar FormsModule para manejo de formularios

@Component({
  selector: 'app-home-user', // Selector del componente
  standalone: true, // Define que el componente no requiere un módulo externo
  imports: [CommonModule, FormsModule], // Importa módulos necesarios
  templateUrl: './home-user.component.html', // Ruta de la plantilla HTML
  styleUrls: ['./home-user.component.css'] // Ruta de la hoja de estilos
})
export class HomeUserComponent implements OnInit {
  eventos: any[] = []; // Lista de eventos cargados
  username: string | null = null; // Nombre del usuario para mostrar en el encabezado
  fechaMin: string | null = null; // Filtro: Fecha mínima
  fechaMax: string | null = null; // Filtro: Fecha máxima
  mostrarSoloCaducados: boolean = false; // Filtro: Mostrar eventos caducados

  constructor(private router: Router, private eventoService: EventoService) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username'); // Recuperar el nombre del usuario almacenado
    this.cargarEventos(); // Cargar eventos al inicializar el componente

    // Escuchar nuevos eventos creados y agregar dinámicamente a la lista
    this.eventoService.obtenerEventoCreado$().subscribe((nuevoEvento) => {
      if (nuevoEvento) {
        this.eventos.unshift(nuevoEvento); // Agregar el nuevo evento al inicio de la lista
      }
    });
  }

  navigateToCreateEvent(): void {
    // Redirige al formulario para crear un nuevo evento
    this.router.navigate(['/event-creator']);
  }

  cargarEventos(): void {
    // Cargar eventos desde el servicio
    this.eventoService.obtenerEventos().subscribe((data) => {
      if (data && Array.isArray(data)) {
        this.eventos = data; // Asignar eventos al array
      } else {
        console.error('Error: Los datos de eventos no son un array válido.');
        this.eventos = [];
      }
    }, (error) => {
      console.error('Error al cargar eventos:', error);
      this.eventos = [];
    });
  }

  eliminarEvento(id_evento: number): void {
    // Elimina un evento seleccionado después de confirmar
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      this.eventoService.eliminarEvento(id_evento).subscribe(() => {
        this.eventos = this.eventos.filter(evento => evento.id_evento !== id_evento); // Filtra el evento eliminado
        alert('Evento eliminado con éxito.');
      }, error => {
        console.error('Error al eliminar el evento:', error);
        alert('Error al eliminar el evento.');
      });
    }
  }

  editarEvento(evento: any): void {
    // Redirige al formulario de edición pasando el id del evento como parámetro
    this.router.navigate(['/event-creator'], { queryParams: { id_evento: evento.id_evento } });
  }

  aplicarFiltros(): void {
    // Aplica filtros de fecha y caducidad en la lista de eventos
    this.eventoService.obtenerEventosFiltrados(
      this.fechaMin || undefined, 
      this.fechaMax || undefined, 
      this.mostrarSoloCaducados
    ).subscribe(
      (data) => {
        if (data && Array.isArray(data)) {
          this.eventos = data; // Actualiza la lista de eventos con los datos filtrados
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

  esEventoCaducado(evento: any): boolean {
    // Verifica si un evento ya ocurrió comparando su fecha con la actual
    const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato 'YYYY-MM-DD'
    return evento.date < today; // Devuelve true si la fecha del evento es anterior a hoy
  }
}
