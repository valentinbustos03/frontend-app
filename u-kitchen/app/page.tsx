"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { ROLE_HOME } from "@/components/auth/AuthGuard";
import { ApiError } from "@/lib/api";
import { loginSchema, type LoginInput } from "@/lib/schemas";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, currentRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    // Si ya hay sesion activa, no tiene sentido quedarse en el login
    if (user && currentRole !== "guest") {
      router.replace(ROLE_HOME[currentRole]);
    }
  }, [user, currentRole, router]);

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      const sesion = await login(data.email, data.password);
      router.replace(ROLE_HOME[sesion.accessRole]);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast({
        title: "Error",
        description:
          error instanceof ApiError && error.status === 401
            ? "Credenciales inválidas."
            : "No se pudo iniciar sesión. Intenta nuevamente.",
        variant: "destructive",
      });
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
            Ingresá con tu cuenta para continuar
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Iniciar sesión</CardTitle>
            <CardDescription>Usá el email y la contraseña de tu usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ukitchen.com"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
