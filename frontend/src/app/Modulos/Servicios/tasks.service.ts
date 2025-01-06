import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private apiUrl = 'http://localhost/proyecto-daw/backend/tareas.php';

  constructor(private http: HttpClient) {}

  crearTarea(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=crear_tarea`, data);
}

obtenerTareasPorEvento(id_evento: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=obtener_tareas&id_evento=${id_evento}`);
}

actualizarEstadoChecklist(id_checklist: number, estado: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}?action=actualizar_estado_checklist`, { id_checklist, estado });
}

}
