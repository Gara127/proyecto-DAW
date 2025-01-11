export interface Usuario {
    id_usuario: number; //id se genera automáticamente
    nombre: string;  // Nombre de usuario
    password: string;  // Contraseña
    rol?: string;      // Rol (opcional, si se necesita)
    error?: string;      // Rol (opcional, si se necesita)
  }