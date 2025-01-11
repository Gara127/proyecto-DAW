import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.model';
import { Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = 'http://localhost/proyecto-DAW/backend/eventos.php'; // URL del endpoint PHP
  private eventoCreado = new Subject<Evento>(); // Subject para emitir eventos creados
  private apiUrlEncuestas = 'http://localhost/proyecto-DAW/backend/upcomingEvents.php'; 

  constructor(private http: HttpClient) { }

  // Obtener todos los eventos
  obtenerEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  // Crear un evento
  crearEvento(evento: Evento): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, evento, { headers });
  }

  // Obtener un evento por ID
  obtenerEventoPorId(id_evento: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}?id_evento=${id_evento}`);
  }

  // Actualizar un evento
  actualizarEvento(evento: Evento): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}?id_evento=${evento.id_evento}`, evento, { headers });
  }


  // Actualizar parcialmente un evento
  actualizarEventoParcial(id_evento: number, cambios: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<any>(`${this.apiUrl}?id_evento=${id_evento}`, cambios, { headers });
  }
  
  obtenerTodosEventos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al obtener todos los eventos:', error);
        return throwError(() => error);
      })
    );
  }
  
  // Obtener todas las encuestas
obtenerEncuestas(): Observable<any[]> {
  const apiUrlEncuestas = 'http://localhost/proyecto-DAW/backend/upcomingEvents.php'; // Asegúrate de que esta URL sea correcta
  return this.http.get<any[]>(apiUrlEncuestas).pipe(
    catchError((error) => {
      console.error('Error al obtener encuestas:', error);
      return throwError(() => error); // Retorna el error para el manejo adecuado
    })
  );
}

  



  
  
  


  // Eliminar un evento
  eliminarEvento(id_evento: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}?id_evento=${id_evento}`);
  }

  // Editar un evento
  editarEvento(evento: Evento): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}?id_evento=${evento.id_evento}`, evento, { headers });
  }

  // Notificar sobre un nuevo evento creado
  notificarEventoCreado(evento: Evento) {
    console.log('Evento notificado:', evento); // Verifica aquí
    this.eventoCreado.next(evento);
  }
  

  // Escuchar nuevos eventos creados
  obtenerEventoCreado$(): Observable<Evento> {
    return this.eventoCreado.asObservable(); // Devolver el observable
  }

  // Obtener eventos con filtrado opcional
  obtenerEventosFiltrados(fecha_min?: string, fecha_max?: string, solo_caducados?: boolean): Observable<Evento[]> {
  let params: any = {};
  if (fecha_min) params.fecha_min = fecha_min;
  if (fecha_max) params.fecha_max = fecha_max;
  if (solo_caducados) params.solo_caducados = solo_caducados;

  return this.http.get<Evento[]>(this.apiUrl, { params });
  }


  
}
