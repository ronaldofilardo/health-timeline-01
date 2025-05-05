
// Event types
export type EventType = 'Consulta' | 'Exame' | 'Sessões' | 'Prescrição';

// File types
export type FileType = 'Requisição' | 'Autorização' | 'Atestado' | 'Prescrição' | 'Laudo/Resultado' | 'Nota Fiscal';

// Event status
export type EventStatus = 'past' | 'ongoing' | 'today' | 'future';

// Event model
export interface Event {
  id: number;
  type: EventType;
  eventDate: string; // DD/MM/YYYY format
  startTime: string; // HH:MM format
  endTime: string | null; // HH:MM format, null for Prescrição
  professionalId: number;
  professionalName: string;
  specialtyName: string;
  locationName: string;
  observation?: string;
  isFirstConsultation?: boolean; // Only for Consulta
  preparation?: string; // Only for Exame
  isConfirmed: boolean;
  confirmationDeadline?: string; // ISO date string
  files: EventFile[];
  status: EventStatus;
  isDeleted: boolean;
  deletedAt?: string; // ISO date string
}

// Professional model
export interface Professional {
  id: number;
  name: string;
  specialtyId: number;
  specialtyName: string;
  locationId: number;
  locationName: string;
  isDeleted: boolean;
}

// Specialty model
export interface Specialty {
  id: number;
  name: string;
}

// Location model
export interface Location {
  id: number;
  name: string;
}

// File model
export interface EventFile {
  id: number;
  eventId: number;
  type: FileType;
  path: string;
  uuid: string;
  isDeleted: boolean;
}

// Holiday model
export interface Holiday {
  id: number;
  date: string; // YYYY-MM-DD format
  name: string;
  isRecurring: boolean;
}

// User model
export interface User {
  id: number;
  login: string;
}
