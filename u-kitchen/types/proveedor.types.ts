export interface Proveedor {
  id: string
  companyName: string
  taxId: string
  mail: string
  phoneNumber: string
  typeIngredient: string
  fullName: string
  bussinessName: string
}

export interface CreateProveedorRequest {
  companyName: string
  taxId: string
  mail: string
  phoneNumber: string
  typeIngredient: string
  fullName: string
  bussinessName: string
}

// Filtros para Proveedor
export interface ProveedorFilters {
  search?: string
  typeIngredient?: string
}