import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Employee } from "./employee.model";
import { environment } from '../../environments/environment.js';

@Injectable({ providedIn: 'root', })
export class EmployeeService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getEmployees() {
    const url = this.baseUrl + "api/employees";
    return this.http.get(url);
    // return this.http.get<Employee[]>(url);
  }

  createEmployee(employee: Employee) {
    const url = this.baseUrl + "api/employees";
    return this.http.post(url, employee);
  }

  updateEmployee(employee: Employee) {
    const url = this.baseUrl + "api/employees/" + employee.taxId;
    return this.http.put(url, employee);
  }

  deleteEmployee(taxId: string) {
    const url = this.baseUrl + "api/employees/" + taxId;
    return this.http.delete(url);
  }

}