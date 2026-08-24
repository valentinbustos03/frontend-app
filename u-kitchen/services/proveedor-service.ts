import type { Proveedor, CreateProveedorRequest, ProveedorFilters } from "@/types/proveedor.types"
import { api, type ApiResponse } from "@/lib/api"

class ProveedorService {
  async getProveedores(filters?: ProveedorFilters): Promise<Proveedor[]> {
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
      const response = await api.get<ApiResponse<Proveedor[]>>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching proveedores:", error)
      throw error
    }
  }

  async getProveedorById(id: string): Promise<Proveedor> {
    try {
      const response = await api.get<ApiResponse<Proveedor>>(`/supplier/id/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching proveedor:", error)
      throw error
    }
  }

  async findByTaxId(taxId: string): Promise<Proveedor> {
    try {
      const response = await api.get<ApiResponse<Proveedor>>(`/supplier/taxId/${taxId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching proveedor by taxId:", error)
      throw error
    }
  }

  async createProveedor(proveedor: CreateProveedorRequest): Promise<Proveedor> {
    try {
      const response = await api.post<ApiResponse<Proveedor>>('/supplier/add', proveedor);
      return response.data;
    } catch (error) {
      console.error("Error creating proveedor:", error)
      throw error
    }
  }

  async updateProveedor(id: string, proveedor: Partial<CreateProveedorRequest>): Promise<Proveedor> {
    try {
      const response = await api.put<ApiResponse<Proveedor>>(`/supplier/${id}`, proveedor);
      return response.data;
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
