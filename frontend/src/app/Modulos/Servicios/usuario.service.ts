import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost/backend/usuarios.php'; // URL del endpoint PHP
  
  constructor(private http: HttpClient) {}

  // Método para obtener todos los usuarios
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Método para crear un usuario (si lo necesitas para el registro)
  crearUsuario(usuario: { nombre: string; pass: string; rol: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, usuario, { headers });
  }

  // Método para eliminar un usuario
  eliminarUsuario(id_usuario: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<any>(`${this.apiUrl}/${id_usuario}`, { headers });
}

  // Método para iniciar sesión
  iniciarSesion(usuario: { username: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/login`, usuario, { headers }); 
  }

  obtenerUsuarioPorId(id_usuario: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?id_usuario=${id_usuario}`);
}
  
  actualizarUsuario(id_usuario: number, usuario: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.apiUrl}?id_usuario=${id_usuario}`, usuario, { headers });
  }

  iniciarUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?init=true`);
  }
 
}