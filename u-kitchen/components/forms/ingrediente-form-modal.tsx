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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { ingredienteService } from "@/services/ingrediente-service"
import { proveedorService } from "@/services/proveedor-service"
import type { Ingrediente, CreateIngredienteRequest, UnidadMedida, Proveedor } from "@/types"
import { UnidadMedida as UnidadMedidaEnum } from "@/types"
import { useForm, Controller } from "react-hook-form"

interface IngredienteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ingrediente?: Ingrediente
  onSuccess: () => void
}

export function IngredienteFormModal({ open, onOpenChange, ingrediente, onSuccess }: IngredienteFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateIngredienteRequest>({
    defaultValues: {
      cod: "",
      name: "",
      description: "",
      stock: 0,
      uniteOfMeasure: UnidadMedidaEnum.KILOGRAMOS,
      origin: "",
      stockLimit: 0,
      suppliers: [],
    },
  })

  // Cargar proveedores cuando se abre el modal
  useEffect(() => {
    if (open) {
      proveedorService.getProveedores().then((response) => {
        setProveedores(response.data)
      }).catch((error) => {
        console.error("Error loading proveedores:", error)
      })
    }
  }, [open])

  // Reset del formulario y selected suppliers cuando cambia el modal
  useEffect(() => {
    if (open) {
      reset(ingrediente ? {
        cod: ingrediente.cod,
        name: ingrediente.name,
        description: ingrediente.description,
        stock: ingrediente.stock,
        uniteOfMeasure: ingrediente.uniteOfMeasure as UnidadMedida,
        origin: ingrediente.origin,
        stockLimit: ingrediente.stockLimit,
        suppliers: ingrediente.suppliers.map((p) => ({id: p.id})), 
      } : {
        cod: "",
        name: "",
        description: "",
        stock: 0,
        uniteOfMeasure: UnidadMedidaEnum.KILOGRAMOS,
        origin: "",
        stockLimit: 0,
        suppliers: [],
      })

      // Set selected suppliers for editing
      setSelectedSupplierIds(ingrediente ? ingrediente.suppliers.map((p) => p.id) : [])
    }
  }, [open, ingrediente, reset])

  const handleProveedorChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSupplierIds(prev => [...prev, id])
    } else {
      setSelectedSupplierIds(prev => prev.filter(sid => sid !== id))
    }
  }

  const onFormSubmit = async (data: CreateIngredienteRequest) => {
    try {
      setLoading(true)
      const submitData = {
        ...data,
        suppliers: selectedSupplierIds.map(id => ({ id }))
      }
      console.log(submitData)
      if (ingrediente) {
        await ingredienteService.updateIngrediente(ingrediente.id, submitData)
        toast({
          title: "Ingrediente actualizado",
          description: "El ingrediente ha sido actualizado exitosamente",
        })
      } else {
        await ingredienteService.createIngrediente(submitData)
        toast({
          title: "Ingrediente creado",
          description: "El ingrediente ha sido creado exitosamente",
        })
      }
      onSuccess()
      onOpenChange(false)
      reset()
      setSelectedSupplierIds([])
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${ingrediente ? "actualizar" : "crear"} el ingrediente`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-600">{ingrediente ? "Editar Ingrediente" : "Nuevo Ingrediente"}</DialogTitle>
          <DialogDescription>
            {ingrediente ? "Edita los datos del ingrediente" : "Completa los datos del nuevo ingrediente"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod">Código</Label>
              <Input
                id="cod"
                {...register("cod", { required: "El código es requerido" })}
                placeholder="ING001"
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { 
                  required: "El stock es requerido",
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  valueAsNumber: true
                })}
                min="0"
              />
              {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniteOfMeasure">Unidad</Label>
              <Controller
                name="uniteOfMeasure"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UnidadMedidaEnum.KILOGRAMOS}>Kilogramos</SelectItem>
                      <SelectItem value={UnidadMedidaEnum.GRAMOS}>Gramos</SelectItem>
                      <SelectItem value={UnidadMedidaEnum.LITROS}>Litros</SelectItem>
                      <SelectItem value={UnidadMedidaEnum.MILILITROS}>Mililitros</SelectItem>
                      <SelectItem value={UnidadMedidaEnum.UNIDADES}>Unidades</SelectItem>
                      <SelectItem value={UnidadMedidaEnum.PIEZAS}>Piezas</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.uniteOfMeasure && <p className="text-red-500 text-sm">{errors.uniteOfMeasure.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockLimit">Límite Bajo Stock</Label>
              <Input
                id="stockLimit"
                type="number"
                {...register("stockLimit", { 
                  required: "El límite es requerido",
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  valueAsNumber: true
                })}
                min="0"
              />
              {errors.stockLimit && <p className="text-red-500 text-sm">{errors.stockLimit.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin">Origen</Label>
            <Input
              id="origin"
              {...register("origin", { required: "El origen es requerido" })}
              placeholder="Vegetal, Cereal, etc."
            />
            {errors.origin && <p className="text-red-500 text-sm">{errors.origin.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Proveedores</Label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {proveedores.map((proveedor) => (
                <div key={proveedor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`proveedor-${proveedor.id}`}
                    checked={selectedSupplierIds.includes(proveedor.id)}
                    onCheckedChange={(checked) => handleProveedorChange(proveedor.id, checked as boolean)}
                  />
                  <Label htmlFor={`proveedor-${proveedor.id}`} className="text-sm font-normal cursor-pointer">
                    {proveedor.companyName} ({proveedor.typeIngredient})
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
              {loading ? "Guardando..." : ingrediente ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}