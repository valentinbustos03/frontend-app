"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth"; // ¡Nuevo: Usa el hook en lugar de localStorage

type Role = "admin" | "cliente" | "empleado";

// Roles habilitados por prefijo de ruta (las rutas de detalle heredan del prefijo)
const ROUTE_ACCESS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard", roles: ["admin", "empleado"] },
  { prefix: "/mis-pedidos", roles: ["cliente"] },
  { prefix: "/menu", roles: ["admin", "cliente", "empleado"] },
  { prefix: "/clientes", roles: ["admin"] },
  { prefix: "/employees", roles: ["admin"] },
  { prefix: "/mesas", roles: ["admin", "empleado"] },
  { prefix: "/pedidos", roles: ["admin", "empleado"] },
  { prefix: "/reservas", roles: ["admin", "empleado"] },
  { prefix: "/proveedores", roles: ["admin", "empleado"] },
  { prefix: "/ingredientes", roles: ["admin", "empleado"] },
  { prefix: "/platos", roles: ["admin", "empleado"] },
  { prefix: "/promociones", roles: ["admin", "empleado"] },
  { prefix: "/reports", roles: ["admin"] },
];

export const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard",
  empleado: "/pedidos",
  cliente: "/menu",
};

// Spinner simple (puedes reemplazar con tu componente)
function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, currentRole } = useAuth(); // ¡Nuevo: Usa useAuth

  useEffect(() => {
    if (loading) return;
    const isLoginPage = pathname === "/";
    if (!user && !isLoginPage) {
      router.push("/");
      return;
    }
    if (user && currentRole !== "guest") {
      const rule = ROUTE_ACCESS.find(
        (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`)
      );
      if (rule && !rule.roles.includes(currentRole)) {
        router.push(ROLE_HOME[currentRole]);
      }
    }
  }, [user, loading, currentRole, pathname, router]);

  // Durante loading, muestra spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // Si no hay user y no es login, children no se renderiza (useEffect redirige)
  if (!user && pathname !== "/") {
    return null; // O redirige inmediatamente, pero useEffect lo maneja
  }

  return <>{children}</>;
}