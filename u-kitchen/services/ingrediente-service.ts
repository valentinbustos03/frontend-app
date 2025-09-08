import type { Ingrediente, CreateIngredienteRequest, IngredienteFilters, PaginatedResponse } from "@/types"
import { dummyIngredientes, dummyProveedores } from "@/data/dummy-data"

class IngredienteService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getIngredientes(filters?: IngredienteFilters): Promise<PaginatedResponse<Ingrediente>> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        let filteredIngredientes = [...dummyIngredientes]

        if (filters?.search) {
          const search = filters.search.toLowerCase()
          filteredIngredientes = filteredIngredientes.filter(
            (ingrediente) =>
              ingrediente.nombre.toLowerCase().includes(search) ||
              ingrediente.descripcion.toLowerCase().includes(search) ||
              ingrediente.cod.toLowerCase().includes(search),
          )
        }

        if (filters?.stockBajo) {
          filteredIngredientes = filteredIngredientes.filter(
            (ingrediente) => ingrediente.stock <= ingrediente.limiteBajoStock,
          )
        }

        if (filters?.unidadMedida) {
          filteredIngredientes = filteredIngredientes.filter(
            (ingrediente) => ingrediente.unidadMedida === filters.unidadMedida,
          )
        }

        if (filters?.proveedor) {
          filteredIngredientes = filteredIngredientes.filter((ingrediente) =>
            ingrediente.listaProveedor.some((p) => p.id === filters.proveedor),
          )
        }

        return {
          data: filteredIngredientes,
          total: filteredIngredientes.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(filteredIngredientes.length / 10),
        }
      }

      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    } catch (error) {
      console.error("Error fetching ingredientes:", error)
      throw error
    }
  }

  async createIngrediente(ingrediente: CreateIngredienteRequest): Promise<Ingrediente> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const proveedores = dummyProveedores.filter((p) => ingrediente.proveedorIds.includes(p.id))

        const newIngrediente: Ingrediente = {
          id: Date.now().toString(),
          cod: ingrediente.cod,
          nombre: ingrediente.nombre,
          descripcion: ingrediente.descripcion,
          stock: ingrediente.stock,
          listaProveedor: proveedores,
          unidadMedida: ingrediente.unidadMedida,
          origen: ingrediente.origen,
          limiteBajoStock: ingrediente.limiteBajoStock,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dummyIngredientes.push(newIngrediente)
        return newIngrediente
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error creating ingrediente:", error)
      throw error
    }
  }

  async updateIngrediente(id: string, ingrediente: Partial<CreateIngredienteRequest>): Promise<Ingrediente> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyIngredientes.findIndex((i) => i.id === id)
        if (index === -1) throw new Error("Ingrediente not found")

        const proveedores = ingrediente.proveedorIds
          ? dummyProveedores.filter((p) => ingrediente.proveedorIds!.includes(p.id))
          : dummyIngredientes[index].listaProveedor

        const updatedIngrediente = {
          ...dummyIngredientes[index],
          ...ingrediente,
          listaProveedor: proveedores,
          updatedAt: new Date(),
        }

        dummyIngredientes[index] = updatedIngrediente
        return updatedIngrediente
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error updating ingrediente:", error)
      throw error
    }
  }

  async deleteIngrediente(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyIngredientes.findIndex((i) => i.id === id)
        if (index === -1) throw new Error("Ingrediente not found")
        dummyIngredientes.splice(index, 1)
        return
      }
    } catch (error) {
      console.error("Error deleting ingrediente:", error)
      throw error
    }
  }

  async updateStock(id: string, nuevoStock: number): Promise<Ingrediente> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const index = dummyIngredientes.findIndex((i) => i.id === id)
        if (index === -1) throw new Error("Ingrediente not found")

        dummyIngredientes[index] = {
          ...dummyIngredientes[index],
          stock: nuevoStock,
          updatedAt: new Date(),
        }

        return dummyIngredientes[index]
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error updating stock:", error)
      throw error
    }
  }
}

export const ingredienteService = new IngredienteService()
