import type { Producto, CreateProductoRequest, ProductoFilters, PaginatedResponse } from "@/types"
import { dummyProductos, dummyIngredientes } from "@/data/dummy-data"

class ProductoService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getProductos(filters?: ProductoFilters): Promise<PaginatedResponse<Producto>> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        let filteredProductos = [...dummyProductos]

        if (filters?.search) {
          const search = filters.search.toLowerCase()
          filteredProductos = filteredProductos.filter(
            (producto) =>
              producto.nombre.toLowerCase().includes(search) ||
              producto.descripcion.toLowerCase().includes(search) ||
              producto.cod.toLowerCase().includes(search),
          )
        }

        if (filters?.precioMin !== undefined) {
          filteredProductos = filteredProductos.filter((producto) => producto.precio >= filters.precioMin!)
        }

        if (filters?.precioMax !== undefined) {
          filteredProductos = filteredProductos.filter((producto) => producto.precio <= filters.precioMax!)
        }

        if (filters?.calificacionMin !== undefined) {
          filteredProductos = filteredProductos.filter((producto) => producto.calificacion >= filters.calificacionMin!)
        }

        return {
          data: filteredProductos,
          total: filteredProductos.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(filteredProductos.length / 10),
        }
      }

      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    } catch (error) {
      console.error("Error fetching productos:", error)
      throw error
    }
  }

  async createProducto(producto: CreateProductoRequest): Promise<Producto> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const ingredientes = dummyIngredientes.filter((i) => producto.ingredienteIds.includes(i.id))

        const newProducto: Producto = {
          id: Date.now().toString(),
          cod: producto.cod,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          imagen: producto.imagen,
          calificacion: 0,
          precio: producto.precio,
          ingredientes,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dummyProductos.push(newProducto)
        return newProducto
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error creating producto:", error)
      throw error
    }
  }

  async updateProducto(id: string, producto: Partial<CreateProductoRequest>): Promise<Producto> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyProductos.findIndex((p) => p.id === id)
        if (index === -1) throw new Error("Producto not found")

        const ingredientes = producto.ingredienteIds
          ? dummyIngredientes.filter((i) => producto.ingredienteIds!.includes(i.id))
          : dummyProductos[index].ingredientes

        const updatedProducto = {
          ...dummyProductos[index],
          ...producto,
          ingredientes,
          updatedAt: new Date(),
        }

        dummyProductos[index] = updatedProducto
        return updatedProducto
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error updating producto:", error)
      throw error
    }
  }

  async deleteProducto(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyProductos.findIndex((p) => p.id === id)
        if (index === -1) throw new Error("Producto not found")
        dummyProductos.splice(index, 1)
        return
      }
    } catch (error) {
      console.error("Error deleting producto:", error)
      throw error
    }
  }
}

export const productoService = new ProductoService()
