import { Usuario } from './usuario.types';
import { Plato } from './plato.types';

export enum EmployeeRole {
  CHEF = "chef",
  WAITER = "waiter",
}

export enum EmployeeShift {
  MAÑANA = "mañana",
  TARDE = "tarde",
  NOCHE = "noche"
}

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

// Filtros que acepta GET /employee/findAll.
// minCalification es un campo de Waiter, así que filtrar por él excluye a los chefs.
export interface EmpleadoFilters {
  shift?: EmployeeShift
  role?: EmployeeRole
  minCalification?: number
}