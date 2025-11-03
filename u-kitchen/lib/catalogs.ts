import { type Pedido, PedidoEstado } from "@/types/pedido.types"
import { Clock, AlertCircle, CheckCircle, XCircle} from "lucide-react";

type EstadoLabel = Record<PedidoEstado, string>;

export const estadoLabels: EstadoLabel = {
  [PedidoEstado.PENDIENTE]: "Pendiente",
  [PedidoEstado.EN_PREPARACION]: "En Preparación",
  [PedidoEstado.LISTO]: "Listo",
  [PedidoEstado.ENTREGADO]: "Entregado",
  [PedidoEstado.CANCELADO]: "Cancelado",
  [PedidoEstado.RECHAZADO]: "Rechazado",
};

export const estadoColors = {
  [PedidoEstado.PENDIENTE]: "bg-yellow-100 text-yellow-800",
  [PedidoEstado.EN_PREPARACION]: "bg-blue-100 text-blue-800",
  [PedidoEstado.LISTO]: "bg-green-100 text-green-800",
  [PedidoEstado.ENTREGADO]: "bg-gray-100 text-gray-800",
  [PedidoEstado.CANCELADO]: "bg-red-100 text-red-800",
  [PedidoEstado.RECHAZADO]: "bg-red-100 text-red-800",
}

export const estadoIcons = {
  [PedidoEstado.PENDIENTE]: Clock,
  [PedidoEstado.EN_PREPARACION]: AlertCircle,
  [PedidoEstado.LISTO]: CheckCircle,
  [PedidoEstado.ENTREGADO]: CheckCircle,
  [PedidoEstado.CANCELADO]: XCircle,
  [PedidoEstado.RECHAZADO]: XCircle,
}