import type { Pedido, CreatePedidoRequest, PedidoFilters, PaginatedResponse, PedidoEstado } from "@/types"
import { api } from "@/lib/api"

interface ApiResponse<T> {
  message: string
  data: T
}

class PedidoService { 
  async getPedidos(filters?: PedidoFilters): Promise<PaginatedResponse<Pedido>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }
      
      const endpoint = `/order/findAll${params.toString() ? `?${params.toString()}` : ''}`;
      return await api.get<PaginatedResponse<Pedido>>(endpoint);
    } catch (error) {
      console.error("Error fetching pedidos:", error)
      throw error
    }
  }

  async getPedidoById(id: string): Promise<Pedido> {
    try {
      return await api.get<Pedido>(`/order/orderId/${id}`);
    } catch (error) {
      console.error("Error fetching pedido:", error)
      throw error
    }
  }

  async createPedido(pedido: CreatePedidoRequest): Promise<Pedido> {
    try {
      const response = await api.post<ApiResponse<Pedido>>('/order/add', pedido);
      return response.data
    } catch (error) {
      console.error("Error creating pedido:", error)
      throw error
    }
  }

  async updatePedido(id: string, pedido: Partial<CreatePedidoRequest>): Promise<Pedido> {
    try {
      const response = await api.put<ApiResponse<Pedido>>(`/order/${id}`, pedido);
      return response.data
    } catch (error) {
      console.error("Error updating pedido:", error)
      throw error
    }
  }

  async deletePedido(id: string): Promise<void> {
    try {
      await api.delete<void>(`/order/${id}`);
    } catch (error) {
      console.error("Error deleting pedido:", error)
      throw error
    }
  }

  async updatePedidoEstado(id: string, estado: PedidoEstado): Promise<Pedido> {
    try {
      return await api.put<Pedido>(`/order/${id}`, { status: estado });
    } catch (error) {
      console.error("Error updating pedido estado:", error)
      throw error
    }
  }
}

export const pedidoService = new PedidoService()
