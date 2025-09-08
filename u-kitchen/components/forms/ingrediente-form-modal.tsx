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
import type { Ingrediente, CreateIngredienteRequest, UnidadMedida } from "@/types"
import { UnidadMedida as UnidadMedidaEnum } from "@/types"
import { dummyProveedores } from "@/data/dummy-data"

interface IngredienteFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateIngredienteRequest) => Promise<void>
  ingrediente?: Ingrediente
  title: string
}

export function IngredienteFormModal({ open, onClose, onSubmit, ingrediente, title }: IngredienteFormModalProps) {
  const [formData, setFormData] = useState<CreateIngredienteRequest>({
    codigo: "",
    nombre: "",
    descripcion: "",
    stock: 0,
    proveedorIds: [],
    unidad: UnidadMedidaEnum.UNIDADES,
    origen: "",
    limiteBajoStock: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (ingrediente) {
      setFormData({
        codigo: ingrediente.codigo,
        nombre: ingrediente.nombre,
        descripcion: ingrediente.descripcion,
        stock: ingrediente.stock,
        proveedorIds: ingrediente.proveedores.map((p) => p.id),
        unidad: ingrediente.unidad,
        origen: ingrediente.origen,
        limiteBajoStock: ingrediente.limiteBajoStock,
      })
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        stock: 0,
        proveedorIds: [],
        unidad: UnidadMedidaEnum.UNIDADES,
        origen: "",
        limiteBajoStock: 0,
      })
    }
  }, [ingrediente, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
      toast({
        title: "Éxito",
        description: `Ingrediente ${ingrediente ? "actualizado" : "creado"} correctamente`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al ${ingrediente ? "actualizar" : "crear"} el ingrediente`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateIngredienteRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProveedorChange = (proveedorId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      proveedorIds: checked
        ? [...prev.proveedorIds, proveedorId]
        : prev.proveedorIds.filter((id) => id !== proveedorId),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-600">{title}</DialogTitle>
          <DialogDescription>
            {ingrediente ? "Edita los datos del ingrediente" : "Completa los datos del nuevo ingrediente"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                placeholder="ING001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Ingrediente</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad</Label>
              <Select
                value={formData.unidad}
                onValueChange={(value) => handleInputChange("unidad", value as UnidadMedida)}
              >
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="limiteBajoStock">Límite Bajo Stock</Label>
              <Input
                id="limiteBajoStock"
                type="number"
                value={formData.limiteBajoStock}
                onChange={(e) => handleInputChange("limiteBajoStock", Number(e.target.value))}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="origen">Origen</Label>
            <Input
              id="origen"
              value={formData.origen}
              onChange={(e) => handleInputChange("origen", e.target.value)}
              placeholder="Argentina, Local, Importado, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Proveedores</Label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {dummyProveedores.map((proveedor) => (
                <div key={proveedor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`proveedor-${proveedor.id}`}
                    checked={formData.proveedorIds.includes(proveedor.id)}
                    onCheckedChange={(checked) => handleProveedorChange(proveedor.id, checked as boolean)}
                  />
                  <Label htmlFor={`proveedor-${proveedor.id}`} className="text-sm font-normal cursor-pointer">
                    {proveedor.nombre} - {proveedor.compania}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : ingrediente ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
