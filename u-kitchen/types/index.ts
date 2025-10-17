// ============= USUARIO =============
export interface Usuario {
  id: string
  email: string
  fullName: string
  password: string
  phoneNumber: string
  role: UserRole
  profilePicture?: string
  client?: Cliente
  employee?: Empleado
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface CreateUsuarioRequest {
  email: string
  fullName: string
  password?: string  // Opcional para updates
  phoneNumber: string
  role: UserRole
  profilePicture?: string
  client?: {
    id: string
  }
  employee?: {
    id: string
  }
}

// ============= CLIENTE =============
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

// ============= EMPLEADO =============
export interface Empleado {
  id: string
  taxId: string
  shift: string
  workedHours: number
  priceHour: number
  salary?: number
  role: EmployeeRole
  user?: Usuario
  // Campos específicos para Chef
  hierarchy?: string
  tag?: string
  dishes?: Plato[]
  // Campos específicos para Waiter
  calification?: number
  sector?: string
}

export enum EmployeeRole {
  CHEF = "chef",
  WAITER = "waiter",
}

export enum EmployeeShift {
  MAÑANA = "mañana",
  TARDE = "tarde",
  NOCHE = "noche"
}

export interface CreateEmpleadoRequest {
  taxId: string
  shift: string
  workedHours: number
  priceHour: number
  salary?: number
  role: EmployeeRole
  // Campos específicos para Chef
  hierarchy?: string
  tag?: string
  // Campos específicos para Waiter
  calification?: number
  sector?: string
}

// ============= PROVEEDOR =============
export interface Proveedor {
  id: string
  companyName: string
  taxId: string
  mail: string
  phoneNumber: string
  typeIngredient: string
  fullName: string
  bussinessName: string
}

export interface CreateProveedorRequest {
  companyName: string
  taxId: string
  mail: string
  phoneNumber: string
  typeIngredient: string
  fullName: string
  bussinessName: string
}

// ============= MESA =============
export interface Mesa {
  id: string
  cod: string
  capacity: number
  description?: string
  occupied: boolean
  sector: string
}

export interface CreateMesaRequest {
  cod: string
  capacity: number
  description?: string
  occupied: boolean
  sector: string
}

// ============= INGREDIENTE =============
export interface Ingrediente {
  id: string
  cod: string
  name: string
  description?: string
  stock: number
  uniteOfMeasure: UnidadMedida
  origin: string
  stockLimit: number
  suppliers: Proveedor[]
  dishes: Plato[]
}

export interface CreateIngredienteRequest {
  cod: string
  name: string
  description?: string
  stock: number
  uniteOfMeasure: UnidadMedida
  origin: string
  stockLimit: number
  suppliers: {
    id: string;
  }[];
}

export enum UnidadMedida {
  KILOGRAMOS = "kg",
  GRAMOS = "g",
  LITROS = "L",
  MILILITROS = "ml",
  UNIDADES = "unidades",
  PIEZAS = "piezas",
  ONZAS = "oz",
  LIBRAS = "lb",
  GALONES = "gal",
  CUARTOS = "qt",
}

// ============= Plato =============
export interface Plato {
  id: string
  cod: string
  name: string
  description?: string
  picture: string | null
  price: number
  calification?: number
  tag: string
  ingredients: Ingrediente[]
  chef: string
}

export interface CreatePlatoRequest {
  cod: string
  name: string
  description?: string
  picture: string | null
  price: number
  calification?: number
  tag: string
  ingredients: {
        id: string;
    }[];
  chef: Empleado
}

// ============= PEDIDO =============
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

export interface PedidoPlato {
  orderItemId: string
  dish: Plato
  quantity: number
}

export enum PedidoEstado {
  PENDIENTE = "pendiente",
  EN_PREPARACION = "en preparacion",
  LISTO = "listo",
  ENTREGADO = "entregado",
  CANCELADO = "cancelado",
  RECHAZADO = "rechazado",
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

// ============= RESERVA =============
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

export enum ReservaEstado {
  PENDIENTE = "PENDIENTE",
  CONFIRMADA = "CONFIRMADA",
  EN_CURSO = "EN_CURSO",
  COMPLETADA = "COMPLETADA",
  CANCELADA = "CANCELADA",
  NO_SHOW = "NO_SHOW",
}

export interface CreateReservaRequest {
  clienteId: string
  mesaId: string
  fechaHoraInicio: Date
  duracion: number
  cantidadPersonas: number
  notas?: string
}

// ============= FACTURA =============
export interface Factura {
  billId: string
  createdAt: Date
  paymentMethod: string
  order: Pedido
}

// ============= FILTROS =============
export interface PedidoFilters {
  fechaDesde?: Date
  fechaHasta?: Date
  estado?: PedidoEstado
  clienteId?: string
  mesaId?: string
}

export interface EmpleadoFilters {
  search?: string
  shift?: string
  role?: EmployeeRole
  rendimiento?: "alto" | "medio" | "bajo"
}

export interface ClienteFilters {
  search?: string
  penalty?: "alta" | "media" | "baja" | "ninguna"
}

export interface ProveedorFilters {
  search?: string
  typeIngredient?: string
}

export interface MesaFilters {
  capacity?: number
  occupied?: boolean
  sector?: string
}

export interface IngredienteFilters {
  search?: string
  stockBajo?: boolean
  proveedor?: string
  uniteOfMeasure?: string
}

export interface PlatoFilters {
  search?: string
  precioMin?: number
  precioMax?: number
  calificationMin?: number
  tag?: string
}

// ============= RESPONSES =============
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
