import type { Plato, CreatePlatoRequest, PlatoFilters } from "@/types/plato.types"
import { api, type ApiResponse } from "@/lib/api"

class PlatoService {
  async getPlatos(filters?: PlatoFilters): Promise<Plato[]> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }
      
      const endpoint = `/dish/findAll${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<Plato[]>>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching platos:", error)
      throw error
    }
  }

  async getPlatoById(id: string): Promise<Plato> {
    try {
      const response = await api.get<ApiResponse<Plato>>(`/dish/id/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching plato:", error)
      throw error
    }
  }

  async createPlato(plato: CreatePlatoRequest): Promise<Plato> {
    try {
      const response = await api.post<ApiResponse<Plato>>('/dish/add', plato);
      return response.data;
    } catch (error) {
      console.error("Error creating plato:", error)
      throw error
    }
  }

  async updatePlato(id: string, plato: Partial<CreatePlatoRequest>): Promise<Plato> {
    try {
      const response = await api.put<ApiResponse<Plato>>(`/dish/${id}`, plato);
      return response.data;
    } catch (error) {
      console.error("Error updating plato:", error)
      throw error
    }
  }

  async deletePlato(id: string): Promise<void> {
    try {
      await api.delete<void>(`/dish/${id}`);
    } catch (error) {
      console.error("Error deleting plato:", error)
      throw error
    }
  }
}

export const platoService = new PlatoService()
