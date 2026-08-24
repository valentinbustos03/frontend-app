"use client"
import { useState, useEffect, useContext, createContext } from 'react';
import { authService } from '@/services/auth-service';
import type { AccessRole, Sesion } from '@/types/usuario.types';

type AuthContextType = {
  user: Sesion | null;
  loading: boolean;
  isAdmin: boolean;
  isCliente: boolean;
  isEmpleado: boolean;
  currentRole: AccessRole | 'guest';
  login: (email: string, password: string) => Promise<Sesion>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Sesion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // La sesion vive en una cookie httpOnly, asi que el unico modo de saber si
    // hay una activa es preguntarle al backend.
    authService
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const sesion = await authService.login(email, password);
    setUser(sesion);
    return sesion;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const currentRole: AccessRole | 'guest' = user?.accessRole ?? 'guest';

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: currentRole === 'admin',
    isCliente: currentRole === 'cliente',
    isEmpleado: currentRole === 'empleado',
    currentRole,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
