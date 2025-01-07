export interface Usuario {
    id_usuario: number; //id se genera automáticamente
    username: string;  // Nombre de usuario
    password: string;  // Contraseña
    rol?: string;      // Rol (opcional, si se necesita)
  }