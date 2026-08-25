import { Cliente } from './cliente.types';
import { Empleado } from './empleado.types';
import { Mesa } from './mesa.types';
import { Plato } from './plato.types';
import { Factura } from './factura.types';

export enum PedidoEstado {
  PENDIENTE = "pendiente",
  EN_PREPARACION = "en preparacion",
  LISTO = "listo",
  ENTREGADO = "entregado",
  CANCELADO = "cancelado",
  RECHAZADO = "rechazado",
}

export interface PedidoPlato {
  orderItemId: string
  dish: Plato
  quantity: number
}

export interface Pedido {
  orderId: string
  description?: string
  status: PedidoEstado
  startTime: Date
  estimatedEndTime: Date
  endTime: Date
  subtotal: number
  orderItems: PedidoPlato[]
  client: Cliente
  waiter: Empleado
  table: Mesa
  bill?: Factura
}

export interface UpdatePedidoRequest {
  status: PedidoEstado
  description?: string
}

export interface CreatePedidoRequest {
  description?: string;
  status: PedidoEstado;  // e.g., "pendiente" (usa el enum PedidoEstado si lo prefieres: PedidoEstado)
  estimatedEndTime: string;  // Formato ISO: "2025-08-08T15:00:00Z"
  endTime?: string | null;  // Opcional, null por defecto si no se usa
  orderItems: {
    dish: {
      id: string;
    };
    quantity: number;
  }[];
  client: {
    id: string;
  };
  table: {
    id: string;
  };
  waiter: {
    id: string;
  }
}

// Detalle que manda el backend en los errores de negocio del pedido.
export interface FaltanteStock {
  id: string
  name: string
  stock: number
  required: number
}

export interface ReferenciaFaltante {
  tipo: "client" | "table" | "waiter" | "dish"
  id: string
}

export interface TransicionInvalida {
  from: PedidoEstado
  to: PedidoEstado
}

// Filtros que acepta GET /order/findAll
export interface PedidoFilters {
  status?: PedidoEstado
  date?: string // YYYY-MM-DD
}