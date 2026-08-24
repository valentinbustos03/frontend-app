import type { Cliente, CreateClienteRequest, ClienteFilters} from "@/types/cliente.types"
import { api, type ApiResponse } from "@/lib/api"

class ClienteService {
  async getClientes(filters?: ClienteFilters): Promise<Cliente[]> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }
      
      const endpoint = `/client/findAll${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<Cliente[]>>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching clientes:", error)
      throw error
    }
  }

  async getClienteById(id: string): Promise<Cliente> {
    try {
      const response = await api.get<ApiResponse<Cliente>>(`/client/id/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cliente:", error)
      throw error
    }
  }

  async findByDni(dni: number | string): Promise<Cliente> {
    try {
      const response = await api.get<ApiResponse<Cliente>>(`/client/dni/${dni}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cliente by DNI:", error)
      throw error
    }
  }

  async createCliente(cliente: CreateClienteRequest): Promise<Cliente> {
    try {
      const response = await api.post<ApiResponse<Cliente>>('/client/add', cliente);
      return response.data;
    } catch (error) {
      console.error("Error creating cliente:", error)
      throw error
    }
  }

  async updateCliente(id: string, cliente: Partial<CreateClienteRequest>): Promise<Cliente> {
    try {
      const response = await api.put<ApiResponse<Cliente>>(`/client/${id}`, cliente);
      return response.data;
    } catch (error) {
      console.error("Error updating cliente:", error)
      throw error
    }
  }

  async deleteCliente(id: string): Promise<void> {
    try {
      await api.delete<void>(`/client/${id}`);
    } catch (error) {
      console.error("Error deleting cliente:", error)
      throw error
    }
  }
}

export const clienteService = new ClienteService()