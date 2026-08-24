import type { Ingrediente, CreateIngredienteRequest } from "@/types/ingrediente.types"
import { api, type ApiResponse } from "@/lib/api"

class IngredienteService {
  async getIngredientes(): Promise<Ingrediente[]> {
    try {
      const response = await api.get<ApiResponse<Ingrediente[]>>(`/ingredient/findAll?includeDetails=true`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ingredientes:", error)
      throw error
    }
  }

  async getIngredienteById(id: string): Promise<Ingrediente> {
    try {
      const response = await api.get<ApiResponse<Ingrediente>>(`/ingredient/id/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ingrediente:", error)
      throw error
    }
  }

  async createIngrediente(ingrediente: CreateIngredienteRequest): Promise<Ingrediente> {
    try {
      const response = await api.post<ApiResponse<Ingrediente>>('/ingredient/add', ingrediente);
      return response.data;
    } catch (error) {
      console.error("Error creating ingrediente:", error)
      throw error
    }
  }

  async updateIngrediente(id: string, ingrediente: Partial<CreateIngredienteRequest>): Promise<Ingrediente> {
    try {
      const response = await api.put<ApiResponse<Ingrediente>>(`/ingredient/${id}`, ingrediente);
      return response.data;
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
}

export const ingredienteService = new IngredienteService()