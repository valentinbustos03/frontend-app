# TODO — Frontend (U Kitchen)

Plan de lo que falta para terminar el frontend. Ordenado por prioridad.
Los cambios que dependen del backend están marcados con 🔗. El detalle del
esquema de autenticación está en [`AUTENTICACION.md`](../../AUTENTICACION.md).

Estado general: el CRUD de todos los módulos, las páginas de detalle `[id]/`,
el dashboard y `mis-pedidos` están **completos**. Ojo que nada se puede probar de
punta a punta hasta que exista el módulo `auth/` del backend (punto 1).

El backend avanzó fuerte (`v2.04` → `v2.15`: reservas, promociones, recetas con
cantidad, control de stock, listados filtrados). Lo que se rompía ya está adaptado
(punto 3), y reservas, promociones y los filtros server-side ya están (puntos 4 a 6).
De acá en adelante no queda nada bloqueado por el backend salvo la autenticación.

---

## ✅ Hecho (última tanda)

- **Filtros server-side y stock bajo** (ver el punto 6).
- **Módulo Promociones** (ver el punto 5): CRUD + descuentos visibles en el menú.
- **Módulo Reservas** (ver el punto 4): tipos, schema, service, listado y form.
- **Frontend adaptado a los cambios del backend** (ver el punto 3): recetas con
  cantidad, `unitCost`, errores de negocio del pedido y `PUT` acotado.
- **Respuesta de los services normalizada** (ver el punto 2): todos desenvuelven
  `{message, data}`, lo que arregla las páginas de detalle `[id]/`.
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

### 2. Normalizar la forma de respuesta de los services ✅
Resuelto. No hacía falta acordar nada con el backend: todos los controllers ya
devuelven `{ message, data }`, el frontend no lo seguía de forma uniforme.

Ahora **todos** los métodos de los services desenvuelven `ApiResponse<T>` y devuelven
la entidad (o `T[]` en los `findAll`). Con eso se arregló un bug que estaba tapado:
los `getXById` tipaban la respuesta como la entidad pelada, así que las 6 páginas de
detalle `[id]/` recibían el envoltorio y renderizaban campos `undefined` sin saltar al
estado de error (`{message, data}` es truthy). Los listados no fallaban porque
desenvolvían `.data` a mano en cada página.

- [x] Un solo criterio en los 7 services que faltaban (incluidos `createMesa`/`updateMesa`, que eran
      inconsistentes entre sí, y `plato`/`proveedor`, que devolvían crudo).
- [x] Los consumidores dejaron de hacer `response.data`.
- [x] Se eliminó el unwrap defensivo de `pedidos/[id]`.
- [x] `types/common.types.ts` borrado: `PaginatedResponse<T>` mentía (el backend nunca
      manda `total`/`page`/`limit`/`totalPages`) y quedó sin uso.

### 3. Adaptar el frontend a los cambios del backend ✅
Resuelto. Detalle de cada subpunto:

#### 3.1 Recetas: `Plato.ingredients` cambió de forma ✅
```
respuesta:  ingredients: [{ ingredient: { id, name, ... }, quantity: 200 }]
request:    ingredients: [{ id: "...", quantity: 200 }]
```

- [x] Tipo `PlatoIngrediente` en `types/plato.types.ts` y `quantity` en
      `CreatePlatoRequest.ingredients`.
- [x] `quantity` (entero ≥ 1) en `lib/schemas/plato.schema.ts`.
- [x] `plato-form-modal.tsx`: la sección pasó a llamarse "Receta" y cada ingrediente
      tildado muestra un input de cantidad al lado, con la unidad de medida.
      Al tildar arranca en 1.
- [x] `app/platos/page.tsx` y `app/platos/[id]/page.tsx` leen la forma nueva; el
      detalle muestra una columna "Cantidad".

#### 3.2 `unitCost` es obligatorio en ingredientes ✅
- [x] `unitCost` en el type, el schema y el form (requerido, ≥ 0).
- [x] Columna "Costo unitario" en el listado y stat en el detalle.

#### 3.3 Errores de negocio nuevos ✅
El detalle de estos errores viaja en `data`, no en `error`, así que `lib/api.ts` ahora
lo levanta con `body.error ?? body.data` y lo deja en `ApiError.details`.

