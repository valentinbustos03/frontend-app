import type { Mesa, CreateMesaRequest, MesaFilters, PaginatedResponse } from "@/types"
import { dummyMesas } from "@/data/dummy-data"

class MesaService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getMesas(filters?: MesaFilters): Promise<PaginatedResponse<Mesa>> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        let filteredMesas = [...dummyMesas]

        if (filters?.capacidad) {
          filteredMesas = filteredMesas.filter((mesa) => mesa.capacidad === filters.capacidad)
        }

        if (filters?.ocupada !== undefined) {
          filteredMesas = filteredMesas.filter((mesa) => mesa.ocupada === filters.ocupada)
        }

        return {
          data: filteredMesas,
          total: filteredMesas.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(filteredMesas.length / 10),
        }
      }

      // const response = await fetch(`${this.baseUrl}/mesas`)
      // return response.json()

      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    } catch (error) {
      console.error("Error fetching mesas:", error)
      throw error
    }
  }

  async createMesa(mesa: CreateMesaRequest): Promise<Mesa> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const newMesa: Mesa = {
          id: Date.now().toString(),
          cod: mesa.cod,
          capacidad: mesa.capacidad,
          ocupada: false,
          descripcion: mesa.descripcion,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dummyMesas.push(newMesa)
        return newMesa
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error creating mesa:", error)
      throw error
    }
  }

  async updateMesa(id: string, mesa: Partial<CreateMesaRequest>): Promise<Mesa> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyMesas.findIndex((m) => m.id === id)
        if (index === -1) throw new Error("Mesa not found")

        const updatedMesa = {
          ...dummyMesas[index],
          ...mesa,
          updatedAt: new Date(),
        }

        dummyMesas[index] = updatedMesa
        return updatedMesa
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error updating mesa:", error)
      throw error
    }
  }

  async deleteMesa(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyMesas.findIndex((m) => m.id === id)
        if (index === -1) throw new Error("Mesa not found")
        dummyMesas.splice(index, 1)
        return
      }
    } catch (error) {
      console.error("Error deleting mesa:", error)
      throw error
    }
  }

  async toggleOcupada(id: string): Promise<Mesa> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const index = dummyMesas.findIndex((m) => m.id === id)
        if (index === -1) throw new Error("Mesa not found")

        dummyMesas[index] = {
          ...dummyMesas[index],
          ocupada: !dummyMesas[index].ocupada,
          updatedAt: new Date(),
        }

        return dummyMesas[index]
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error toggling mesa ocupada:", error)
      throw error
    }
  }
}

export const mesaService = new MesaService()
