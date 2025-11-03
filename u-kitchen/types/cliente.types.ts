import { Usuario } from './usuario.types';
import { Pedido } from './pedido.types';

export interface Cliente {
  id: string
  dni: number
  penalty: number
  orderHistory: Pedido[]
  user?: Usuario
}

export interface CreateClienteRequest {
  dni: number
  penalty?: number
}

// Filtros para Cliente
export interface ClienteFilters {
  search?: string
  penalty?: "alta" | "media" | "baja" | "ninguna"
}