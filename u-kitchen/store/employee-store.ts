import { create } from "zustand"
import type { Employee, EmployeeFilters } from "@/types/employee"

interface EmployeeStore {
  employees: Employee[]
  loading: boolean
  error: string | null
  filters: EmployeeFilters

  // Actions
  setEmployees: (employees: Employee[]) => void
  addEmployee: (employee: Employee) => void
  updateEmployee: (employee: Employee) => void
  removeEmployee: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: EmployeeFilters) => void
  clearFilters: () => void
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  employees: [],
  loading: false,
  error: null,
  filters: {},

  setEmployees: (employees) => set({ employees }),

  addEmployee: (employee) =>
    set((state) => ({
      employees: [...state.employees, employee],
    })),

  updateEmployee: (updatedEmployee) =>
    set((state) => ({
      employees: state.employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)),
    })),

  removeEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((emp) => emp.id !== id),
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}))
