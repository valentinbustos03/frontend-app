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
  ShoppingBasket,
  BookOpen
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
import { useAuth } from "@/hooks/use-auth"

interface MenuItem {
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  allowedFor: readonly ("admin" | "cliente" | "empleado")[];
  disabled?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuItems: MenuGroup[] = [
  {
    title: "General",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        allowedFor: ["admin", "empleado"],
      },
      {
        label: "Menu",
        icon: BookOpen,
        href: "/menu",
        allowedFor: ["admin", "cliente", "empleado"],
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
        allowedFor: ["admin"],
      },
      {
        label: "Empleados",
        icon: Users,
        href: "/employees",
        allowedFor: ["admin"],
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
        allowedFor: ["admin", "empleado"],
      },
      {
        label: "Pedidos",
        icon: ShoppingCart,
        href: "/pedidos",
        allowedFor: ["admin", "empleado"],
      },
      {
        label: "Reservas",
        icon: Calendar,
        href: "/reservas",
        disabled: true,
        allowedFor: ["admin", "empleado"],
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
        allowedFor: ["admin", "empleado"],
      },
      {
        label: "Ingredientes",
        icon: Wheat,
        href: "/ingredientes",
        allowedFor: ["admin", "empleado"],
      },
      {
        label: "Platos",
        icon: ChefHat,
        href: "/platos",
        allowedFor: ["admin", "empleado"],
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
        disabled: true,
        allowedFor: ["admin"],
      },
      {
        label: "Configuración",
        icon: Settings,
        href: "/settings",
        disabled: true,
        allowedFor: ["admin"],
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, currentRole } = useAuth()

  // ¡Nuevo: Si no hay user o es guest, no renderices nada (fallback para MainLayout)
  if (!user || currentRole === 'guest') {
    return null
  }

  // Filtrar ítems permitidos por rol
  const filteredMenuItems = menuItems.map(group => ({
    ...group,
    items: group.items.filter(item => item.allowedFor.includes(currentRole as 'admin' | 'cliente' | 'empleado')) // ¡Mejorado: Tipado explícito
  })).filter(group => group.items.length > 0) // Ocultar grupos vacíos

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">U Kitchen</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredMenuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-white">{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  const isDisabled = item.disabled
                  return (
                    <SidebarMenuItem key={item.href}>
                      {isDisabled ? (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <div className="flex items-center rounded-md px-2 py-1.5 text-sm font-medium cursor-not-allowed opacity-50 text-muted-foreground hover:bg-transparent pointer-events-none">
                            <Icon className="text-gray-500 opacity-50 mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href}>
                            <Icon className="text-orange-600" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
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