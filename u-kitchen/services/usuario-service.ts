import type { Usuario, CreateUsuarioRequest } from "@/types"
import { api } from "@/lib/api"

interface ApiResponse<T> {
  message: string
  data: T
}

class UserService {
  async createUsuario(usuario: CreateUsuarioRequest): Promise<Usuario> {
    try {
      const response = await api.post<ApiResponse<Usuario>>('/user/add', usuario)
      return response.data
    } catch (error) {
      console.error("Error creating usuario:", error)
      throw error
    }
  }

  async updateUsuario(id: string, usuario: Partial<CreateUsuarioRequest>): Promise<Usuario> {
    try {
      const response = await api.put<ApiResponse<Usuario>>(`/user/${id}`, usuario)
      return response.data
    } catch (error) {
      console.error("Error updating usuario:", error)
      throw error
    }
  }

  async getUsuarioById(id: string): Promise<Usuario> {
    try {
      const response = await api.get<ApiResponse<Usuario>>(`/user/id/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching usuario:", error)
      throw error
    }
  }
}

export const userService = new UserService()