- [x] `lib/pedido-errors.ts` traduce los tres casos a un mensaje en castellano:
      stock insuficiente (lista qué falta y cuánto), referencias inexistentes y
      transición de estado inválida. Devuelve `null` si el error es otro, así que el
      llamador conserva su mensaje genérico.
- [x] Usado en `app/menu/page.tsx` (crear pedido) y en el cambio de estado de
      `app/pedidos/page.tsx` y `app/pedidos/[id]/page.tsx`.

#### 3.4 `PUT /order/:id` acotado ✅
- [x] `updatePedidoEstado` manda solo `{ status }` en vez de reconstruir el pedido
      completo, y `updatePedido` ahora recibe `UpdatePedidoRequest`
      (`{ status, description? }`) en vez de `Partial<CreatePedidoRequest>`.

#### 3.5 `Mesa.occupied` la calcula el backend ✅
- [x] Se mantiene el toggle manual (sigue siendo la única forma de marcar ocupada una
      mesa sin reserva, que es el caso del cliente que llega sin reservar) y se aclara
      en la pantalla de mesas que el estado también se recalcula con las reservas
      confirmadas.

---

## 🟡 Prioridad media (features incompletas)

### 4. Módulo Reservas ✅
Implementado contra `/reservation`. `types/reserva.types.ts` estaba inventado
(`fechaHoraInicio`, `duracion`, `notas`, estados `EN_CURSO` / `NO_SHOW`) y se reescribió
contra la entidad real: `{ id, dateTime, numberOfPeople, status, client, table }`, con
`status` en `pendiente | confirmada | cancelada | completada`.

- [x] `types/reserva.types.ts` reescrito. `dateTime` se tipa como `string` porque es el
      ISO que manda el backend, no un `Date`.
- [x] `lib/schemas/reserva.schema.ts` con el par create/update: solo el de create exige
      fecha futura, igual que el backend (así se puede completar una reserva vieja).
- [x] `services/reserva-service.ts`. El `updateReserva` recibe el objeto completo porque
      el PUT del backend no acepta parciales.
- [x] `app/reservas/page.tsx`: listado ordenado por fecha, filtros por estado y por día,
      stats, y acciones de Confirmar / Cancelar / Editar / Eliminar. Los cambios de estado
      rápidos reenvían la reserva completa con el estado nuevo.
- [x] `components/forms/reserva-form-modal.tsx` con selects de cliente y mesa, e input
      `datetime-local` (convierte a/desde ISO para no perder la zona horaria).
- [x] La capacidad de la mesa se valida en el form antes de mandar, con el mensaje sobre
      el campo. El solapamiento de reservas confirmadas no se puede saber en el cliente,
      así que se muestra el `409` que devuelve el backend.
- [x] Item del sidebar habilitado y regla `/reservas` (admin + empleado) en `AuthGuard`.

### 5. Módulo Promociones ✅
CRUD contra `/promotion`, más el descuento reflejado en el menú.

- [x] `types/promocion.types.ts`, `lib/schemas/promocion.schema.ts` y
      `services/promocion-service.ts` (el `getPromociones` acepta `{ current: true }`).
- [x] `app/promociones/page.tsx`: listado con búsqueda por nombre/código, filtro por
      estado (vigente / activa fuera de fecha / inactiva) y stats.
- [x] `components/forms/promocion-form-modal.tsx` con multi-select de platos
      (el backend exige al menos uno) y checkbox de `active`.
- [x] Item en el sidebar (grupo Inventario, al lado de Platos) y regla `/promociones`
      (admin + empleado) en `AuthGuard`, igual que `/platos`.
- [x] `lib/promociones.ts` replica el criterio del backend (mejor descuento vigente por
      plato) y lo usa el menú: el precio con descuento, el precio original tachado y un
      badge `-X%` en cada plato, más el total del carrito ya descontado. Antes el total
      del menú no coincidía con el `subtotal` que facturaba el backend.

**Sobre las fechas**: los inputs son de día entero, así que el form manda `dateFrom` al
inicio del primer día y `dateTo` al final del último (`23:59:59`). Si no, una promo que
termina "el 30" dejaba de aplicar a las 00:00 de ese día. Como contrapartida, editar una
promo cargada con horario intermedio la redondea al día completo.

### 6. Filtros server-side y stock bajo ✅

