import type { Ingrediente, CreateIngredienteRequest, IngredienteFilters, PaginatedResponse } from "@/types"
import { api } from "@/lib/api"

class IngredienteService {
  async getIngredientes(filters?: IngredienteFilters): Promise<PaginatedResponse<Ingrediente>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }
      
      const endpoint = `/ingredient/findAll${params.toString() ? `?${params.toString()}` : ''}`;
      return await api.get<PaginatedResponse<Ingrediente>>(endpoint);
    } catch (error) {
      console.error("Error fetching ingredientes:", error)
      throw error
    }
  }

  async getIngredienteById(id: string): Promise<Ingrediente> {
    try {
      return await api.get<Ingrediente>(`/ingredient/id/${id}`);
    } catch (error) {
      console.error("Error fetching ingrediente:", error)
      throw error
    }
  }

  async createIngrediente(ingrediente: CreateIngredienteRequest): Promise<Ingrediente> {
    try {
      return await api.post<Ingrediente>('/ingredient/add', ingrediente);
    } catch (error) {
      console.error("Error creating ingrediente:", error)
      throw error
    }
  }

  async updateIngrediente(id: string, ingrediente: Partial<CreateIngredienteRequest>): Promise<Ingrediente> {
    try {
      return await api.put<Ingrediente>(`/ingredient/${id}`, ingrediente);
    } catch (error) {
      console.error("Error updating ingrediente:", error)
      throw error
    }
  }

  async deleteIngrediente(id: string): Promise<void> {
    try {
      await api.delete<void>(`/ingredient/${id}`);
    } catch (error) {
      console.error("Error deleting ingrediente:", error)
      throw error
    }
  }

  async updateStock(id: string, nuevoStock: number): Promise<Ingrediente> {
    try {
      return await api.put<Ingrediente>(`/ingredient/${id}/stock`, { stock: nuevoStock });
    } catch (error) {
      console.error("Error updating stock:", error)
      throw error
    }
  }
}

export const ingredienteService = new IngredienteService()
