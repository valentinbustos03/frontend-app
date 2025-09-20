import type { Cliente, CreateClienteRequest, ClienteFilters, PaginatedResponse } from "@/types"
import { api } from "@/lib/api"

class ClienteService {
  async getClientes(filters?: ClienteFilters): Promise<PaginatedResponse<Cliente>> {
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
      return await api.get<PaginatedResponse<Cliente>>(endpoint);
    } catch (error) {
      console.error("Error fetching clientes:", error)
      throw error
    }
  }

  async getClienteById(id: string): Promise<Cliente> {
    try {
      return await api.get<Cliente>(`/client/id/${id}`);
    } catch (error) {
      console.error("Error fetching cliente:", error)
      throw error
    }
  }

  async createCliente(cliente: CreateClienteRequest): Promise<Cliente> {
    try {
      return await api.post<Cliente>('/client/add', cliente);
    } catch (error) {
      console.error("Error creating cliente:", error)
      throw error
    }
  }

  async updateCliente(id: string, cliente: Partial<CreateClienteRequest>): Promise<Cliente> {
    try {
      return await api.put<Cliente>(`/client/${id}`, cliente);
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