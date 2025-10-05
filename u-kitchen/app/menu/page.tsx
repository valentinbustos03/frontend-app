"use client"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, ShoppingCart, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Plato } from "@/types" // Asumiendo que la interfaz está en types
import { platoService } from "@/services/plato-service"

export default function MenuPage() {
  const [platos, setPlatos] = useState<Plato[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [tagFilter, setTagFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"none" | "price-asc" | "price-desc" | "calification-desc">("none")
  const [cart, setCart] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    loadPlatos()
  }, [])

  const loadPlatos = async () => {
    try {
      setLoading(true)
      const response = await platoService.getPlatos()
      setPlatos(response.data)
    } catch (error) {
      console.error("Error loading platos:", error)
    } finally {
      setLoading(false)
    }
  }

  const uniqueTags = useMemo(() => {
    return [...new Set(platos.map(p => p.tag))].sort()
  }, [platos])

  const filteredAndSorted = useMemo(() => {
    let res = platos.filter(p =>
      (tagFilter === "all" || p.tag === tagFilter) &&
      (searchTerm === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description?.toLowerCase().includes(searchTerm.toLowerCase())))
    )

    res.sort((a, b) => {
      if (sortBy === "none") return 0
      if (sortBy === "price-asc") return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      if (sortBy === "calification-desc") return (b.calification || 0) - (a.calification || 0)
      return 0
    })

    return res
  }, [platos, searchTerm, tagFilter, sortBy])

  const grouped = useMemo(() => {
    const groups: { [tag: string]: Plato[] } = {}
    filteredAndSorted.forEach(p => {
      if (!groups[p.tag]) groups[p.tag] = []
      groups[p.tag].push(p)
    })
    return groups
  }, [filteredAndSorted])

  const addToCart = (id: string, delta: number) => {
    setCart(prev => {
      const currentQty = prev[id] || 0
      const newQty = currentQty + delta
      const newCart = { ...prev }
      if (newQty <= 0) {
        delete newCart[id]
      } else {
        newCart[id] = newQty
      }
      return newCart
    })
  }

  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const plato = platos.find(p => p.id === id)
      return sum + (qty * (plato?.price || 0))
    }, 0)
  }, [cart, platos])

  const confirmOrder = () => {
    console.log("Confirmar pedido:", cart)
    // Aquí integrar con servicio de pedidos si es necesario
    alert("Pedido confirmado!")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Menú Online</h1>
          <p className="text-gray-600">Explora nuestro menú y realiza tu pedido</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-orange-600">Menú Online</h1>
        <p className="text-gray-600">Explora nuestro menú y realiza tu pedido</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-[160px] sm:w-[180px]">
                  <SelectValue placeholder="Todos los tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tags</SelectItem>
                  {uniqueTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-[180px] sm:w-[200px]">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin orden</SelectItem>
                  <SelectItem value="price-asc">Precio: bajo a alto</SelectItem>
                  <SelectItem value="price-desc">Precio: alto a bajo</SelectItem>
                  <SelectItem value="calification-desc">Mejor calificados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secciones por tag */}
      <div className="space-y-8">
        {Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron platos</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([tag, dishes]) => (
            <div key={tag}>
              <h2 className="text-2xl font-bold text-orange-600 mb-4">
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dishes.map((plato) => {
                  const qty = cart[plato.id] || 0
                  return (
                    <Card key={plato.id} className={`hover:shadow-lg transition-shadow ${plato.picture ? 'pt-0' : ''}`}>
                      {plato.picture && (
                        <img
                          src={plato.picture}
                          alt={plato.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{plato.name}</CardTitle>
                        {plato.description && (
                          <CardDescription>{plato.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{tag}</Badge>
                          {/* <Badge variant="secondary">Chef: {plato.chef}</Badge> */}
                        </div>
                        {plato.calification && (
                          <p className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            {plato.calification}/5
                          </p>
                        )}
                        <p className="text-2xl font-bold text-orange-600">${plato.price.toFixed(2)}</p>
                        <div className="flex items-center justify-end">
                          {qty > 0 && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-orange-600 text-white hover:bg-orange-700"
                              onClick={() => addToCart(plato.id, -1)}
                            >
                              -
                            </Button>
                          )}
                          {qty > 0 && <span className="mx-3 font-medium">{qty}</span>}
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-orange-600 text-white hover:bg-orange-700"
                            onClick={() => addToCart(plato.id, 1)}
                          >
                            {qty > 0 ? "+" : "Agregar"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              <Separator className="my-8" />
            </div>
          ))
        )}
      </div>

      {/* Resumen del carrito */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bg-sidebar bottom-0 left-0 right-0 border-t shadow-lg p-4 z-50">
          <div className="mb-2 max-h-32 overflow-y-auto space-y-1 text-sm">
            {Object.entries(cart).map(([id, qty]) => {
              const plato = platos.find(p => p.id === id)
              if (!plato) return null
              return (
                <div key={id} className="flex items-center justify-between">
                  <span>{plato.name} x{qty}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addToCart(id, -qty)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <span>${(plato.price * qty).toFixed(2)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <Separator />
          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-bold">Total: ${total.toFixed(2)}</span>
            <Button
              onClick={confirmOrder}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Confirmar Pedido
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}