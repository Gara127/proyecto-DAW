import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VotoService {
  private apiUrl = 'http://localhost/proyecto-daw/backend/upcomingEvents.php'; // URL del endpoint PHP

  constructor(private http: HttpClient) {}

  // Obtener todos los eventos de un grupo
  obtenerUpcomingEventsPorGrupo(idGrupo: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?id_grupo=${idGrupo}`).pipe(
      catchError((error) => {
        console.error('Error al obtener los eventos por grupo:', error);
        return throwError(() => error); // Retorna el error completo para depuración
      })
    );
  }

  // Obtener un evento específico por id_voting
  obtenerUpcomingEventPorId(id_voting: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?id_voting=${id_voting}`).pipe(
      catchError((error) => {
        console.error('Error al obtener el evento:', error);
        return throwError(() => new Error('Error al obtener el evento'));
      })
    );
  }

  // Crear un nuevo evento para un grupo
  crearUpcomingEvent(idUsuario: number, idGrupo: number, name: string, time: string, date: string, location: string): Observable<any> {
    const data = { id_usuario: idUsuario, id_grupo: idGrupo, name, time, date, location };
  
    console.log('Datos enviados al backend (servicio):', data); // Depuración
  
    return this.http.post(`${this.apiUrl}`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }).pipe(
      catchError((error) => {
        console.error('Error al crear el evento:', error);
        return throwError(() => new Error('Error al crear el evento'));
      })
    );
  }

  // Votar por un evento
  votarUpcomingEvent(idUsuario: number, id_voting: number, voto: number): Observable<any> {
    const data = { id_usuario: idUsuario, id_voting, voto };
    return this.http.put(`${this.apiUrl}`, data).pipe(
      catchError((error) => {
        console.error('Error al votar por el evento:', error);
        return throwError(() => new Error('Error al votar por el evento'));
      })
    );
  }

  // Eliminar un voto
  eliminarVotoUpcomingEvent(idUsuario: number, id_voting: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id_usuario=${idUsuario}&id_voting=${id_voting}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar el voto:', error);
        return throwError(() => new Error('Error al eliminar el voto'));
      })
    );
  }
}

