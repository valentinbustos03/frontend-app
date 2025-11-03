"use client"
import type React from "react"
import { AppSidebar } from "./app-sidebar"
import { Header } from "./header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth" // ¡Nuevo: Import para auth

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, loading } = useAuth() // ¡Nuevo: Obtén user y loading

  // Si está cargando o no hay user, renderiza solo el contenido (sin sidebar)
  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    )
  }

  // Post-login: Renderiza con sidebar completo
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}