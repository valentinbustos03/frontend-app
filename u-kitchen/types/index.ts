// ============= USUARIO =============
export interface Usuario {
  id: string
  mail: string
  contraseña: string
  tel: string
  nombreApellido: string
  rol: UserRole
  estado: UserStatus
  fotoPerfil?: string
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = "ADMIN",
  CLIENTE = "CLIENTE",
  EMPLEADO = "EMPLEADO",
  MESERO = "MESERO",
  CHEF = "CHEF",
}

export enum UserStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  SUSPENDIDO = "SUSPENDIDO",
}

// ============= CLIENTE =============
export interface Cliente {
  id: string
  usuario: Usuario
  historialPedidos: Pedido[]
  penalizacion: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateClienteRequest {
  mail: string
  contraseña: string
  tel: string
  nombreApellido: string
  penalizacion?: number
}

// ============= EMPLEADO =============
export interface Empleado {
  id: string
  nombre: string
  apellido: string
  cuitCuil: string
  turno: Turno
  horasTrabajadas: number
  precioPorHora: number
  sueldo: number // calculado: horasTrabajadas * precioPorHora
  tipo: EmpleadoTipo
  // Campos específicos para Mesero
  calificacion?: number
  // Campos específicos para Chef
  jerarquia?: ChefJerarquia
  listaProductosEncargado?: string[]
  createdAt: Date
  updatedAt: Date
}

export enum Turno {
  MAÑANA = "MAÑANA",
  TARDE = "TARDE",
  NOCHE = "NOCHE",
  COMPLETO = "COMPLETO",
}

export enum EmpleadoTipo {
  MESERO = "MESERO",
  CHEF = "CHEF",
  CAJERO = "CAJERO",
  ADMINISTRADOR = "ADMINISTRADOR",
  LIMPIEZA = "LIMPIEZA",
}

export enum ChefJerarquia {
  CHEF_EJECUTIVO = "CHEF_EJECUTIVO",
  SOUS_CHEF = "SOUS_CHEF",
  CHEF_DE_PARTIDA = "CHEF_DE_PARTIDA",
  COCINERO = "COCINERO",
  AYUDANTE_COCINA = "AYUDANTE_COCINA",
}

export interface CreateEmpleadoRequest {
  nombre: string
  apellido: string
  cuitCuil: string
  turno: Turno
  horasTrabajadas: number
  precioPorHora: number
  tipo: EmpleadoTipo
  jerarquia?: ChefJerarquia
  calificacion?: number
  listaProductosEncargado?: string[]
}

// ============= PROVEEDOR =============
export interface Proveedor {
  id: string
  razonSocial: string
  cuitCuil: string
  mail: string
  telefono: string
  tipoIngrediente: string
  nombre: string
  compania: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProveedorRequest {
  razonSocial: string
  cuitCuil: string
  mail: string
  telefono: string
  tipoIngrediente: string
  nombre: string
  compania: string
}

// ============= MESA =============
export interface Mesa {
  id: string
  cod: string
  capacidad: number
  ocupada: boolean
  descripcion?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateMesaRequest {
  cod: string
  capacidad: number
  descripcion?: string
}

// ============= INGREDIENTE =============
export interface Ingrediente {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  stock: number
  unidad: UnidadMedida
  proveedores: Proveedor[]
  origen: string
  limiteBajoStock: number
  createdAt: Date
  updatedAt: Date
}

export enum UnidadMedida {
  KILOGRAMOS = "KILOGRAMOS",
  GRAMOS = "GRAMOS",
  LITROS = "LITROS",
  MILILITROS = "MILILITROS",
  UNIDADES = "UNIDADES",
  PIEZAS = "PIEZAS",
}

export interface CreateIngredienteRequest {
  codigo: string
  nombre: string
  descripcion: string
  stock: number
  proveedorIds: string[]
  unidad: UnidadMedida
  origen: string
  limiteBajoStock: number
}

// ============= PRODUCTO =============
export interface Producto {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  imagen?: string
  calificacion: number
  precio: number
  ingredientes: Ingrediente[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductoRequest {
  codigo: string
  nombre: string
  descripcion: string
  imagen?: string
  precio: number
  ingredienteIds: string[]
}

// ============= PEDIDO =============
export interface Pedido {
  id: string
  cliente: Cliente
  mesa?: Mesa
  mesero?: Empleado
  descripcion: string
  estado: PedidoEstado
  fechaHoraInicio: Date
  fechaHoraFin?: Date
  fechaHoraFinEstimada: Date
  subtotal: number
  total: number // calculado: suma de productos * cantidad + impuestos/descuentos
  productos: PedidoProducto[]
  reserva?: Reserva
  factura?: Factura
  createdAt: Date
  updatedAt: Date
}

export interface PedidoProducto {
  producto: Producto
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export enum PedidoEstado {
  PENDIENTE = "PENDIENTE",
  EN_PREPARACION = "EN_PREPARACION",
  LISTO = "LISTO",
  ENTREGADO = "ENTREGADO",
  CANCELADO = "CANCELADO",
}

export interface CreatePedidoRequest {
  clienteId: string
  mesaId?: string
  meseroId?: string
  descripcion: string
  fechaHoraFinEstimada: Date
  productos: {
    productoId: string
    cantidad: number
  }[]
  reservaId?: string
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
  id: string
  pedido: Pedido
  metodoPago: MetodoPago
  fechaHoraEmision: Date
  total: number
  createdAt: Date
  updatedAt: Date
}

export enum MetodoPago {
  EFECTIVO = "EFECTIVO",
  TARJETA_CREDITO = "TARJETA_CREDITO",
  TARJETA_DEBITO = "TARJETA_DEBITO",
  TRANSFERENCIA = "TRANSFERENCIA",
  MERCADO_PAGO = "MERCADO_PAGO",
}

// ============= FILTROS =============
export interface PedidoFilters {
  fechaDesde?: Date
  fechaHasta?: Date
  estado?: PedidoEstado
  clienteId?: string
  meseroId?: string
  mesaId?: string
}

export interface EmpleadoFilters {
  turno?: Turno
  tipo?: EmpleadoTipo
  rendimiento?: "alto" | "medio" | "bajo"
  estado?: UserStatus
}

export interface ClienteFilters {
  search?: string
  penalizacion?: "alta" | "media" | "baja" | "ninguna"
}

export interface ProveedorFilters {
  search?: string
  tipoIngrediente?: string
}

export interface MesaFilters {
  capacidad?: number
  ocupada?: boolean
}

export interface IngredienteFilters {
  search?: string
  stockBajo?: boolean
  proveedor?: string
  unidad?: UnidadMedida
}

export interface ProductoFilters {
  search?: string
  precioMin?: number
  precioMax?: number
  calificacionMin?: number
}

// ============= RESPONSES =============
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
