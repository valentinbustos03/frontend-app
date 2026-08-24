import type { Empleado, CreateEmpleadoRequest, EmpleadoFilters} from "@/types/empleado.types"
import { api, type ApiResponse } from "@/lib/api"

class EmpleadoService {
  async getEmpleados(filters?: EmpleadoFilters): Promise<Empleado[]> {
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
      const response = await api.get<ApiResponse<Empleado[]>>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching empleados:", error)
      throw error
    }
  }

  async getEmpleadoById(id: string): Promise<Empleado> {
    try {
      const response = await api.get<ApiResponse<Empleado>>(`/employee/id/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching empleado:", error)
      throw error
    }
  }

  async findByTaxId(taxId: string): Promise<Empleado> {
    try {
      const response = await api.get<ApiResponse<Empleado>>(`/employee/taxId/${taxId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching empleado by taxId:", error)
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