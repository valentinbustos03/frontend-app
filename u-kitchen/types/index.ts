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
  dishes?: Producto[]
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
  ingredients: Ingrediente[]
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
  order: Pedido[]
}

export interface CreateMesaRequest {
  cod: string
  capacity: number
  description?: string
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
  dishes: Producto[]
}

export interface CreateIngredienteRequest {
  cod: string
  name: string
  description?: string
  stock: number
  uniteOfMeasure: UnidadMedida
  origin: string
  stockLimit: number
  suppliers: string[]
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

// ============= PRODUCTO =============
export interface Producto {
  id: string
  cod: string
  name: string
  description?: string
  picture?: string
  price: number
  calification?: number
  tag: string
  ingredients: Ingrediente[]
  chef: Empleado
}

export interface CreateProductoRequest {
  cod: string
  name: string
  description?: string
  picture?: string
  price: number
  calification?: number
  tag: string
  ingredientIds: string[]
  chefId: string
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
  orderItems: PedidoProducto[]
  client: Cliente
  table: Mesa
  bill?: Factura
}

export interface PedidoProducto {
  orderItemId: string
  dish: Producto
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
  description?: string
  estimatedEndTime: Date
  clientId: string
  tableId: string
  orderItems: {
    dishId: string
    quantity: number
  }[]
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

export interface ProductoFilters {
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
