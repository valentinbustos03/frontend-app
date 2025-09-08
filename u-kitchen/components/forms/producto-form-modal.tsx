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
import type { Producto, CreateProductoRequest } from "@/types"
import { dummyIngredientes } from "@/data/dummy-data"

interface ProductoFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateProductoRequest) => Promise<void>
  producto?: Producto
  title: string
}

export function ProductoFormModal({ open, onClose, onSubmit, producto, title }: ProductoFormModalProps) {
  const [formData, setFormData] = useState<CreateProductoRequest>({
    codigo: "",
    nombre: "",
    descripcion: "",
    imagen: "",
    precio: 0,
    ingredienteIds: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (producto) {
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagen: producto.imagen || "",
        precio: producto.precio,
        ingredienteIds: producto.ingredientes.map((i) => i.id),
      })
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        imagen: "",
        precio: 0,
        ingredienteIds: [],
      })
    }
  }, [producto, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
      toast({
        title: "Éxito",
        description: `Producto ${producto ? "actualizado" : "creado"} correctamente`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al ${producto ? "actualizar" : "crear"} el producto`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateProductoRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleIngredienteChange = (ingredienteId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      ingredienteIds: checked
        ? [...prev.ingredienteIds, ingredienteId]
        : prev.ingredienteIds.filter((id) => id !== ingredienteId),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-600">{title}</DialogTitle>
          <DialogDescription>
            {producto ? "Edita los datos del producto" : "Completa los datos del nuevo producto"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código de Producto</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                placeholder="PROD001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio ($)</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleInputChange("precio", Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imagen">URL de Imagen</Label>
              <Input
                id="imagen"
                value={formData.imagen}
                onChange={(e) => handleInputChange("imagen", e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ingredientes</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {dummyIngredientes.map((ingrediente) => (
                <div key={ingrediente.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ingrediente-${ingrediente.id}`}
                    checked={formData.ingredienteIds.includes(ingrediente.id)}
                    onCheckedChange={(checked) => handleIngredienteChange(ingrediente.id, checked as boolean)}
                  />
                  <Label htmlFor={`ingrediente-${ingrediente.id}`} className="text-sm font-normal cursor-pointer">
                    {ingrediente.codigo} - {ingrediente.nombre}
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
              {isLoading ? "Guardando..." : producto ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
