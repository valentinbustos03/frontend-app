import { Cliente } from './cliente.types';
import { Empleado } from './empleado.types';

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

// Rol resuelto por el backend (role + relacion client/employee) y firmado en el JWT.
export type AccessRole = "admin" | "cliente" | "empleado"

export interface Usuario {
  id: string
  email: string
  fullName: string
  phoneNumber: string
  role: UserRole
  profilePicture?: string
  client?: Cliente
  employee?: Empleado
}

// Lo que devuelven /auth/login y /auth/me: el usuario mas su rol normalizado.
export interface Sesion extends Usuario {
  accessRole: AccessRole
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