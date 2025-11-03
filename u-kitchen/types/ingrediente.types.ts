import { Proveedor } from './proveedor.types';
import { Plato } from './plato.types';

export enum UnidadMedida {
  KILOGRAMOS = "kg",
  GRAMOS = "g",
  LITROS = "L",
  MILILITROS = "ml",
  UNIDADES = "unidades",
  PIEZAS = "piezas",
  ONZAS = "oz",
  LIBRAS = "lb",
  GALONES = "gal",
  CUARTOS = "qt",
}

export interface Ingrediente {
  id: string
  cod: string
  name: string
  description?: string
  stock: number
  uniteOfMeasure: UnidadMedida
  origin: string
  stockLimit: number
  suppliers: Proveedor[]
  dishes: Plato[]
}

export interface CreateIngredienteRequest {
  cod: string
  name: string
  description?: string
  stock: number
  uniteOfMeasure: UnidadMedida
  origin: string
  stockLimit: number
  suppliers: {
    id: string;
  }[];
}

// Filtros para Ingrediente
export interface IngredienteFilters {
  search?: string
  stockBajo?: boolean
  proveedor?: string
  uniteOfMeasure?: string
}