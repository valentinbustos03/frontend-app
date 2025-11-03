import type { Empleado, CreateEmpleadoRequest, EmpleadoFilters} from "@/types/empleado.types"
import { PaginatedResponse } from "@/types/common.types"
import { api } from "@/lib/api"

interface ApiResponse<T> {
  message: string
  data: T
}

class EmpleadoService {
  async getEmpleados(filters?: EmpleadoFilters): Promise<PaginatedResponse<Empleado>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }
      
      const endpoint = `/employee/findAll${params.toString() ? `?${params.toString()}` : ''}`;
      return await api.get<PaginatedResponse<Empleado>>(endpoint);
    } catch (error) {
      console.error("Error fetching empleados:", error)
      throw error
    }
  }

  async getEmpleadoById(id: string): Promise<Empleado> {
    try {
      return await api.get<Empleado>(`/employee/id/${id}`);
    } catch (error) {
      console.error("Error fetching empleado:", error)
      throw error
    }
  }

  async createEmpleado(empleado: CreateEmpleadoRequest): Promise<Empleado> {
    try {
      const response = await api.post<ApiResponse<Empleado>>('/employee/add', empleado);
      return response.data;
    } catch (error) {
      console.error("Error creating empleado:", error)
      throw error
    }
  }

  async updateEmpleado(id: string, empleado: Partial<CreateEmpleadoRequest>): Promise<Empleado> {
    try {
      const response = await api.put<ApiResponse<Empleado>>(`/employee/${id}`, empleado);
      return response.data;
    } catch (error) {
      console.error("Error updating empleado:", error)
      throw error
    }
  }

  async deleteEmpleado(id: string): Promise<void> {
    try {
      await api.delete<void>(`/employee/${id}`);
    } catch (error) {
      console.error("Error deleting empleado:", error)
      throw error
    }
  }
}

export const empleadoService = new EmpleadoService()