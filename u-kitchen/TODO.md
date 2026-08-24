# TODO — Frontend (U Kitchen)

Plan de lo que falta para terminar el frontend. Ordenado por prioridad.
Los cambios que dependen del backend están marcados con 🔗. El detalle del
esquema de autenticación está en [`AUTENTICACION.md`](../../AUTENTICACION.md).

Estado general: el CRUD de todos los módulos, las páginas de detalle `[id]/`,
el dashboard y `mis-pedidos` están **completos y funcionando**. Lo que queda son
features que dependen del backend, seguridad/auth y algo de deuda técnica.

---

## ✅ Hecho (última tanda)

- **Autenticación** (ver el detalle en el punto 1): login real con credenciales,
  `services/auth-service.ts`, `hooks/use-auth.tsx` sin `localStorage` y cookie
  enviada en cada request desde `lib/api.ts`.

## ✅ Hecho (tanda anterior, sin tocar el backend)

- **Facturación**: `services/factura-service.ts` + flujo real de "Generar factura"
  (diálogo con método de pago) en `app/pedidos/[id]/page.tsx`, contra `POST /order/:id/bill/add`.
- **Control de acceso por rol** en `components/auth/AuthGuard.tsx` (mapa prefijo→roles + redirección).
- **Página de Reportes** (`app/reports/page.tsx`) e item habilitado en el sidebar.
- **Paginación client-side** (`hooks/use-pagination.ts` + `components/shared/pagination-controls.tsx`)
  en los 7 listados (clientes, empleados, ingredientes, mesas, pedidos, platos, proveedores).
- **Filtros de ingredientes**: el filtrado ya funcionaba en la página; se limpió el query muerto del service.
- **Pulido**: `alert()` de login → `toast`; header sin buscador/campana muertos;
  sidebar "Dashboard" → `/dashboard`; `console.log` de debug removidos; página 404 real;
  toast de error al fallar la carga de platos en el menú.

---

## 🔴 Prioridad alta (necesario para "terminar")

### 1. Autenticación real 🔗
El frontend ya está completo. Falta el módulo `auth/` del backend: hasta que exista,
el login devuelve 404.

- [x] Formulario de credenciales (email + password) en `app/page.tsx`, con
      react-hook-form + `loginSchema` (`lib/schemas/auth.schema.ts`). Redirige al
      home del rol y muestra "Credenciales inválidas" en el 401.
- [x] `services/auth-service.ts` con `login()` / `logout()` / `me()`.
- [x] `hooks/use-auth.tsx` sin `localStorage`: pregunta por la sesión con
      `GET /auth/me` al montar. Los flags y `currentRole` salen del rol normalizado
      que manda el backend.
- [x] `lib/api.ts`: `credentials: "include"` para que viaje la cookie httpOnly, y
      redirección al login cuando la API responde 401.
- [x] Control de acceso por rol en `components/auth/AuthGuard.tsx`.
- [x] Reemplazar el `alert()` de error de login por `toast`.
- [ ] Backend 🔗: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` y los
      middlewares `requireAuth` / `requireRole` sobre las rutas.

**Contrato asumido**: las tres respuestas usan el envoltorio `{ message, data }` del
resto de los controllers, y `data` es el usuario más un campo `accessRole`
(`admin` | `cliente` | `empleado`) con el rol ya normalizado. Si el backend le pone
otro nombre a ese campo, el único lugar a tocar es `Sesion` en `types/usuario.types.ts`.

### 2. Normalizar la forma de respuesta de los services 🔗
Hay **drift de contrato**: los `getById` devuelven la entidad cruda, pero
`create`/`update` desenvuelven `response.data` de `{message, data}`. Además:
- `pedido-service.getPedidoById` devuelve crudo pero `pedidos/[id]/page.tsx` desenvuelve `.data` defensivamente.
- `mesaService.createMesa` devuelve crudo y `updateMesa` devuelve `{message, data}` (inconsistente dentro del mismo service).
- `platoService`/`proveedorService` create/update devuelven crudo, distinto a cliente/empleado/pedido/ingrediente.

- [ ] Definir una convención única de respuesta con el backend 🔗 y alinear todos los services.

---

## 🟡 Prioridad media (features incompletas)

### 3. Módulo Reservas 🔗
`types/reserva.types.ts` (`Reserva`, `CreateReservaRequest`, `ReservaEstado`) existe
pero **no hay service ni página**. En el sidebar `/reservas` está `disabled: true`.

- [ ] Backend: no existe entidad/módulo `reservation` 🔗 (crear primero).
- [ ] `services/reserva-service.ts`.
- [ ] Página `app/reservas/page.tsx` (+ detalle si aplica) y habilitar el item del sidebar.

### 4. Página Configuración
- [ ] `/settings` — item deshabilitado en el sidebar, sin página.
- [ ] Header "Perfil" y "Configuración" siguen `disabled` en `components/layout/header.tsx` — apuntar a una página o quitarlos.

### 5. Cálculo de tiempos del pedido 🔗
En `app/menu/page.tsx` `estimatedEndTime`/`endTime` se **hardcodean a +30 min**
con el comentario "hay que modificar backend".

- [ ] Que el backend calcule/estime los tiempos 🔗 y que el frontend deje de hardcodearlos.

### 6. Facturas (opcional)
- [ ] Página/listado de facturas (la generación ya está implementada).

---

## 🟢 Prioridad baja (limpieza / pulido)

### 7. Detalles menores
- [ ] Badge de chef comentado en `app/menu/page.tsx` — decidir si va o se borra.
- [ ] `PaginatedResponse<T>` (`types/common.types.ts`) es el tipo declarado de todos los
      `findAll`, pero el backend devuelve `{message, data}`: `total`/`page`/`limit`/`totalPages`
      nunca llegan. Como la paginación es client-side, conviene tipar esas respuestas como
      `ApiResponse<T[]>` y evaluar si se elimina.

### 8. Ajustes de tipos (deuda técnica, no bloqueante)
- [ ] `types/plato.types.ts`: `Plato.chef: string` vs `CreatePlatoRequest.chef: Empleado` — revisar.
- [ ] `types/empleado.types.ts`: `shift: string` en vez del enum `EmployeeShift`; considerar discriminated union por rol.
- [ ] `types/cliente.types.ts`: `orderHistory: Pedido[]` es requerido pero normalmente no viene poblado.
- [ ] `pedido.status` se compara con literal `"entregado"` en `clientes/[id]/page.tsx` en vez del enum `PedidoEstado`.

---

## ✅ Contrato con el backend — verificado

Los endpoints nuevos agregados en los services **existen y coinciden** en el backend:

| Endpoint (frontend) | Backend |
|---|---|
| `GET /client/dni/:dni` | ✅ existe |
| `GET /employee/taxId/:taxId` | ✅ existe |
| `GET /supplier/taxId/:taxId` | ✅ existe |
| `GET /table/cod/:cod` | ✅ existe (campo `cod`, no `code`) |
| `GET /order/findAllClientOrders/:clientId` | ✅ existe (el param se llama `:id`; requiere ID numérico) |
| `POST /order/:id/bill/add` | ✅ existe (usado por la generación de facturas) |
