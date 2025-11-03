import { Cliente } from './cliente.types';
import { Empleado } from './empleado.types';

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

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