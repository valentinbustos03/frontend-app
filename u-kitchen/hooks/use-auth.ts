import { useState, useEffect } from 'react';
import type { Usuario } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: Usuario) => {
    localStorage.setItem("loggedInUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isCliente = user?.role === 'user' && user.client;
  const isEmpleado = user?.role === 'user' && user.employee;

  return {
    user,
    loading,
    isAdmin,
    isCliente,
    isEmpleado,
    login,
    logout,
  };
}