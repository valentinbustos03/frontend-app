import { Pedido } from './pedido.types';

export interface Factura {
  billId: string
  createdAt: Date
  paymentMethod: string
  order: Pedido
}