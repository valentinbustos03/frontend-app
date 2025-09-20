import type { Producto, CreateProductoRequest, ProductoFilters, PaginatedResponse } from "@/types"
import { api } from "@/lib/api"

class ProductoService {
  async getProductos(filters?: ProductoFilters): Promise<PaginatedResponse<Producto>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }
      
      const endpoint = `/dish/findAll${params.toString() ? `?${params.toString()}` : ''}`;
      return await api.get<PaginatedResponse<Producto>>(endpoint);
    } catch (error) {
      console.error("Error fetching productos:", error)
      throw error
    }
  }

  async getProductoById(id: string): Promise<Producto> {
    try {
      return await api.get<Producto>(`/dish/id/${id}`);
    } catch (error) {
      console.error("Error fetching producto:", error)
      throw error
    }
  }

  async createProducto(producto: CreateProductoRequest): Promise<Producto> {
    try {
      return await api.post<Producto>('/dish/add', producto);
    } catch (error) {
      console.error("Error creating producto:", error)
      throw error
    }
  }

  async updateProducto(id: string, producto: Partial<CreateProductoRequest>): Promise<Producto> {
    try {
      return await api.put<Producto>(`/dish/${id}`, producto);
    } catch (error) {
      console.error("Error updating producto:", error)
      throw error
    }
  }

  async deleteProducto(id: string): Promise<void> {
    try {
      await api.delete<void>(`/dish/${id}`);
    } catch (error) {
      console.error("Error deleting producto:", error)
      throw error
    }
  }
}

export const productoService = new ProductoService()
