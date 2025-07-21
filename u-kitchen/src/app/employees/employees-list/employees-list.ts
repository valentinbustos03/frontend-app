import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Employee } from '../employee.model.js';
import { MatTooltipModule } from "@angular/material/tooltip";
import { EditEmployee } from '../edit-employee/edit-employee.js';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../employee.service';
@Component({
  selector: 'app-employees-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './employees-list.html',
  styleUrl: './employees-list.css'
})

export class EmployeesList implements OnInit {
  displayedColumns: string[] = ['taxId', 'companyName', 'shift', 'workedHours', 'priceHour', 'salary', 'actions'];
  dataSource = new MatTableDataSource<Employee>([]);
  readonly dialog = inject(MatDialog);
  readonly employeeService = inject(EmployeeService);
  private _snackBar = inject(MatSnackBar);

  ngOnInit() {
    // Placeholder para cargar employees desde API
    this.loadEmployees();
  }

  // Placeholder para cargar employees desde una API
  loadEmployees() {
    // Ejemplo de datos iniciales (reemplazar con llamada a API)
    const employees: Employee[] = [
      { taxId: 'Employee 1', companyName: '20-12345678-9', shift: 'Mañana', workedHours: 40, priceHour: 100, salary: 4000 },
      { taxId: 'Employee 2', companyName: '20-98765432-1', shift: 'Tarde', workedHours: 35, priceHour: 120, salary: 4200 }
    ];
    this.dataSource.data = employees;
    // Futura implementación: 
    // this.employeeService.getEmployees().subscribe({
    //   next: (data: any) => { console.log(data); this.dataSource.data = data.data },
    //   error: (error: any) => this._snackBar.open(error.message, "Ok", {
    //     duration: 3000,
    //     horizontalPosition: 'end',
    //     verticalPosition: 'top',
    //     panelClass: ['error-snackbar']
    //   })
    // });
  }

  // Placeholder para crear nuevo employee
  onCreate() {
    // Lógica para navegar a formulario de creación
    console.log('Crear nuevo employee');
    this.openEditDialog()
    // Futura implementación: this.router.navigate(['/employee/nuevo']);
  }

  // Placeholder para editar employee
  onEdit(employee: Employee) {
    console.log('Editar employee', employee);
    this.openEditDialog(employee)
    // Futura implementación: this.router.navigate(['/employee/edit', employee.id]);
  }

  // Placeholder para borrar employee
  onDelete(employee: Employee) {
    console.log('Borrar employee', employee);
    // Futura implementación: this.http.delete(`api/employees/${employee.id}`).subscribe(() => this.loadEmployees());
  }

  openEditDialog(employee?: Employee): void {

    const dialogRef = this.dialog.open(EditEmployee, {
      data: { employee: employee },
      height: 'fit-content',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        console.log("result: ", result);
      }
    });
  }
}
