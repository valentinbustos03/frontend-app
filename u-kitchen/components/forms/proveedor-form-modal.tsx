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
import { toast } from "@/hooks/use-toast"
import type { Proveedor, CreateProveedorRequest } from "@/types"

interface ProveedorFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateProveedorRequest) => Promise<void>
  proveedor?: Proveedor
  title: string
}

export function ProveedorFormModal({ open, onClose, onSubmit, proveedor, title }: ProveedorFormModalProps) {
  const [formData, setFormData] = useState<CreateProveedorRequest>({
    razonSocial: "",
    cuitCuil: "",
    mail: "",
    telefono: "",
    tipoIngrediente: "",
    nombre: "",
    compania: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (proveedor) {
      setFormData({
        razonSocial: proveedor.razonSocial,
        cuitCuil: proveedor.cuitCuil,
        mail: proveedor.mail,
        telefono: proveedor.telefono,
        tipoIngrediente: proveedor.tipoIngrediente,
        nombre: proveedor.nombre,
        compania: proveedor.compania,
      })
    } else {
      setFormData({
        razonSocial: "",
        cuitCuil: "",
        mail: "",
        telefono: "",
        tipoIngrediente: "",
        nombre: "",
        compania: "",
      })
    }
  }, [proveedor, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
      toast({
        title: "Éxito",
        description: `Proveedor ${proveedor ? "actualizado" : "creado"} correctamente`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al ${proveedor ? "actualizar" : "crear"} el proveedor`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateProveedorRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-orange-600">{title}</DialogTitle>
          <DialogDescription>
            {proveedor ? "Edita los datos del proveedor" : "Completa los datos del nuevo proveedor"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razonSocial">Razón Social</Label>
            <Input
              id="razonSocial"
              value={formData.razonSocial}
              onChange={(e) => handleInputChange("razonSocial", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuitCuil">CUIT/CUIL</Label>
            <Input
              id="cuitCuil"
              value={formData.cuitCuil}
              onChange={(e) => handleInputChange("cuitCuil", e.target.value)}
              placeholder="30-12345678-9"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mail">Email</Label>
              <Input
                id="mail"
                type="email"
                value={formData.mail}
                onChange={(e) => handleInputChange("mail", e.target.value)}
                placeholder="contacto@proveedor.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="compania">Compañía</Label>
            <Input
              id="compania"
              value={formData.compania}
              onChange={(e) => handleInputChange("compania", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoIngrediente">Tipo de Ingrediente</Label>
            <Input
              id="tipoIngrediente"
              value={formData.tipoIngrediente}
              onChange={(e) => handleInputChange("tipoIngrediente", e.target.value)}
              placeholder="Carnes, Verduras, Lácteos, etc."
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="text-white bg-orange-600 hover:bg-orange-700" type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : proveedor ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
