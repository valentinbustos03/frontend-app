import { Cliente } from './cliente.types';
import { Mesa } from './mesa.types';

export enum ReservaEstado {
  PENDIENTE = "PENDIENTE",
  CONFIRMADA = "CONFIRMADA",
  EN_CURSO = "EN_CURSO",
  COMPLETADA = "COMPLETADA",
  CANCELADA = "CANCELADA",
  NO_SHOW = "NO_SHOW",
}

export interface Reserva {
  id: string
  cliente: Cliente
  mesa: Mesa
  fechaHoraInicio: Date
  duracion: number // en minutos
  fechaHoraFin: Date
  cantidadPersonas: number
  notas?: string
  estado: ReservaEstado
  createdAt: Date
  updatedAt: Date
}

export interface CreateReservaRequest {
  clienteId: string
  mesaId: string
  fechaHoraInicio: Date
  duracion: number
  cantidadPersonas: number
  notas?: string
}