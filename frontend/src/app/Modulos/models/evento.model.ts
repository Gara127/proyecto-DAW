export interface Evento {
  id_evento?: number;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  participants?: { id_usuario: number; nombre: string }[]; // Cambiar a objetos con ID y nombre
  checklist?: string[]; // Checklist como array de strings
}


  