import type { Empleado, CreateEmpleadoRequest, EmpleadoFilters, PaginatedResponse } from "@/types"
import { dummyEmpleados } from "@/data/dummy-data"

class EmpleadoService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getEmpleados(filters?: EmpleadoFilters): Promise<PaginatedResponse<Empleado>> {
    try {
      // En desarrollo, usar datos mock
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        let filteredEmpleados = [...dummyEmpleados]
        if (filters?.search) {
          const search = filters.search.toLowerCase()
          filteredEmpleados = filteredEmpleados.filter(
            (empleado) =>
              `${empleado.nombre} ${empleado.apellido}`.toLowerCase().includes(search) ||
              empleado.cuitCuil.toLowerCase().includes(search),
          )
        }
        if (filters?.tipo) {
          filteredEmpleados = filteredEmpleados.filter((empleado) => empleado.tipo === filters.tipo)
        }
        return {
          data: filteredEmpleados,
          total: filteredEmpleados.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(filteredEmpleados.length / 10),
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
      const response = await fetch(`${this.baseUrl}/empleados?${params}`)
      if (!response.ok) throw new Error("Error fetching empleados")
      return response.json()
      */
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    } catch (error) {
      console.error("Error fetching empleados:", error)
      throw error
    }
  }

  async getEmpleadoById(id: string): Promise<Empleado> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const empleado = dummyEmpleados.find((e) => e.id === id)
        if (!empleado) throw new Error("Empleado not found")
        return empleado
      }
      // const response = await fetch(`${this.baseUrl}/empleados/${id}`)
      // if (!response.ok) throw new Error("Empleado not found")
      // return response.json()
      throw new Error("Empleado not found")
    } catch (error) {
      console.error("Error fetching empleado:", error)
      throw error
    }
  }

  async createEmpleado(empleado: CreateEmpleadoRequest): Promise<Empleado> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const newEmpleado: Empleado = {
          id: Date.now().toString(),
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          cuitCuil: empleado.cuitCuil,
          turno: empleado.turno,
          horasTrabajadas: empleado.horasTrabajadas,
          precioPorHora: empleado.precioPorHora,
          sueldo: empleado.horasTrabajadas * empleado.precioPorHora,
          tipo: empleado.tipo,
          calificacion: empleado.calificacion,
          jerarquia: empleado.jerarquia,
          listaProductosEncargado: empleado.listaProductosEncargado,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        dummyEmpleados.push(newEmpleado)
        return newEmpleado
      }
      // const response = await fetch(`${this.baseUrl}/empleados`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(empleado),
      // })
      // if (!response.ok) throw new Error("Error creating empleado")
      // return response.json()
      throw new Error("API not available")
    } catch (error) {
      console.error("Error creating empleado:", error)
      throw error
    }
  }

  async updateEmpleado(id: string, empleado: Partial<CreateEmpleadoRequest>): Promise<Empleado> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyEmpleados.findIndex((e) => e.id === id)
        if (index === -1) throw new Error("Empleado not found")
        const currentEmpleado = dummyEmpleados[index]
        const updatedEmpleado: Empleado = {
          ...currentEmpleado,
          ...empleado,
          sueldo:
            (empleado.horasTrabajadas ?? currentEmpleado.horasTrabajadas) *
            (empleado.precioPorHora ?? currentEmpleado.precioPorHora),
          updatedAt: new Date(),
        }
        dummyEmpleados[index] = updatedEmpleado
        return updatedEmpleado
      }
      // const response = await fetch(`${this.baseUrl}/empleados/${id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(empleado),
      // })
      // if (!response.ok) throw new Error("Error updating empleado")
      // return response.json()
      throw new Error("API not available")
    } catch (error) {
      console.error("Error updating empleado:", error)
      throw error
    }
  }

  async deleteEmpleado(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = dummyEmpleados.findIndex((e) => e.id === id)
        if (index === -1) throw new Error("Empleado not found")
        dummyEmpleados.splice(index, 1)
        return
      }
      // const response = await fetch(`${this.baseUrl}/empleados/${id}`, {
      //   method: "DELETE",
      // })
      // if (!response.ok) throw new Error("Error deleting empleado")
    } catch (error) {
      console.error("Error deleting empleado:", error)
      throw error
    }
  }
}

export const empleadoService = new EmpleadoService()