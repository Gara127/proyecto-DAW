import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class VotoService {
  private apiUrl = 'http://localhost/backend/upcomingEvents.php'; 

  constructor(private http: HttpClient) {}

  // Obtener todas las encuestas
  obtenerTodasEncuestas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al obtener todas las encuestas:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener encuestas filtradas por id_evento
  obtenerEncuestasPorEvento(idEvento: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?id_evento=${idEvento}`).pipe(
      catchError((error) => {
        console.error('Error al obtener las encuestas por evento:', error);
        return throwError(() => error);
      })
    );
  }

  // Crear una nueva encuesta
  crearEncuesta(
    idUsuario: number,
    idEvento: number,
    name: string,
    time: string,
    date: string,
    location: string
  ): Observable<any> {
    
    const data = { id_usuario: idUsuario, id_evento: idEvento, name, time, date, location };

    console.log('Datos enviados al backend (servicio):', data); // Para depuración

    return this.http.post(`${this.apiUrl}`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }).pipe(
      catchError((error) => {
        console.error('Error al crear la encuesta:', error.error?.message || error.message);
        return throwError(() => new Error(error.error?.message || 'Error al crear la encuesta'));
      })
    );
  }

  // Registrar o actualizar un voto
  votarEncuesta(idUsuario: number, idVoting: number, voto: number): Observable<any> {
    const data = { id_usuario: idUsuario, id_voting: idVoting, voto };

    return this.http.put(`${this.apiUrl}`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }).pipe(
      catchError((error) => {
        console.error('Error al votar en la encuesta:', error);
        return throwError(() => new Error('Error al votar en la encuesta'));
      })
    );
  }

  // Eliminar un voto de una encuesta
  eliminarVotoEncuesta(idUsuario: number, idVoting: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id_usuario=${idUsuario}&id_voting=${idVoting}`).pipe(
      catchError((error) => {
        console.error('Error al eliminar el voto de la encuesta:', error);
        return throwError(() => new Error('Error al eliminar el voto de la encuesta'));
      })
    );
  }
}

