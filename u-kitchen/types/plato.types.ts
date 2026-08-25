import { Ingrediente } from './ingrediente.types';
import { Empleado } from './empleado.types';

// El backend guarda la receta en una tabla intermedia: cada ingrediente del plato
// viene con la cantidad que usa.
export interface PlatoIngrediente {
  ingredient: Ingrediente
  quantity: number
}

export interface Plato {
  id: string
  cod: string
  name: string
  description?: string
  picture: string | null
  price: number
  calification?: number
  tag: string
  ingredients: PlatoIngrediente[]
  chef: string
}

export interface CreatePlatoRequest {
  cod: string
  name: string
  description?: string
  picture: string | null
  price: number
  calification?: number
  tag: string
  ingredients: {
      id: string;
      quantity: number;
  }[];
  chef: Empleado
}

// Filtros para Plato
export interface PlatoFilters {
  search?: string
  precioMin?: number
  precioMax?: number
  calificationMin?: number
  tag?: string
}