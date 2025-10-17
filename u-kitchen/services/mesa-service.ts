import type { Mesa, CreateMesaRequest, MesaFilters, PaginatedResponse } from "@/types"
import { api } from "@/lib/api"

interface UpdateMesaResponse {
  message: string;
  data: Mesa;
}

class MesaService {
  async getMesas(filters?: MesaFilters): Promise<PaginatedResponse<Mesa>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }
      
      const endpoint = `/table/findAll${params.toString() ? `?${params.toString()}` : ''}`;
      return await api.get<PaginatedResponse<Mesa>>(endpoint);
    } catch (error) {
      console.error("Error fetching mesas:", error)
      throw error
    }
  }

  async getMesaById(id: string): Promise<Mesa> {
    try {
      return await api.get<Mesa>(`/table/id/${id}`);
    } catch (error) {
      console.error("Error fetching mesa:", error)
      throw error
    }
  }

  async createMesa(mesa: CreateMesaRequest): Promise<Mesa> {
    try {
      const payload = { ...mesa };
      return await api.post<Mesa>('/table/add', payload);
    } catch (error) {
      console.error("Error creating mesa:", error)
      throw error
    }
  }

  async updateMesa(id: string, mesa: Partial<CreateMesaRequest>): Promise<UpdateMesaResponse> {
    try {
      const payload = { ...mesa };
      return await api.put<UpdateMesaResponse>(`/table/${id}`, payload);
    } catch (error) {
      console.error("Error updating mesa:", error)
      throw error
    }
  }

  async deleteMesa(id: string): Promise<void> {
    try {
      await api.delete<void>(`/table/${id}`);
    } catch (error) {
      console.error("Error deleting mesa:", error)
      throw error
    }
  }

  async toggleOcupada(mesa: Mesa): Promise<UpdateMesaResponse> {
    try {
      const payload = { 
        ...mesa, 
        occupied: !mesa.occupied,
      };
      return await api.put<UpdateMesaResponse>(`/table/${mesa.id}`, payload);
    } catch (error) {
      console.error("Error toggling mesa ocupada:", error)
      throw error
    }
  }
}

export const mesaService = new MesaService()