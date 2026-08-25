import type {
  Pedido,
  CreatePedidoRequest,
  UpdatePedidoRequest,
  PedidoFilters,
  PedidoEstado,
} from "@/types/pedido.types"
import { api, type ApiResponse } from "@/lib/api"

class PedidoService { 
  async getPedidos(filters?: PedidoFilters): Promise<Pedido[]> {
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
      const response = await api.get<ApiResponse<Pedido[]>>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching pedidos:", error)
      throw error
    }
  }

  async getPedidoById(id: string): Promise<Pedido> {
    try {
      const response = await api.get<ApiResponse<Pedido>>(`/order/orderId/${id}`);
      return response.data;
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

  async updatePedido(id: string, pedido: UpdatePedidoRequest): Promise<Pedido> {
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

  async findAllByClientId(clientId: string): Promise<Pedido[]> {
    try {
      const response = await api.get<ApiResponse<Pedido[]>>(`/order/findAllClientOrders/${clientId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching client orders:", error)
      throw error
    }
  }

  async updatePedidoEstado(pedido: Pedido, estado: PedidoEstado): Promise<Pedido> {
    return this.updatePedido(pedido.orderId, { status: estado })
  }
}

export const pedidoService = new PedidoService()
