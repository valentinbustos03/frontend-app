import type { Ingrediente, CreateIngredienteRequest } from "@/types/ingrediente.types"
import { PaginatedResponse } from "@/types/common.types";
import { api } from "@/lib/api"

interface UpdateIngredienteResponse {
  message: string;
  data: Ingrediente;
}

class IngredienteService {
  async getIngredientes(): Promise<PaginatedResponse<Ingrediente>> {
    try {
      return await api.get<PaginatedResponse<Ingrediente>>(`/ingredient/findAll?includeDetails=true`);
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
      const response = await api.post<{message: string, data: Ingrediente}>('/ingredient/add', ingrediente);
      return response.data;
    } catch (error) {
      console.error("Error creating ingrediente:", error)
      throw error
    }
  }

  async updateIngrediente(id: string, ingrediente: Partial<CreateIngredienteRequest>): Promise<Ingrediente> {
    try {
      const response = await api.put<UpdateIngredienteResponse>(`/ingredient/${id}`, ingrediente);
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