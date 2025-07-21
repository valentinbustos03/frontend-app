import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from "@angular/material/input";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Employee } from '../employee.model.js';
import { EmployeeService } from '../employee.service.js';

@Component({
  selector: 'app-edit-employee',
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogActions, MatDialogContent, MatDialogTitle],
  templateUrl: './edit-employee.html',
  styleUrl: './edit-employee.css'
})
export class EditEmployee {
  readonly dialogRef = inject(MatDialogRef<EditEmployee>);
  readonly data = inject(MAT_DIALOG_DATA);
  readonly employeeService = inject(EmployeeService);

  employeeForm: FormGroup;
  employee: Employee;
  employeeEdition: boolean = false;

  constructor(private fb: FormBuilder) {
    this.employee = this.data.employee;
    this.employeeEdition = Boolean(this.data.employee);
    this.employeeForm = this.fb.group({
      taxId: ['', Validators.required],
      companyName: ['', Validators.required],
      shift: ['', Validators.required],
      workedHours: [0, [Validators.required, Validators.min(0)]],
      priceHour: [0, [Validators.required, Validators.min(0)]],
      salary: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit() {
    this.employeeForm.valueChanges.subscribe(() => {
      const horas = this.employeeForm.get('workedHours')?.value || 0;
      const precio = this.employeeForm.get('priceHour')?.value || 0;
      this.employeeForm.get('salary')?.setValue(horas * precio, { emitEvent: false });
    })
    if (this.employeeEdition) {
      this.employeeForm.get("taxId")?.setValue(this.employee.taxId);
      this.employeeForm.get("companyName")?.setValue(this.employee.companyName);
      this.employeeForm.get("shift")?.setValue(this.employee.shift);
      this.employeeForm.get("workedHours")?.setValue(this.employee.workedHours);
      this.employeeForm.get("priceHour")?.setValue(this.employee.priceHour);
    }
  }

  createEmployee() {
    // Lógica para navegar a formulario de creación
    console.log('Crear nuevo employee');
    this.employeeService.createEmployee(this.employee)
      .subscribe({
        next: (res) => { console.log(res); this.dialogRef.close('Employee created successfully') },
        //idealmente: mostrar un snakbar con el error y no cerrar el dialog
        error: (error: any) => { console.log(error); this.dialogRef.close(error.message) }
      });
  }

  editEmployee() {
    console.log('Edit employee');
    this.employeeService.updateEmployee(this.employee)
      .subscribe({
        next: (res) => { console.log(res); this.dialogRef.close('Employee edited successfully') },
        //idealmente: mostrar un snakbar con el error y no cerrar el dialog
        error: (error: any) => { console.log(error); this.dialogRef.close(error.message) }
      });
  }

  onSubmit() {
    console.log(this.employeeForm.value);
    // Lógica para guardar/editar el employee
    this.employee = this.employeeForm.value; //revisar si funciona correctamente

    if (this.employeeEdition) {
      this.editEmployee()
    } else {
      this.createEmployee();
    }

  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
