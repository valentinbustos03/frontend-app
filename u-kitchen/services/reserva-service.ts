import type { Reserva, CreateReservaRequest } from "@/types/reserva.types"
import { api, type ApiResponse } from "@/lib/api"

class ReservaService {
  async getReservas(): Promise<Reserva[]> {
    try {
      const response = await api.get<ApiResponse<Reserva[]>>('/reservation/findAll');
      return response.data;
    } catch (error) {
      console.error("Error fetching reservas:", error)
      throw error
    }
  }

  async getReservaById(id: string): Promise<Reserva> {
    try {
      const response = await api.get<ApiResponse<Reserva>>(`/reservation/id/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching reserva:", error)
      throw error
    }
  }

  async createReserva(reserva: CreateReservaRequest): Promise<Reserva> {
    try {
      const response = await api.post<ApiResponse<Reserva>>('/reservation/add', reserva);
      return response.data;
    } catch (error) {
      console.error("Error creating reserva:", error)
      throw error
    }
  }

  // El PUT exige el objeto completo, no acepta parciales.
  async updateReserva(id: string, reserva: CreateReservaRequest): Promise<Reserva> {
    try {
      const response = await api.put<ApiResponse<Reserva>>(`/reservation/${id}`, reserva);
      return response.data;
    } catch (error) {
      console.error("Error updating reserva:", error)
      throw error
    }
  }

  async deleteReserva(id: string): Promise<void> {
    try {
      await api.delete<void>(`/reservation/${id}`);
    } catch (error) {
      console.error("Error deleting reserva:", error)
      throw error
    }
  }
}

export const reservaService = new ReservaService()
