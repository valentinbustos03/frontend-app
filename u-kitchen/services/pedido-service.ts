import type { Pedido, CreatePedidoRequest, PedidoFilters, PaginatedResponse, PedidoEstado } from "@/types"
import { dummyPedidos, dummyClientes, dummyMesas, dummyEmpleados, dummyProductos } from "@/data/dummy-data"

class PedidoService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getPedidos(filters?: PedidoFilters): Promise<PaginatedResponse<Pedido>> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        let filteredPedidos = [...dummyPedidos]

        if (filters?.fechaDesde) {
          filteredPedidos = filteredPedidos.filter((pedido) => new Date(pedido.fechaHoraInicio) >= filters.fechaDesde!)
        }

        if (filters?.fechaHasta) {
          filteredPedidos = filteredPedidos.filter((pedido) => new Date(pedido.fechaHoraInicio) <= filters.fechaHasta!)
        }

        if (filters?.estado) {
          filteredPedidos = filteredPedidos.filter((pedido) => pedido.estado === filters.estado)
        }

        if (filters?.clienteId) {
          filteredPedidos = filteredPedidos.filter((pedido) => pedido.cliente.id === filters.clienteId)
        }

        if (filters?.meseroId) {
          filteredPedidos = filteredPedidos.filter((pedido) => pedido.mesero?.id === filters.meseroId)
        }

        if (filters?.mesaId) {
          filteredPedidos = filteredPedidos.filter((pedido) => pedido.mesa?.id === filters.mesaId)
        }

        return {
          data: filteredPedidos,
          total: filteredPedidos.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(filteredPedidos.length / 10),
        }
      }

      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
    } catch (error) {
      console.error("Error fetching pedidos:", error)
      throw error
    }
  }

  async getPedidoById(id: string): Promise<Pedido> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const pedido = dummyPedidos.find((p) => p.id === id)
        if (!pedido) throw new Error("Pedido not found")
        return pedido
      }

      throw new Error("Pedido not found")
    } catch (error) {
      console.error("Error fetching pedido:", error)
      throw error
    }
  }

  async createPedido(pedido: CreatePedidoRequest): Promise<Pedido> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const cliente = dummyClientes.find((c) => c.id === pedido.clienteId)
        const mesa = pedido.mesaId ? dummyMesas.find((m) => m.id === pedido.mesaId) : undefined
        const mesero = pedido.meseroId ? dummyEmpleados.find((e) => e.id === pedido.meseroId) : undefined

        if (!cliente) throw new Error("Cliente not found")

        const productos = pedido.productos.map((p) => {
          const producto = dummyProductos.find((prod) => prod.id === p.productoId)
          if (!producto) throw new Error(`Producto ${p.productoId} not found`)

          return {
            producto,
            cantidad: p.cantidad,
            precioUnitario: producto.precio,
            subtotal: producto.precio * p.cantidad,
          }
        })

        const subtotal = productos.reduce((sum, p) => sum + p.subtotal, 0)

        const newPedido: Pedido = {
          id: Date.now().toString(),
          cliente,
          mesa,
          mesero,
          descripcion: pedido.descripcion,
          estado: "PENDIENTE" as PedidoEstado,
          fechaHoraInicio: new Date(),
          fechaHoraFinEstimada: pedido.fechaHoraFinEstimada,
          subtotal,
          productos,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dummyPedidos.push(newPedido)
        return newPedido
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error creating pedido:", error)
      throw error
    }
  }

  async updatePedidoEstado(id: string, estado: PedidoEstado): Promise<Pedido> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const index = dummyPedidos.findIndex((p) => p.id === id)
        if (index === -1) throw new Error("Pedido not found")

        dummyPedidos[index] = {
          ...dummyPedidos[index],
          estado,
          updatedAt: new Date(),
          ...(estado === "ENTREGADO" ? { fechaHoraFin: new Date() } : {}),
        }

        return dummyPedidos[index]
      }

      throw new Error("API not available")
    } catch (error) {
      console.error("Error updating pedido estado:", error)
      throw error
    }
  }
}

export const pedidoService = new PedidoService()
