"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { useForm, Controller } from "react-hook-form"
import type { Plato, CreatePlatoRequest, Ingrediente, Empleado } from "@/types"
import { platoService } from "@/services/plato-service"
import { ingredienteService } from "@/services/ingrediente-service"
import { empleadoService } from "@/services/empleado-service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmployeeRole } from "@/types" // Assuming EmployeeRole is exported from types

interface PlatoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plato?: Plato
  onSuccess: () => void
}

export function PlatoFormModal({ open, onOpenChange, plato, onSuccess }: PlatoFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [ingredientesLoading, setIngredientesLoading] = useState(false)
  const [chefs, setChefs] = useState<Empleado[]>([])
  const [chefsLoading, setChefsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreatePlatoRequest>({
    defaultValues: {
      cod: "",
      name: "",
      description: "",
      picture: "",
      price: 0,
      calification: 0,
      tag: "",
      ingredients: [],
      chef: undefined,
    },
  })

  useEffect(() => {
    if (open) {
      const init = async () => {
        reset({
          cod: plato?.cod ?? "",
          name: plato?.name ?? "",
          description: plato?.description ?? "",
          picture: plato?.picture ?? "",
          price: plato?.price ?? 0,
          calification: plato?.calification ?? 0,
          tag: plato?.tag ?? "",
          ingredients: plato ? plato.ingredients.map(i => ({ id: i.id })) : [],
        });

        await Promise.all([loadIngredientes(), loadChefs()]);

        if (plato && plato.chef) {
          let selected: Empleado | undefined;
          if (typeof plato.chef === "string") {
            selected = chefs.find((c) => c.id === plato.chef);
          } else {
            selected = plato.chef;
          }
          if (selected) {
            setValue("chef", selected);
          } else {
            toast({
              title: "Error",
              description: "Chef no encontrado",
              variant: "destructive",
            });
          }
        }
      };
      init();
    }
  }, [open, plato, reset, setValue]);

  const loadIngredientes = async () => {
    try {
      setIngredientesLoading(true)
      const response = await ingredienteService.getIngredientes()
      setIngredientes(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los ingredientes",
        variant: "destructive",
      })
    } finally {
      setIngredientesLoading(false)
    }
  }

  const loadChefs = async () => {
    try {
      setChefsLoading(true)
      const response = await empleadoService.getEmpleados()
      setChefs(response.data.filter((e: Empleado) => e.role === EmployeeRole.CHEF))
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los chefs",
        variant: "destructive",
      })
    } finally {
      setChefsLoading(false)
    }
  }

  const ingredientIds = watch("ingredients")

  const onFormSubmit = async (formData: CreatePlatoRequest) => {
    setLoading(true)
    try {
      // Transformar datos para matching con backend
      const dataToSend = {
        cod: formData.cod,
        name: formData.name,
        description: formData.description,
        picture: formData.picture,
        price: formData.price,
        calification: formData.calification,
        tag: formData.tag,
        ingredients: formData.ingredients,
        chef: formData.chef
      }

      console.log(dataToSend) // Para debugging

      if (plato) {
        await platoService.updatePlato(plato.id, dataToSend)
        toast({
          title: "Plato actualizado",
          description: "El plato ha sido actualizado exitosamente",
        })
      } else {
        await platoService.createPlato(dataToSend)
        toast({
          title: "Plato creado",
          description: "El plato ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${plato ? "actualizar" : "crear"} el plato`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleIngredienteChange = (ingredienteId: string, checked: boolean) => {
    const currentIds = ingredientIds || []
    const newIds = checked
      ? [...currentIds, {id: ingredienteId}]
      : currentIds.filter((i) => i.id !== ingredienteId)
    setValue("ingredients", newIds)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-600">{plato ? "Editar Plato" : "Nuevo Plato"}</DialogTitle>
          <DialogDescription>
            {plato ? "Edita los datos del plato" : "Completa los datos del nuevo plato"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod">Código de Plato</Label>
              <Input
                id="cod"
                {...register("cod", { required: "El código es requerido" })}
                placeholder="PLT001"
              />
              {errors.cod && <p className="text-red-500 text-sm">{errors.cod.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                {...register("name", { required: "El nombre es requerido" })}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { 
                  required: "El precio es requerido",
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  valueAsNumber: true
                })}
                min="0"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="picture">URL de Imagen</Label>
              <Input
                id="picture"
                {...register("picture")}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="calification">Calificación</Label>
            <Input
              id="calification"
              type="number"
              step="0.1"
              {...register("calification", { 
                min: { value: 0, message: "Mínimo 0" },
                max: { value: 5, message: "Máximo 5" },
                valueAsNumber: true
              })}
              min="0"
              max="5"
            />
            {errors.calification && <p className="text-red-500 text-sm">{errors.calification.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              {...register("tag", { required: "El tag es requerido" })}
              placeholder="pescados, carnes, etc."
            />
            {errors.tag && <p className="text-red-500 text-sm">{errors.tag.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Chef</Label>
            {chefsLoading ? (
              <p className="text-gray-500">Cargando chefs...</p>
            ) : (
              <Controller
                name="chef"
                control={control}
                rules={{ required: "El chef es requerido" }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      const selected = chefs.find(c => c.id === value)
                      field.onChange(selected)
                    }}
                    value={field.value?.id || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un chef" />
                    </SelectTrigger>
                    <SelectContent>
                      {chefs.map((chef) => (
                        <SelectItem key={chef.id} value={chef.id}>
                          {chef.user?.fullName || chef.taxId || chef.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.chef && <p className="text-red-500 text-sm">{errors.chef.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Ingredientes</Label>
            {ingredientesLoading ? (
              <p className="text-gray-500">Cargando ingredientes...</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {ingredientes.map((ingrediente) => (
                  <div key={ingrediente.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ingrediente-${ingrediente.id}`}
                      checked={(ingredientIds || []).some(i => i.id === ingrediente.id)}
                      onCheckedChange={(checked) => handleIngredienteChange(ingrediente.id, checked as boolean)}
                    />
                    <Label htmlFor={`ingrediente-${ingrediente.id}`} className="text-sm font-normal cursor-pointer">
                      {ingrediente.cod} - {ingrediente.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading || ingredientesLoading || chefsLoading}>
              {loading ? "Guardando..." : plato ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}