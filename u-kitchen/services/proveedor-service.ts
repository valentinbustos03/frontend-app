import type { Proveedor, CreateProveedorRequest, ProveedorFilters, PaginatedResponse } from "@/types"
import { dummyProveedores } from "@/data/dummy-data"

class ProveedorService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getProveedores(filters?: ProveedorFilters): Promise<PaginatedResponse<Proveedor>> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        let filteredProveedores = [...dummyProveedores]

        if (filters?.search) {
          const search = filters.search.toLowerCase()
          filteredProveedores = filteredProveedores.filter(
            (proveedor) =>
              proveedor.razonSocial.toLowerCase().includes(search) ||
              proveedor.nombre.toLowerCase().includes(search) ||
              proveedor.compania.toLowerCase().includes(search),
          )
        }

        if (filters?.tipoIngrediente) {
          filteredProveedores = filteredProveedores.filter(
            (proveedor) => proveedor.tipoIngrediente === filters.tipoIngrediente,
          )
        }

        return {
          data: filteredProveedores,
          total: filteredProveedores.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(filteredProveedores.length / 10),
        }
      }

      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    } catch (error) {
      console.error("Error fetching proveedores:", error)
      throw error
    }
  }

  async createProveedor(proveedor: CreateProveedorRequest): Promise<Proveedor> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const newProveedor: Proveedor = {
          id: Date.now().toString(),
          ...proveedor,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dummyProveedores.push(newProveedor)
        return newProveedor
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error creating proveedor:", error)
      throw error
    }
  }

  async updateProveedor(id: string, proveedor: Partial<CreateProveedorRequest>): Promise<Proveedor> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyProveedores.findIndex((p) => p.id === id)
        if (index === -1) throw new Error("Proveedor not found")

        const updatedProveedor = {
          ...dummyProveedores[index],
          ...proveedor,
          updatedAt: new Date(),
        }

        dummyProveedores[index] = updatedProveedor
        return updatedProveedor
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error updating proveedor:", error)
      throw error
    }
  }

  async deleteProveedor(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyProveedores.findIndex((p) => p.id === id)
        if (index === -1) throw new Error("Proveedor not found")
        dummyProveedores.splice(index, 1)
        return
      }
    } catch (error) {
      console.error("Error deleting proveedor:", error)
      throw error
    }
  }
}

export const proveedorService = new ProveedorService()
