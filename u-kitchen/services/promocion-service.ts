import type { Promocion, CreatePromocionRequest, PromocionFilters } from "@/types/promocion.types"
import { api, type ApiResponse } from "@/lib/api"

class PromocionService {
  async getPromociones(filters?: PromocionFilters): Promise<Promocion[]> {
    try {
      const endpoint = filters?.current
        ? '/promotion/findAll?current=true'
        : '/promotion/findAll';
      const response = await api.get<ApiResponse<Promocion[]>>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching promociones:", error)
      throw error
    }
  }

  async getPromocionById(id: string): Promise<Promocion> {
    try {
      const response = await api.get<ApiResponse<Promocion>>(`/promotion/id/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching promocion:", error)
      throw error
    }
  }

  async createPromocion(promocion: CreatePromocionRequest): Promise<Promocion> {
    try {
      const response = await api.post<ApiResponse<Promocion>>('/promotion/add', promocion);
      return response.data;
    } catch (error) {
      console.error("Error creating promocion:", error)
      throw error
    }
  }

  // El PUT exige el objeto completo, no acepta parciales.
  async updatePromocion(id: string, promocion: CreatePromocionRequest): Promise<Promocion> {
    try {
      const response = await api.put<ApiResponse<Promocion>>(`/promotion/${id}`, promocion);
      return response.data;
    } catch (error) {
      console.error("Error updating promocion:", error)
      throw error
    }
  }

  async deletePromocion(id: string): Promise<void> {
    try {
      await api.delete<void>(`/promotion/${id}`);
    } catch (error) {
      console.error("Error deleting promocion:", error)
      throw error
    }
  }
}

export const promocionService = new PromocionService()
