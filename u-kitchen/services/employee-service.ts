import { Empleado, EmpleadoFilters, CreateEmpleadoRequest, PaginatedResponse } from "@/types"

// Simulación de datos para desarrollo
const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@restaurant.com",
    phone: "+1234567890",
    position: "CHEF",
    department: "KITCHEN",
    hireDate: new Date("2023-01-15"),
    salary: 45000,
    status: "ACTIVE",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    firstName: "María",
    lastName: "González",
    email: "maria.gonzalez@restaurant.com",
    phone: "+1234567891",
    position: "WAITER",
    department: "SERVICE",
    hireDate: new Date("2023-02-20"),
    salary: 32000,
    status: "ACTIVE",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-02-20"),
  },
  {
    id: "3",
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.rodriguez@restaurant.com",
    phone: "+1234567892",
    position: "BARTENDER",
    department: "BAR",
    hireDate: new Date("2023-03-10"),
    salary: 35000,
    status: "ACTIVE",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
  },
  {
    id: "4",
    firstName: "Ana",
    lastName: "Martínez",
    email: "ana.martinez@restaurant.com",
    phone: "+1234567893",
    position: "MANAGER",
    department: "MANAGEMENT",
    hireDate: new Date("2022-12-01"),
    salary: 55000,
    status: "ACTIVE",
    createdAt: new Date("2022-12-01"),
    updatedAt: new Date("2022-12-01"),
  },
]

class EmployeeService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async getEmployees(filters?: EmployeeFilters): Promise<PaginatedResponse<Employee>> {
    try {
      // En desarrollo, usar datos mock
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simular delay

        let filteredEmployees = [...mockEmployees]

        if (filters?.search) {
          const search = filters.search.toLowerCase()
          filteredEmployees = filteredEmployees.filter(
            (emp) =>
              emp.firstName.toLowerCase().includes(search) ||
              emp.lastName.toLowerCase().includes(search) ||
              emp.email.toLowerCase().includes(search),
          )
        }

        if (filters?.department) {
          filteredEmployees = filteredEmployees.filter((emp) => emp.department === filters.department)
        }

        if (filters?.position) {
          filteredEmployees = filteredEmployees.filter((emp) => emp.position === filters.position)
        }

        if (filters?.status) {
          filteredEmployees = filteredEmployees.filter((emp) => emp.status === filters.status)
        }

        const page = filters?.page || 1
        const limit = filters?.limit || 10
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit

        return {
          data: filteredEmployees.slice(startIndex, endIndex),
          total: filteredEmployees.length,
          page,
          limit,
          totalPages: Math.ceil(filteredEmployees.length / limit),
        }
      }

      // Producción - llamada real a la API
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${this.baseUrl}/employees?${params}`)
      if (!response.ok) throw new Error("Error fetching employees")

      return response.json()
    } catch (error) {
      console.error("Error fetching employees:", error)
      throw error
    }
  }

  async getEmployeeById(id: string): Promise<Employee> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const employee = mockEmployees.find((emp) => emp.id === id)
        if (!employee) throw new Error("Employee not found")
        return employee
      }

      const response = await fetch(`${this.baseUrl}/employees/${id}`)
      if (!response.ok) throw new Error("Employee not found")

      return response.json()
    } catch (error) {
      console.error("Error fetching employee:", error)
      throw error
    }
  }

  async createEmployee(employee: CreateEmployeeRequest): Promise<Employee> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const newEmployee: Employee = {
          ...employee,
          id: Date.now().toString(),
          status: "ACTIVE" as EmployeeStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockEmployees.push(newEmployee)
        return newEmployee
      }

      const response = await fetch(`${this.baseUrl}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      })

      if (!response.ok) throw new Error("Error creating employee")
      return response.json()
    } catch (error) {
      console.error("Error creating employee:", error)
      throw error
    }
  }

  async updateEmployee(employee: UpdateEmployeeRequest): Promise<Employee> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = mockEmployees.findIndex((emp) => emp.id === employee.id)
        if (index === -1) throw new Error("Employee not found")

        const updatedEmployee = { ...mockEmployees[index], ...employee, updatedAt: new Date() }
        mockEmployees[index] = updatedEmployee
        return updatedEmployee
      }

      const response = await fetch(`${this.baseUrl}/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      })

      if (!response.ok) throw new Error("Error updating employee")
      return response.json()
    } catch (error) {
      console.error("Error updating employee:", error)
      throw error
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const index = mockEmployees.findIndex((emp) => emp.id === id)
        if (index === -1) throw new Error("Employee not found")
        mockEmployees.splice(index, 1)
        return
      }

      const response = await fetch(`${this.baseUrl}/employees/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error deleting employee")
    } catch (error) {
      console.error("Error deleting employee:", error)
      throw error
    }
  }

  async changeEmployeeStatus(id: string, status: EmployeeStatus): Promise<Employee> {
    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const index = mockEmployees.findIndex((emp) => emp.id === id)
        if (index === -1) throw new Error("Employee not found")

        mockEmployees[index] = { ...mockEmployees[index], status, updatedAt: new Date() }
        return mockEmployees[index]
      }

      const response = await fetch(`${this.baseUrl}/employees/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Error updating employee status")
      return response.json()
    } catch (error) {
      console.error("Error updating employee status:", error)
      throw error
    }
  }
}

export const employeeService = new EmployeeService()
