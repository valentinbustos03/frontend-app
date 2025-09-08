import {
  type Usuario,
  type Cliente,
  type Empleado,
  type Proveedor,
  type Mesa,
  type Ingrediente,
  type Producto,
  type Pedido,
  type Reserva,
  type Factura,
  UserRole,
  UserStatus,
  Turno,
  EmpleadoTipo,
  ChefJerarquia,
  UnidadMedida,
  PedidoEstado,
  ReservaEstado,
  MetodoPago,
} from "@/types"

// ============= USUARIOS DUMMY =============
export const dummyUsuarios: Usuario[] = [
  {
    id: "1",
    mail: "admin@restaurant.com",
    contraseña: "admin123",
    tel: "+1234567890",
    nombreApellido: "Juan Administrador",
    rol: UserRole.ADMIN,
    estado: UserStatus.ACTIVO,
    fotoPerfil: "/placeholder.svg?height=40&width=40",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    mail: "maria.cliente@email.com",
    contraseña: "cliente123",
    tel: "+1234567891",
    nombreApellido: "María García",
    rol: UserRole.CLIENTE,
    estado: UserStatus.ACTIVO,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-02-01"),
  },
  {
    id: "3",
    mail: "carlos.mesero@restaurant.com",
    contraseña: "mesero123",
    tel: "+1234567892",
    nombreApellido: "Carlos Rodríguez",
    rol: UserRole.MESERO,
    estado: UserStatus.ACTIVO,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "4",
    mail: "ana.chef@restaurant.com",
    contraseña: "chef123",
    tel: "+1234567893",
    nombreApellido: "Ana Martínez",
    rol: UserRole.CHEF,
    estado: UserStatus.ACTIVO,
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-01-10"),
  },
]

// ============= CLIENTES DUMMY =============
export const dummyClientes: Cliente[] = [
  {
    id: "1",
    usuario: dummyUsuarios[1],
    historialPedidos: [],
    penalizacion: 0,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-02-01"),
  },
  {
    id: "2",
    usuario: {
      id: "5",
      mail: "pedro.cliente@email.com",
      contraseña: "cliente123",
      tel: "+1234567894",
      nombreApellido: "Pedro López",
      rol: UserRole.CLIENTE,
      estado: UserStatus.ACTIVO,
      createdAt: new Date("2023-03-01"),
      updatedAt: new Date("2023-03-01"),
    },
    historialPedidos: [],
    penalizacion: 1,
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2023-03-01"),
  },
]

// ============= EMPLEADOS DUMMY =============
export const dummyEmpleados: Empleado[] = [
  {
    id: "1",
    nombre: "Carlos",
    apellido: "Rodríguez",
    cuitCuil: "20-12345678-9",
    turno: Turno.NOCHE,
    horasTrabajadas: 160,
    precioPorHora: 15,
    sueldo: 2400,
    tipo: EmpleadoTipo.MESERO,
    calificacion: 4.5,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    nombre: "Ana",
    apellido: "Martínez",
    cuitCuil: "27-87654321-0",
    turno: Turno.COMPLETO,
    horasTrabajadas: 180,
    precioPorHora: 25,
    sueldo: 4500,
    tipo: EmpleadoTipo.CHEF,
    jerarquia: ChefJerarquia.CHEF_EJECUTIVO,
    listaProductosEncargado: ["1", "2", "3"],
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-01-10"),
  },
]

