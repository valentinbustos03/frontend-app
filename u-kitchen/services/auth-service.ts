import type { Sesion } from "@/types/usuario.types"
import { api, type ApiResponse } from "@/lib/api"

class AuthService {
  async login(email: string, password: string): Promise<Sesion> {
    const response = await api.post<ApiResponse<Sesion>>('/auth/login', { email, password })
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error("Error closing session:", error)
    }
  }

  async me(): Promise<Sesion> {
    const response = await api.get<ApiResponse<Sesion>>('/auth/me')
    return response.data
  }
}

export const authService = new AuthService()
