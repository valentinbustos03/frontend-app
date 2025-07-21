import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from "@angular/material/input";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { Employee } from '../employee.model.js';

@Component({
  selector: 'app-edit-employee',
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogActions, MatDialogContent, MatDialogTitle],
  templateUrl: './edit-employee.html',
  styleUrl: './edit-employee.css'
})
export class EditEmployee {
  readonly dialogRef = inject(MatDialogRef<EditEmployee>);
  readonly data = inject(MAT_DIALOG_DATA);

  employeeForm: FormGroup;
  employee: Employee;

  constructor(private fb: FormBuilder) {
    this.employee = this.data.employee;
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
    });
    console.log(this.data)
  }

  onSubmit() {
    console.log(this.employeeForm.value);
    // Lógica para guardar/editar el employee

    this.dialogRef.close('Created employee successfully');//añadir return employee creado para actualizar tabla

  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
