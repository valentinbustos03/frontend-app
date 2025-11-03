import type { Plato, CreatePlatoRequest, PlatoFilters } from "@/types/plato.types"
import { PaginatedResponse } from "@/types/common.types";
import { api } from "@/lib/api"

class PlatoService {
  async getPlatos(filters?: PlatoFilters): Promise<PaginatedResponse<Plato>> {
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
      return await api.get<PaginatedResponse<Plato>>(endpoint);
    } catch (error) {
      console.error("Error fetching platos:", error)
      throw error
    }
  }

  async getPlatoById(id: string): Promise<Plato> {
    try {
      return await api.get<Plato>(`/dish/id/${id}`);
    } catch (error) {
      console.error("Error fetching plato:", error)
      throw error
    }
  }

  async createPlato(plato: CreatePlatoRequest): Promise<Plato> {
    try {
      return await api.post<Plato>('/dish/add', plato);
    } catch (error) {
      console.error("Error creating plato:", error)
      throw error
    }
  }

  async updatePlato(id: string, plato: Partial<CreatePlatoRequest>): Promise<Plato> {
    try {
      return await api.put<Plato>(`/dish/${id}`, plato);
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
