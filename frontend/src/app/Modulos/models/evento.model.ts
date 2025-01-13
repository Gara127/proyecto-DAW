export interface Evento {
  id_evento?: number;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  participants?: number[]; // IDs de los participantes
  checklist?: string[]; // Checklist como array de strings
}

  