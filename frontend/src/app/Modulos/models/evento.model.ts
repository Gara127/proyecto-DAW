export interface Evento{
    id_evento?: number;      // Opcional, ya que se generará automáticamente
    title: string;           
    date: string;            
    time: string;            
    location: string;       
    description: string;
    participants?: number[]; // lista id de usuarios
    checklist?: string | string[]; // Puede ser un array de strings o un string JSON}
}