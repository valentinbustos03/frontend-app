export interface Mesa {
  id: string
  cod: string
  capacity: number
  description?: string
  occupied: boolean
  sector: string
}

export interface CreateMesaRequest {
  cod: string
  capacity: number
  description?: string
  occupied: boolean
  sector: string
}

// Filtros para Mesa
export interface MesaFilters {
  capacity?: number
  occupied?: boolean
  sector?: string
}