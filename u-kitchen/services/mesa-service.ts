import type { Mesa, CreateMesaRequest, MesaFilters } from "@/types/mesa.types"
import { api, type ApiResponse } from "@/lib/api"

class MesaService {
  async getMesas(filters?: MesaFilters): Promise<Mesa[]> {
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
      const response = await api.get<ApiResponse<Mesa[]>>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching mesas:", error)
      throw error
    }
  }

  async getMesaById(id: string): Promise<Mesa> {
    try {
      const response = await api.get<ApiResponse<Mesa>>(`/table/id/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching mesa:", error)
      throw error
    }
  }

  async findByCod(cod: string): Promise<Mesa> {
    try {
      const response = await api.get<ApiResponse<Mesa>>(`/table/cod/${cod}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching mesa by cod:", error)
      throw error
    }
  }

  async createMesa(mesa: CreateMesaRequest): Promise<Mesa> {
    try {
      const payload = { ...mesa };
      const response = await api.post<ApiResponse<Mesa>>('/table/add', payload);
      return response.data;
    } catch (error) {
      console.error("Error creating mesa:", error)
      throw error
    }
  }

  async updateMesa(id: string, mesa: Partial<CreateMesaRequest>): Promise<Mesa> {
    try {
      const payload = { ...mesa };
      const response = await api.put<ApiResponse<Mesa>>(`/table/${id}`, payload);
      return response.data;
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

  async toggleOcupada(mesa: Mesa): Promise<Mesa> {
    try {
      const payload = { 
        ...mesa, 
        occupied: !mesa.occupied,
      };
      const response = await api.put<ApiResponse<Mesa>>(`/table/${mesa.id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error toggling mesa ocupada:", error)
      throw error
    }
  }
}

export const mesaService = new MesaService()