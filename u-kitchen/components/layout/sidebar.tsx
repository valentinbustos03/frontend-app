"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  MenuIcon,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  MenuIcon as Restaurant,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clientes",
  },
  {
    label: "Empleados",
    icon: Users,
    href: "/employees",
  },
  {
    label: "Mesas",
    icon: MenuIcon,
    href: "/mesas",
  },
  {
    label: "Proveedores",
    icon: Package,
    href: "/proveedores",
  },
  {
    label: "Ingredientes",
    icon: Package,
    href: "/ingredientes",
  },
  {
    label: "Platos",
    icon: MenuIcon,
    href: "/platos",
  },
  {
    label: "Pedidos",
    icon: ShoppingCart,
    href: "/pedidos",
  },
  {
    label: "Reservas",
    icon: BarChart3,
    href: "/reservas",
  },
  {
    label: "Reportes",
    icon: BarChart3,
    href: "/reports",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16",
          "lg:translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-800 px-4">
          <div className="flex items-center space-x-3">
            <Restaurant className="h-8 w-8 text-orange-500" />
            {isOpen && <h1 className="text-xl font-bold">RestaurantApp</h1>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                      !isOpen && "justify-center",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isOpen && "mr-3")} />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}