// ============= PROVEEDORES DUMMY =============
export const dummyProveedores: Proveedor[] = [
  {
    id: "1",
    razonSocial: "Carnes Premium S.A.",
    cuitCuil: "30-12345678-9",
    mail: "ventas@carnespremium.com",
    telefono: "+1234567895",
    tipoIngrediente: "Carnes",
    nombre: "Distribuidora de Carnes",
    compania: "Carnes Premium",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    razonSocial: "Verduras Frescas Ltda.",
    cuitCuil: "30-87654321-0",
    mail: "pedidos@verdurasfrescas.com",
    telefono: "+1234567896",
    tipoIngrediente: "Verduras",
    nombre: "Distribuidora de Verduras",
    compania: "Verduras Frescas",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
]

// ============= MESAS DUMMY =============
export const dummyMesas: Mesa[] = [
  {
    id: "1",
    cod: "M001",
    capacidad: 4,
    ocupada: false,
    descripcion: "Mesa junto a la ventana",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    cod: "M002",
    capacidad: 2,
    ocupada: true,
    descripcion: "Mesa para parejas",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "3",
    cod: "M003",
    capacidad: 6,
    ocupada: false,
    descripcion: "Mesa familiar",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
]

// ============= INGREDIENTES DUMMY =============
export const dummyIngredientes: Ingrediente[] = [
  {
    id: "1",
    codigo: "ING001",
    nombre: "Carne de Res",
    descripcion: "Carne de res premium para hamburguesas",
    stock: 50,
    proveedores: [dummyProveedores[0]],
    unidad: UnidadMedida.KILOGRAMOS,
    origen: "Argentina",
    limiteBajoStock: 10,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    codigo: "ING002",
    nombre: "Lechuga",
    descripcion: "Lechuga fresca para ensaladas",
    stock: 25,
    proveedores: [dummyProveedores[1]],
    unidad: UnidadMedida.UNIDADES,
    origen: "Local",
    limiteBajoStock: 5,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
]

// ============= PRODUCTOS DUMMY =============
export const dummyProductos: Producto[] = [
  {
    id: "1",
    codigo: "PROD001",
    nombre: "Hamburguesa Clásica",
    descripcion: "Hamburguesa con carne de res, lechuga, tomate y queso",
    imagen: "/placeholder.svg?height=200&width=200",
    calificacion: 4.5,
    precio: 12.99,
    ingredientes: [dummyIngredientes[0], dummyIngredientes[1]],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    codigo: "PROD002",
    nombre: "Ensalada César",
    descripcion: "Ensalada fresca con pollo, crutones y aderezo césar",
    imagen: "/placeholder.svg?height=200&width=200",
    calificacion: 4.2,
    precio: 9.99,
    ingredientes: [dummyIngredientes[1]],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
]

// ============= RESERVAS DUMMY =============
export const dummyReservas: Reserva[] = [
  {
    id: "1",
    cliente: dummyClientes[0],
    mesa: dummyMesas[0],
    fechaHoraInicio: new Date("2024-01-15T19:00:00"),
    duracion: 120,
    fechaHoraFin: new Date("2024-01-15T21:00:00"),
    cantidadPersonas: 4,
    notas: "Celebración de aniversario",
    estado: ReservaEstado.CONFIRMADA,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
]

// ============= PEDIDOS DUMMY =============
export const dummyPedidos: Pedido[] = [
  {
    id: "1",
    cliente: dummyClientes[0],
    mesa: dummyMesas[0],
    mesero: dummyEmpleados[0],
    descripcion: "Pedido para mesa 1",
    estado: PedidoEstado.EN_PREPARACION,
    fechaHoraInicio: new Date("2024-01-15T19:30:00"),
    fechaHoraFinEstimada: new Date("2024-01-15T20:00:00"),
    subtotal: 22.98,
    total: 25.28, // subtotal + 10% servicio
    productos: [
      {
        producto: dummyProductos[0],
        cantidad: 1,
        precioUnitario: 12.99,
        subtotal: 12.99,
      },
      {
        producto: dummyProductos[1],
        cantidad: 1,
        precioUnitario: 9.99,
        subtotal: 9.99,
      },
    ],
    reserva: dummyReservas[0],
    createdAt: new Date("2024-01-15T19:30:00"),
    updatedAt: new Date("2024-01-15T19:30:00"),
  },
]

// ============= FACTURAS DUMMY =============
export const dummyFacturas: Factura[] = [
  {
    id: "1",
    pedido: dummyPedidos[0],
    metodoPago: MetodoPago.TARJETA_CREDITO,
    fechaHoraEmision: new Date("2024-01-15T20:30:00"),
    total: 25.28,
    createdAt: new Date("2024-01-15T20:30:00"),
    updatedAt: new Date("2024-01-15T20:30:00"),
  },
]
