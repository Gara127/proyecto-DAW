export interface Usuario {
  id_usuario: number;       // ID, se genera automáticamente
  nombre: string;           // Nombre de usuario
  password?: string;        // Contraseña (opcional)
  rol?: string;             // Rol (opcional, si se necesita)
  error?: string;           // Campo para almacenar posibles errores
}