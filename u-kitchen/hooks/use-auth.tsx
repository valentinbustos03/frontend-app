"use client"
import { useState, useEffect, useMemo, useContext, createContext } from 'react';
import type { Usuario } from '@/types/usuario.types';

type AuthContextType = {
  user: Usuario | null;
  loading: boolean;
  isAdmin: boolean;
  isCliente: boolean;
  isEmpleado: boolean;
  currentRole: 'admin' | 'cliente' | 'empleado' | 'guest';
  login: (userData: Usuario) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carga inicial desde localStorage
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      try {
        const parsedUser = JSON.parse(loggedInUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("loggedInUser");
      }
    }
    setLoading(false);

    // Listener para cambios en storage (e.g., login en otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "loggedInUser") {
        const newUserData = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(newUserData);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData: Usuario) => {
    // Almacena solo datos parciales para evitar serialización profunda
    const userToStore = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      profilePicture: userData.profilePicture,
      ...(userData.client && { client: { id: userData.client.id } }), // Solo ID para storage
      ...(userData.employee && { employee: { id: userData.employee.id } }), // Solo ID para storage
    };
    localStorage.setItem("loggedInUser", JSON.stringify(userToStore));
    setUser(userData); // Mantiene el user full en state
  };

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isCliente = user?.role === 'user' && !!user.client;
  const isEmpleado = user?.role === 'user' && !!user.employee;

  const currentRole: 'admin' | 'cliente' | 'empleado' | 'guest' = useMemo(() => {
    if (user?.role === 'admin') return 'admin';
    if (isCliente) return 'cliente';
    if (isEmpleado) return 'empleado';
    return 'guest';
  }, [user?.role, isCliente, isEmpleado]);

  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    isCliente,
    isEmpleado,
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