import { PedidoEstado } from "@/types/pedido.types"
import { EmployeeRole, EmployeeShift } from "@/types/empleado.types"
import { UnidadMedida } from "@/types/ingrediente.types"
import { UserRole } from "@/types/usuario.types"
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  ChefHat,
  Coffee,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react"

export const estadoLabels: Record<PedidoEstado, string> = {
  [PedidoEstado.PENDIENTE]: "Pendiente",
  [PedidoEstado.EN_PREPARACION]: "En Preparación",
  [PedidoEstado.LISTO]: "Listo",
  [PedidoEstado.ENTREGADO]: "Entregado",
  [PedidoEstado.CANCELADO]: "Cancelado",
  [PedidoEstado.RECHAZADO]: "Rechazado",
}

export const estadoColors: Record<PedidoEstado, string> = {
  [PedidoEstado.PENDIENTE]: "bg-yellow-100 text-yellow-800",
  [PedidoEstado.EN_PREPARACION]: "bg-blue-100 text-blue-800",
  [PedidoEstado.LISTO]: "bg-green-100 text-green-800",
  [PedidoEstado.ENTREGADO]: "bg-gray-100 text-gray-800",
  [PedidoEstado.CANCELADO]: "bg-red-100 text-red-800",
  [PedidoEstado.RECHAZADO]: "bg-red-100 text-red-800",
}

export const estadoIcons: Record<PedidoEstado, LucideIcon> = {
  [PedidoEstado.PENDIENTE]: Clock,
  [PedidoEstado.EN_PREPARACION]: AlertCircle,
  [PedidoEstado.LISTO]: CheckCircle,
  [PedidoEstado.ENTREGADO]: CheckCircle,
  [PedidoEstado.CANCELADO]: XCircle,
  [PedidoEstado.RECHAZADO]: Ban,
}

export const employeeRoleLabels: Record<EmployeeRole, string> = {
  [EmployeeRole.CHEF]: "Chef",
  [EmployeeRole.WAITER]: "Mesero",
}

export const employeeRoleIcons: Record<EmployeeRole, LucideIcon> = {
  [EmployeeRole.CHEF]: ChefHat,
  [EmployeeRole.WAITER]: Coffee,
}

export const employeeShiftLabels: Record<EmployeeShift, string> = {
  [EmployeeShift.MAÑANA]: "Mañana",
  [EmployeeShift.TARDE]: "Tarde",
  [EmployeeShift.NOCHE]: "Noche",
}

export const employeeShiftIcons: Record<EmployeeShift, LucideIcon> = {
  [EmployeeShift.MAÑANA]: Sun,
  [EmployeeShift.TARDE]: Sunset,
  [EmployeeShift.NOCHE]: Moon,
}

export const unidadMedidaLabels: Record<UnidadMedida, string> = {
  [UnidadMedida.KILOGRAMOS]: "Kilogramos (kg)",
  [UnidadMedida.GRAMOS]: "Gramos (g)",
  [UnidadMedida.LITROS]: "Litros (L)",
  [UnidadMedida.MILILITROS]: "Mililitros (ml)",
  [UnidadMedida.UNIDADES]: "Unidades",
  [UnidadMedida.PIEZAS]: "Piezas",
  [UnidadMedida.ONZAS]: "Onzas (oz)",
  [UnidadMedida.LIBRAS]: "Libras (lb)",
  [UnidadMedida.GALONES]: "Galones (gal)",
  [UnidadMedida.CUARTOS]: "Cuartos (qt)",
}

export const userRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.USER]: "Usuario",
}

export const userRoleIcons: Record<UserRole, LucideIcon> = {
  [UserRole.ADMIN]: ShieldCheck,
  [UserRole.USER]: User,
}