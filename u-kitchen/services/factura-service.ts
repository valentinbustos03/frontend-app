import type { Factura, CreateFacturaRequest } from "@/types/factura.types"
import { api, type ApiResponse } from "@/lib/api"

class FacturaService {
  async createFactura(orderId: string, data: CreateFacturaRequest): Promise<Factura> {
    try {
      const response = await api.post<ApiResponse<Factura>>(`/order/${orderId}/bill/add`, data)
      return response.data
    } catch (error) {
      console.error("Error creating factura:", error)
      throw error
    }
  }
}

export const facturaService = new FacturaService()
