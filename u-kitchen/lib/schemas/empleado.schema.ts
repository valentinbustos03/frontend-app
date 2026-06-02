import { z } from "zod"
import { EmployeeRole, EmployeeShift } from "@/types/empleado.types"
import { usuarioFields } from "./usuario.schema"

const cuilRegex = /^\d{2}-?\d{8}-?\d$|^\d{11}$/

const empleadoCommon = z.object({
  taxId: z
    .string()
    .min(1, "El CUIT/CUIL es requerido")
    .refine((value) => cuilRegex.test(value), "Formato inválido"),
  shift: z.nativeEnum(EmployeeShift, {
    errorMap: () => ({ message: "Seleccioná un turno válido" }),
  }),
  workedHours: z.coerce.number().min(0).max(744),
  priceHour: z.coerce.number().min(0),
  salary: z.coerce.number().min(0).optional(),
  role: z.nativeEnum(EmployeeRole),
  hierarchy: z.string().max(60).optional().or(z.literal("")),
  tag: z.string().max(60).optional().or(z.literal("")),
  calification: z.coerce.number().min(0).max(5).optional(),
  sector: z.string().max(60).optional().or(z.literal("")),
  email: usuarioFields.email,
  fullName: usuarioFields.fullName,
  phoneNumber: usuarioFields.phoneNumber,
})

type EmpleadoCommon = z.infer<typeof empleadoCommon>

function addRoleSpecificIssues(data: EmpleadoCommon, ctx: z.RefinementCtx) {
  if (data.role === EmployeeRole.CHEF) {
    if (!data.hierarchy) {
      ctx.addIssue({
        path: ["hierarchy"],
        code: z.ZodIssueCode.custom,
        message: "Requerido para chefs",
      })
    }
    return
  }
  if (data.role === EmployeeRole.WAITER) {
    if (data.calification === undefined || data.calification === null) {
      ctx.addIssue({
        path: ["calification"],
        code: z.ZodIssueCode.custom,
        message: "Requerido para meseros",
      })
    }
    if (!data.sector) {
      ctx.addIssue({
        path: ["sector"],
        code: z.ZodIssueCode.custom,
        message: "Requerido para meseros",
      })
    }
  }
}

export const empleadoCreateSchema = empleadoCommon
  .extend({ password: usuarioFields.password })
  .superRefine(addRoleSpecificIssues)

export const empleadoUpdateSchema = empleadoCommon
  .extend({ password: usuarioFields.password.optional().or(z.literal("")) })
  .superRefine(addRoleSpecificIssues)

export type EmpleadoCreateInput = z.infer<typeof empleadoCreateSchema>
export type EmpleadoUpdateInput = z.infer<typeof empleadoUpdateSchema>
