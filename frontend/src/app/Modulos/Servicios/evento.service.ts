import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = 'http://localhost/backend/eventos.php'; // URL del endpoint PHP
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

  // Eliminar un evento
  eliminarEvento(id_evento: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}?id_evento=${id_evento}`);
  }
}
