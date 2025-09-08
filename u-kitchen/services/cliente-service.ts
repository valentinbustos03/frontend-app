import type { Cliente, CreateClienteRequest, ClienteFilters, PaginatedResponse } from "@/types"
import { dummyClientes } from "@/data/dummy-data"

class ClienteService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getClientes(filters?: ClienteFilters): Promise<PaginatedResponse<Cliente>> {
    try {
      // En desarrollo, usar datos mock
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        let filteredClientes = [...dummyClientes]

        if (filters?.search) {
          const search = filters.search.toLowerCase()
          filteredClientes = filteredClientes.filter(
            (cliente) =>
              cliente.usuario.nombreApellido.toLowerCase().includes(search) ||
              cliente.usuario.mail.toLowerCase().includes(search),
          )
        }

        if (filters?.penalizacion) {
          filteredClientes = filteredClientes.filter((cliente) => {
            switch (filters.penalizacion) {
              case "ninguna":
                return cliente.penalizacion === 0
              case "baja":
                return cliente.penalizacion > 0 && cliente.penalizacion <= 2
              case "media":
                return cliente.penalizacion > 2 && cliente.penalizacion <= 5
              case "alta":
                return cliente.penalizacion > 5
              default:
                return true
            }
          })
        }

        return {
          data: filteredClientes,
          total: filteredClientes.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(filteredClientes.length / 10),
        }
      }

      // Producción - llamada real a la API (comentada)
      /*
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${this.baseUrl}/clientes?${params}`)
      if (!response.ok) throw new Error("Error fetching clientes")
      return response.json()
      */

      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    } catch (error) {
      console.error("Error fetching clientes:", error)
      throw error
    }
  }

  async getClienteById(id: string): Promise<Cliente> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const cliente = dummyClientes.find((c) => c.id === id)
        if (!cliente) throw new Error("Cliente not found")
        return cliente
      }

      // const response = await fetch(`${this.baseUrl}/clientes/${id}`)
      // if (!response.ok) throw new Error("Cliente not found")
      // return response.json()

      throw new Error("Cliente not found")
    } catch (error) {
      console.error("Error fetching cliente:", error)
      throw error
    }
  }

  async createCliente(cliente: CreateClienteRequest): Promise<Cliente> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const newCliente: Cliente = {
          id: Date.now().toString(),
          usuario: {
            id: Date.now().toString(),
            mail: cliente.mail,
            contraseña: cliente.contraseña,
            tel: cliente.tel,
            nombreApellido: cliente.nombreApellido,
            rol: "CLIENTE" as any,
            estado: "ACTIVO" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          historialPedidos: [],
          penalizacion: cliente.penalizacion || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dummyClientes.push(newCliente)
        return newCliente
      }

      // const response = await fetch(`${this.baseUrl}/clientes`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(cliente),
      // })
      // if (!response.ok) throw new Error("Error creating cliente")
      // return response.json()

      throw new Error("API not available")
    } catch (error) {
      console.error("Error creating cliente:", error)
      throw error
    }
  }

  async updateCliente(id: string, cliente: Partial<CreateClienteRequest>): Promise<Cliente> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyClientes.findIndex((c) => c.id === id)
        if (index === -1) throw new Error("Cliente not found")

        const updatedCliente = {
          ...dummyClientes[index],
          usuario: {
            ...dummyClientes[index].usuario,
            ...cliente,
            updatedAt: new Date(),
          },
          updatedAt: new Date(),
        }

        dummyClientes[index] = updatedCliente
        return updatedCliente
      }

      // const response = await fetch(`${this.baseUrl}/clientes/${id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(cliente),
      // })
      // if (!response.ok) throw new Error("Error updating cliente")
      // return response.json()

      throw new Error("API not available")
    } catch (error) {
      console.error("Error updating cliente:", error)
      throw error
    }
  }

  async deleteCliente(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyClientes.findIndex((c) => c.id === id)
        if (index === -1) throw new Error("Cliente not found")
        dummyClientes.splice(index, 1)
        return
      }

      // const response = await fetch(`${this.baseUrl}/clientes/${id}`, {
      //   method: "DELETE",
      // })
      // if (!response.ok) throw new Error("Error deleting cliente")
    } catch (error) {
      console.error("Error deleting cliente:", error)
      throw error
    }
  }
}

export const clienteService = new ClienteService()
