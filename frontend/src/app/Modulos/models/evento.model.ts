export interface Evento {
    id_evento?: number; 
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    participants?: string[]; // Lista de nombres de participantes
    checklist?: string[]; // Lista de tareas en la checklist
  }
  