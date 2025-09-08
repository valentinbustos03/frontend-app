"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShoppingCart,
  BarChart3,
  Settings,
  ChefHat,
  Calendar,
  Truck,
  Wheat,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "General",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
      },
    ],
  },
  {
    title: "Gestión de Personas",
    items: [
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
    ],
  },
  {
    title: "Operaciones",
    items: [
      {
        label: "Mesas",
        icon: UtensilsCrossed,
        href: "/mesas",
      },
      {
        label: "Pedidos",
        icon: ShoppingCart,
        href: "/pedidos",
      },
      {
        label: "Reservas",
        icon: Calendar,
        href: "/reservas",
      },
    ],
  },
  {
    title: "Inventario",
    items: [
      {
        label: "Proveedores",
        icon: Truck,
        href: "/proveedores",
      },
      {
        label: "Ingredientes",
        icon: Wheat,
        href: "/ingredientes",
      },
      {
        label: "Productos",
        icon: ChefHat,
        href: "/productos",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
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
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">U Kitchen</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-white">{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <Icon className="text-orange-600" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
