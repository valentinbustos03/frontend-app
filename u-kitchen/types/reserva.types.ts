import { Cliente } from './cliente.types';
import { Mesa } from './mesa.types';

export enum ReservaEstado {
  PENDIENTE = "pendiente",
  CONFIRMADA = "confirmada",
  CANCELADA = "cancelada",
  COMPLETADA = "completada",
}

// `dateTime` es el ISO que manda el backend, no un Date.
export interface Reserva {
  id: string
  dateTime: string
  numberOfPeople: number
  status: ReservaEstado
  client: Cliente
  table: Mesa
}

export interface CreateReservaRequest {
  dateTime: string
  numberOfPeople: number
  status: ReservaEstado
  client: {
    id: string
  }
  table: {
    id: string
  }
}

// Filtros para Reserva
export interface ReservaFilters {
  estado?: ReservaEstado
  fecha?: string
  mesaId?: string
}
