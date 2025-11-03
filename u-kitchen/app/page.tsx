"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Briefcase } from "lucide-react";
import { userService } from "@/services/usuario-service";
import type { Usuario } from "@/types/usuario.types";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth(); // Usa el hook
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si ya hay user, redirige
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleLoginAsRole = async (role: "admin" | "cliente" | "empleado") => {
    setLoading(true);
    try {
      let userId: string;
      switch (role) {
        case "admin":
          userId = "1956859782010769570";
          break;
        case "cliente":
          userId = "1956872646238933172";
          break;
        case "empleado":
          userId = "1956874564491284676";
          break;
        default:
          throw new Error("Rol inválido");
      }
      const fetchedUser: Usuario = await userService.getUsuarioById(userId);
      
      // Usa el login del hook (actualiza state y localStorage)
      login(fetchedUser);
      
      // No necesitas router.refresh() ya que el hook actualiza reactivamente
      // Redirige basado en rol (igual que antes)
      switch (fetchedUser.role) {
        case "admin":
          router.replace("/dashboard");
          break;
        case "user":
          if (fetchedUser.client) {
            router.replace("/menu");
          } else if (fetchedUser.employee) {
            router.replace("/pedidos");
          }
          break;
        default:
          router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-orange-600">Bienvenido a U Kitchen</h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Selecciona tu rol para ingresar
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleLoginAsRole("admin")}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Ingresar como Admin</CardTitle>
                <CardDescription>Acceso completo al sistema</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleLoginAsRole("cliente")}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Ingresar como Cliente</CardTitle>
                <CardDescription>Gestión de pedidos y reservas</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleLoginAsRole("empleado")}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Ingresar como Empleado</CardTitle>
                <CardDescription>Gestión operativa del restaurante</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
        {loading && (
          <div className="text-center text-sm text-gray-600">Cargando...</div>
        )}
      </div>
    </div>
  );
}