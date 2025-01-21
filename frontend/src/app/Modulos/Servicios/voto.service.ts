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
  obtenerTodasEncuestas(idUsuario: number): Observable<any[]> {
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
    return this.http.put(`${this.apiUrl}`, data);
  }
  /*obtenerVotosPorEncuesta(idVoting: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?id_voting=${idVoting}`); // Método GET para obtener votos
  } */

    // Obtener las encuestas y sus votos acumulados
  obtenerEncuestasConVotos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?votos=true`); // Ajustar para que el backend calcule y devuelva los votos totales
  }

  obtenerVotos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?votos=true`).pipe(
      catchError((error) => {
        console.error('Error al obtener votos:', error);
        return throwError(() => error);
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
  eliminarEncuesta(id_voting: number): Observable<void> {
    const url = `${this.apiUrl}?id_voting=${id_voting}`; 
    return this.http.delete<void>(url);
  }
}


