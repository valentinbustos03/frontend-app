"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth"; // ¡Nuevo: Usa el hook en lugar de localStorage

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
  const { user, loading } = useAuth(); // ¡Nuevo: Usa useAuth

  useEffect(() => {
    const isLoginPage = pathname === "/";
    if (!loading && !user && !isLoginPage) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

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