- [x] **`GET /ingredient/lowStock`**: la página de ingredientes ya no calcula
      `stock <= stockLimit` en el cliente. Al cargar pide el listado completo y el de
      bajo stock en paralelo, y usa el `Set` de IDs que devuelve el backend para el
      filtro, los badges de cada fila y las tarjetas de stock bajo/normal.
- [x] **`GET /order/findAll?status=`**: el filtro de estado de `app/pedidos/page.tsx`
      viaja al backend y recarga al cambiar. Cuando hay un estado filtrado y se cambia
      el estado de un pedido, se lo saca del listado en vez de dejarlo contradiciendo
      al filtro.
- [x] **`GET /employee/findAll?shift=&role=&minCalification=`**: rol y turno pasaron al
      backend, y se agregó un select de calificación mínima. Está etiquetado
      "(solo meseros)" porque `minCalification` es un campo de `Waiter`: filtrar por él
      excluye a los chefs, que nunca lo cumplen.
- [x] También aprovechan el filtro de rol el menú (pide solo meseros) y el form de
      platos (pide solo chefs), en vez de traer todos y filtrar en memoria.
- [x] `PedidoFilters` pasó a `{ status?, date? }` y `EmpleadoFilters` a
      `{ shift?, role?, minCalification? }`: antes declaraban filtros inventados
      (`fechaDesde`, `clienteId`, `mesaId`, `rendimiento`, `search`).

**Lo que quedó client-side, a propósito:**

- El **rango de fechas** de pedidos. El endpoint acepta un solo día exacto
  (`?date=YYYY-MM-DD`), no un rango, y pasar de rango a día suelto era perder
  funcionalidad. Si el backend algún día acepta `dateFrom`/`dateTo`, es un cambio de
  tres líneas.
- La **búsqueda por texto** de empleados: no hay endpoint.
- El **stock bajo del dashboard**. Ya tiene el listado completo en memoria para otras
  tarjetas y el criterio es idéntico al del endpoint, así que pedirlo de nuevo sería
  una request al aire.

### 7. Página Configuración
- [ ] `/settings` — item deshabilitado en el sidebar, sin página.
- [ ] Header "Perfil" y "Configuración" siguen `disabled` en `components/layout/header.tsx` — apuntar a una página o quitarlos.

### 8. Cálculo de tiempos del pedido 🔗
En `app/menu/page.tsx` `estimatedEndTime`/`endTime` se **hardcodean a +30 min**
con el comentario "hay que modificar backend".

- [ ] Que el backend calcule/estime los tiempos 🔗 y que el frontend deje de hardcodearlos.

### 9. Facturas
`GET /order/bill/findAll` ya existe, así que se puede hacer entero sin tocar el backend.

- [ ] Método `getFacturas()` en `services/factura-service.ts` y página de listado.

---

## 🟢 Prioridad baja (limpieza / pulido)

### 10. Detalles menores
- [ ] Badge de chef comentado en `app/menu/page.tsx` — decidir si va o se borra.

### 11. Ajustes de tipos (deuda técnica, no bloqueante)
- [ ] `types/plato.types.ts`: `Plato.chef: string` vs `CreatePlatoRequest.chef: Empleado` — revisar.
- [ ] `types/empleado.types.ts`: `shift: string` en vez del enum `EmployeeShift`; considerar discriminated union por rol.
- [ ] `types/cliente.types.ts`: `orderHistory: Pedido[]` es requerido pero normalmente no viene poblado.
- [ ] `ClienteFilters`, `MesaFilters`, `PlatoFilters`, `ProveedorFilters` e
      `IngredienteFilters` declaran filtros que el backend no acepta (los `findAll` de esos
      módulos no reciben query params). Los services los aceptan y los mandan al aire;
      ninguna página los usa. Borrarlos o implementarlos en el backend.
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
| `GET /order/bill/findAll` | ✅ existe (sin usar todavía — punto 9) |
| `GET /ingredient/lowStock` | ✅ existe (usado por el listado de ingredientes) |
| `GET /promotion/*` | ✅ existe (usado por el módulo de promociones) |
| `GET /reservation/*` | ✅ existe (usado por el módulo de reservas) |
| `POST /auth/login`, `/auth/logout`, `/auth/me` | ❌ **no existe** — punto 1 |
