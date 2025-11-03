import type { Proveedor, CreateProveedorRequest, ProveedorFilters } from "@/types/proveedor.types"
import { PaginatedResponse } from "@/types/common.types";
import { api } from "@/lib/api"

class ProveedorService {
  async getProveedores(filters?: ProveedorFilters): Promise<PaginatedResponse<Proveedor>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }
      
      const endpoint = `/supplier/findAll${params.toString() ? `?${params.toString()}` : ''}`;
      return await api.get<PaginatedResponse<Proveedor>>(endpoint);
    } catch (error) {
      console.error("Error fetching proveedores:", error)
      throw error
    }
  }

  async getProveedorById(id: string): Promise<Proveedor> {
    try {
      return await api.get<Proveedor>(`/supplier/id/${id}`);
    } catch (error) {
      console.error("Error fetching proveedor:", error)
      throw error
    }
  }

  async createProveedor(proveedor: CreateProveedorRequest): Promise<Proveedor> {
    try {
      return await api.post<Proveedor>('/supplier/add', proveedor);
    } catch (error) {
      console.error("Error creating proveedor:", error)
      throw error
    }
  }

  async updateProveedor(id: string, proveedor: Partial<CreateProveedorRequest>): Promise<Proveedor> {
    try {
      return await api.put<Proveedor>(`/supplier/${id}`, proveedor);
    } catch (error) {
      console.error("Error updating proveedor:", error)
      throw error
    }
  }

  async deleteProveedor(id: string): Promise<void> {
    try {
      await api.delete<void>(`/supplier/${id}`);
    } catch (error) {
      console.error("Error deleting proveedor:", error)
      throw error
    }
  }
}

export const proveedorService = new ProveedorService()
