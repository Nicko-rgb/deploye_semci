# RRHH — Módulo de Recursos Humanos (Frontend)

> Documentación de componentes, hooks, flujos de UI, permisos y consideraciones del módulo RRHH en el cliente.

---

## Índice

1. [Estructura del Módulo](#1-estructura-del-módulo)
2. [Sistema de Permisos](#2-sistema-de-permisos)
3. [Componente RedLevelAccess](#3-componente-redlevelaccess)
4. [Submodulo: Gestión de Empleados](#4-submodulo-gestión-de-empleados)
5. [Submodulo: Turnos](#5-submodulo-turnos)
6. [Submodulo: Licencias](#6-submodulo-licencias)
7. [Submodulo: Rotaciones](#7-submodulo-rotaciones)
8. [Submodulo: Asistencia](#8-submodulo-asistencia)
9. [Servicios Compartidos](#9-servicios-compartidos)
10. [Consideraciones Generales](#10-consideraciones-generales)

---

## 1. Estructura del Módulo

```
recursos-humanos/
├── components/         ← Componentes reutilizables del módulo
│   ├── FormComponents.tsx       ← Select, InputText, etc.
│   └── EmployeeEditModals.tsx   ← Modales de edición de empleado
├── hooks/              ← Toda la lógica de estado y efectos
│   ├── useEmployees.ts          ← Lista y detalle de empleados
│   ├── useNewEmployee.ts        ← Formulario nuevo/editar empleado
│   ├── useTurnos.ts             ← Calendario de turnos
│   ├── useLicencias.ts          ← Gestión de licencias
│   └── useRotation.ts           ← Gestión de rotaciones
├── pages/              ← Componentes de página (solo presentación)
│   ├── Employees.tsx            ← Lista con filtros
│   ├── ViewEmployee.tsx         ← Detalle de empleado
│   ├── NewEmployee.tsx          ← Formulario de creación
│   ├── Turnos.tsx               ← Calendario de turnos
│   ├── Licencias.tsx            ← Bandeja de licencias
│   └── Rotacion.tsx             ← Lista de rotaciones
├── services/           ← Llamadas HTTP
│   ├── employeeService.ts
│   ├── commonService.ts         ← Catálogos
│   └── turnosService.ts
└── types/              ← Interfaces TypeScript
    ├── employee.types.ts
    └── catalog.types.ts
```

**Principio de separación:** Las páginas son únicamente presentación (JSX). Toda la lógica, estado, y efectos viven en los hooks. Las páginas importan el hook correspondiente y solo acceden a los valores y funciones que expone.

---

## 2. Sistema de Permisos

### Hook: `useSubmodulePermissions`

```typescript
const { canRead, canCreate, canUpdate, canDelete, canExport, canSend } =
    useSubmodulePermissions({
        submoduleName: 'GESTIÓN DE EMPLEADOS',
        applicationCode: 'RRHH',
    });
```

Los permisos se basan en el campo `action` del objeto de permiso que devuelve el backend tras el login:

```json
{
  "permissionId": 1,
  "name": "Leer",
  "action": "read"    ← se usa action, no name
}
```

| `action` | Hook boolean | Uso típico |
|---|---|---|
| `read` | `canRead` | Ver listados, detalle |
| `create` | `canCreate` | Botón "Nuevo Empleado" |
| `update` | `canUpdate` | Editar campos |
| `delete` | `canDelete` | Eliminar registros |
| `export` | `canExport` | Botón "Exportar Excel" |
| `send` | `canSend` | Botón "Enviar a RRHH" en turnos |

**Regla:** Los botones de acción solo se renderizan si el permiso correspondiente está activo. No se deshabilitan visualmente, directamente no aparecen en el DOM.

### Hook: `useAccessLevel`

Determina el nivel de acceso del usuario en sesión para controlar qué ve en la jerarquía:

```typescript
const { codigoDisa, codigoRed, codigoMicrored, codigoUnico, accessLevel } = useAccessLevel();
```

| `accessLevel` | Condición | Comportamiento en UI |
|---|---|---|
| `'diresa'` | Solo `codigoDisa` | Ve todas las redes |
| `'red'` | Tiene `codigoRed`, sin micro | Ve toda la red, filtros libres |
| `'microred'` | Tiene `codigoMicrored` | Ve solo su microred |
| `'establecimiento'` | Tiene `codigoUnico` | Ve solo su establecimiento |

---

## 3. Componente RedLevelAccess

Componente de filtros de jerarquía reutilizado en casi todos los submódulos:

```tsx
<RedLevelAccess onChange={handleHierarchyChange} className="mb-1" />
```

Renderiza selectores de RED → MICRORED → ESTABLECIMIENTO en cascada. Al cambiar de nivel, resetea los niveles inferiores automáticamente.

**Valores especiales:**
- `'TODOS'` — sin filtro en ese nivel
- `'SOLO RED'` — empleados de sede de red (sin microred)
- `'SOLO MICRORED'` — empleados de sede de microred (sin establecimiento)

---

## 4. Submodulo: Gestión de Empleados

**Hook:** `useEmployees.ts`
**Páginas:** `Employees.tsx`, `ViewEmployee.tsx`, `NewEmployee.tsx`

### Estado del hook

```typescript
// Lista
employees: EmployeeSummary[]
loading: boolean
searchTerm: string
filters: {
    grupoCondicion: string,  // Grupo de condición laboral
    laborRegimeId: string,   // ID de régimen laboral
    occupationalGroup: string,
    status: 'activo' | 'cesado' | '',
    codigoDisa, codigoRed, nomRed,
    codigoMicrored, nomMicrored,
    codigoUnico
}
pagination: { page, limit, total, totalPages }

// Detalle
empleado: EmployeeDetail | null
establishments: EstablishmentItem[]
loadingDetail: boolean
```

### Flujo de filtros

```
Usuario cambia Select o RedLevelAccess
    → setFilters actualiza el estado
        → useEffect detecta cambio en filters
            → fetchEmployees() construye query params
                → GET /rrhh/employees?...
                    → setEmployees + setPagination
```

**Importante:** Al cambiar `codigoMicrored`, el filtro `codigoUnico` se resetea automáticamente a `'TODOS'` para mantener consistencia jerárquica.

### Opciones de filtros

- `laborConditionOptions` — grupos únicos de condición laboral (NOMBRADOS, CONTRATADOS, SERUMS, TERCEROS), deduplicados del catálogo
- `laborRegimeOptions` — todos los regímenes laborales del catálogo
- `occupationalGroupOptions` — fijos: PROFESIONAL, TÉCNICO, AUXILIAR
- `statusOptions` — fijos: ACTIVO, CESADO

### Carga inicial

```typescript
useEffect(() => {
    Promise.all([
        hierarchyService.getHierarchy(codigoRed ?? '01'),  // Carga jerarquía de la red
        commonService.getConditionLaboral(),                 // Carga condiciones laborales
        commonService.getLaboralRegimes()                    // Carga regímenes
    ]);
}, []);
```

### Exportación de empleados

La exportación envía **los mismos filtros activos** que el listado, incluyendo jerarquía, grupo de condición, régimen laboral, grupo ocupacional y estado. Descarga un `.xlsx` con los resultados.

### Formulario de nuevo/editar empleado (`useNewEmployee.ts`)

**Secciones del formulario:**

| Sección | Campos principales |
|---|---|
| Datos personales | nombre, apellidos, DNI, tipo documento, género, email, teléfono |
| Urgencias | contacto emergencia, teléfono emergencia, condición salud |
| Ubigeo | departamento → provincia → distrito → `idUbigueoReniec` (6 dígitos), dirección |
| Académico | nivel educativo, grado académico, profesión, condición profesional, especialidad, colegiatura |
| Laboral | origen, régimen, condición, cargo, fecha ingreso, plaza AIRHSP, oficina |
| Ocupacional | grupo ocupacional, tipo personal |
| Establecimiento | código único, es jefe de establecimiento |
| Estado | activo/cesado |

**Lógica especial del Ubigeo:**
Los selectores de departamento → provincia → distrito son en cascada. Al seleccionar un distrito, se asigna automáticamente el código RENIEC de 6 dígitos al campo `idUbigueoReniec` del empleado.

---

## 5. Submodulo: Turnos

**Hook:** `useTurnos.ts`
**Página:** `Turnos.tsx`

### Estado del hook

```typescript
// Contexto
selectedEstId: string           // Establecimiento seleccionado
selectedMonth: number           // 1-12
selectedYear: number

// Datos
employees: EmployeeTurno[]      // Empleados con sus turnos anidados
pendingChanges: Record<string, ICreateShiftDto>  // Cambios no guardados ("empId-day")
submission: ShiftSubmission | null  // Estado del envío del mes

// UI
groupBy: 'service' | 'profession' | 'condicionLaboral'
tipoPersonal: 'ASISTENCIAL' | ''  // Filtro de tipo de personal
canWorkSundays: boolean           // Según categoría del establecimiento
```

### Calendario de turnos

El calendario muestra una grilla de empleados × días del mes. Para cada celda:

1. Puede mostrar el turno actual (abreviatura + color)
2. Permite cambiar a otro tipo de turno
3. Valida localmente antes de enviar al backend

**Días de la semana:** Se muestra abreviatura (`D`, `L`, `M`, `M`, `J`, `V`, `S`) para identificar domingos visualmente.

### Validaciones locales en `handleShiftChange`

Antes de agregar a `pendingChanges`:

1. ¿Está el mes bloqueado? (`isSubmissionLocked`) → rechazar
2. ¿Es domingo y el establecimiento no permite trabajo dominical? → rechazar
3. ¿El tipo de turno está permitido para la categoría del establecimiento? → rechazar
4. ¿El turno requiere NOMBRADO y el empleado no lo es? → rechazar
5. ¿El turno del día anterior viola reglas de secuencia? → rechazar
6. ¿El empleado es ASISTENCIAL y supera 150h/mes? → rechazar

Si pasa todas las validaciones, el cambio se guarda en `pendingChanges` (no persistido todavía).

### Guardado y envío

```
Usuario edita turno    → pendingChanges
Usuario hace clic "Guardar" → bulkCreateShifts(pendingChanges) → pendingChanges = {}
Usuario hace clic "Enviar a RRHH" → createSubmission(ENVIADO) → isSubmissionLocked = true
```

### Bloqueo del mes

Un mes está bloqueado si `submission.status === 'ENVIADO' || 'APROBADO'`. En ese estado:
- Los turnos son de solo lectura
- El botón "Guardar" no aparece
- El botón "Enviar" no aparece (ya se envió)
- Si el estado es `RECHAZADO`, se desbloquea para corrección

### Agrupación de empleados

Los empleados en la grilla se pueden agrupar por:
- **Servicio médico** (`groupBy: 'service'`)
- **Profesión** (`groupBy: 'profession'`)
- **Condición laboral** (`groupBy: 'condicionLaboral'`)

### Bandeja RRHH

Los usuarios con nivel RED ven la bandeja de envíos de todos los establecimientos. Desde allí pueden:
- `handleApproveMonth(submissionId)` → estado APROBADO
- `handleRejectMonth(submissionId, motivo)` → estado RECHAZADO + mensaje de rechazo

### Indicador de rotación

En la grilla, los empleados rotados muestran un indicador visual. Los turnos de las fechas en rotación se asocian al establecimiento destino, no al origen.

---

## 6. Submodulo: Licencias

**Hook:** `useLicencias.ts`
**Página:** `Licencias.tsx`

### Flujo de creación en dos pasos

```
Paso 1: BÚSQUEDA
    → Buscar empleado por nombre o DNI
    → Al seleccionar, carga:
        - historial de licencias del empleado
        - saldo de vacaciones disponible (si aplica)

Paso 2: FORMULARIO
    → Seleccionar tipo de licencia
    → Ingresar fechas (totalDays se calcula automático)
    → Ingresar motivo
    → Adjuntar archivo (si el tipo lo requiere)
    → Validar localmente → enviar
```

### Validaciones locales en `validateLicenciaForm`

```
✓ Empleado seleccionado
✓ Tipo de licencia seleccionado
✓ Fechas válidas (startDate <= endDate)
✓ totalDays > 0
✓ Si max_days y no acumulable: totalDays <= max_days
✓ Si min_days: totalDays >= min_days
✓ Si min_advance_days: startDate >= hoy + min_advance_days
✓ Si VACACIONES: totalDays <= saldo disponible
✓ Detección de solapamiento: El historial del empleado no tiene licencias
  con estado EMITIDO_JEFE o APROBADO_RRHH en el mismo rango
```

### Información de saldo de vacaciones

Se carga al seleccionar el empleado si el tipo seleccionado es VACACIONES:

```typescript
vacationBalance: {
    total_entitled: number,  // Días devengados totales
    used_days: number,       // Días ya usados (APROBADO_RRHH)
    remaining_days: number,  // Disponibles
    acumulable_hasta: number,
    dias_por_anio: number
}
```

### Bandeja por estado

El listado de licencias se puede filtrar por estado, permitiendo flujos de trabajo:

- Jefe establecimiento → ve sus emitidas (`EMITIDO_JEFE`)
- Jefe microred → ve las pendientes de su nivel (`EMITIDO_JEFE`)
- RRHH → ve las aprobadas por microred (`APROBADO_MICRORED`) y observadas (`OBSERVADO`)

Los contadores por estado se muestran como badges en la UI:

```typescript
stats: {
    total, EMITIDO_JEFE, APROBADO_MICRORED, RECHAZADO_MICRORED,
    OBSERVADO_MICRORED, APROBADO_RRHH, RECHAZADO_RRHH, OBSERVADO
}
```

---

## 7. Submodulo: Rotaciones

**Hook:** `useRotation.ts`
**Página:** `Rotacion.tsx`

### Estado del hook

```typescript
rotations: Rotation[]
history: Rotation[]           // Historial de un empleado específico
selectedRotationId?: number   // Para modal de edición
filters: { isActive?: boolean }
selectedHierarchy: HierarchySelection
pagination: { page, limit, total, totalPages }
```

### Estados de visualización

```
isActive=false                         → "Finalizado" (gris)
isActive=true y sin endDate            → "Activo" (verde)
isActive=true y endDate < hoy          → "Activo - Vencido" (naranja)
```

El sistema no finaliza rotaciones automáticamente, pero las marca visualmente como vencidas cuando su `endDate` ya pasó.

### Acciones disponibles

| Acción | Función | Descripción |
|---|---|---|
| Nueva rotación | `handleNewRotation()` | Abre modal de creación |
| Editar | `handleEditRotation(id)` | Abre modal con datos precargados |
| Finalizar | `handleEndRotation(id)` | Sets `isActive=false`, `endDate=hoy` |
| Descargar PDF | `handleDownloadDoc(id)` | Descarga resolución en PDF |
| Ver historial | `handleViewHistory(empId)` | Navega al historial del empleado |

---

## 8. Submodulo: Asistencia

**Página:** `Asistencia.tsx`

Registro diario de asistencia. Permite:
- Registrar check-in y check-out
- Ver reporte de asistencia por empleado y rango de fechas
- Ver estadísticas: total días, presentes, tardanzas, ausencias, horas trabajadas

---

## 9. Servicios Compartidos

### `commonService.ts`

Carga catálogos usados en formularios:

```typescript
getLaboralRegimes()      → /catalogs/laboral-regimes
getConditionLaboral()    → /catalogs/laboral-conditions   (incluye campo grupo)
getDocumentTypes()       → /catalogs/document-types
getEducationLevels()     → /catalogs/education-levels
getGradeAcademics()      → /catalogs/grade-academics
getProfessions()         → /catalogs/professions
getCondicionesProfesion() → /catalogs/professions/conditions
getOficinasDirecciones() → /catalogs/oficinas-direcciones
getLaboralRegimes()      → /catalogs/laboral-regimes
getUbigeo*(...)          → /catalogs/ubigeos/...
```

### `hierarchyService.ts`

```typescript
getHierarchy(codigoRed)   // Devuelve microredes con sus establecimientos anidados
getMicrorredesByRed(codigoRed)
getEstablecimientosByRed(codigoRed)
```

**Importante:** `getHierarchy()` recibe `codigoRed` dinámico desde el usuario en sesión. Nunca está hardcodeado.

---

## 10. Consideraciones Generales

### Debug temporal

`Employees.tsx` tiene un bloque de debug al final de la página que muestra el objeto `user` del contexto. **Debe eliminarse antes de producción.**

```tsx
// LÍNEAS 283-292 de Employees.tsx — ELIMINAR EN PRODUCCIÓN
<div style={{ marginTop: 16 }}>
    <h3>Usuario</h3>
    ...
</div>
```

### Carga en paralelo

Los hooks cargan datos independientes en paralelo con `Promise.all()` para minimizar el tiempo de carga inicial. No hacer llamadas secuenciales si los datos no dependen entre sí.

### Manejo de filtros vacíos

Los filtros con valor vacío (`''`) o `undefined` se convierten a `undefined` antes de enviarse al backend para que no aparezcan en el query string. El backend interpreta ausencia del parámetro como "sin filtro".

### Persistencia de cambios no guardados (Turnos)

Los cambios en la grilla de turnos viven en `pendingChanges` (memoria). Si el usuario navega a otra página sin guardar, los cambios se pierden. No hay advertencia de "cambios sin guardar" implementada actualmente.

### Sincronización de nombres y códigos (Jerarquía)

El backend puede filtrar por código (exacto) o por nombre (iLike). El frontend mantiene sincronizados ambos en el estado de filtros:

```
codigoMicrored  ← usado para filtro exacto por código
nomMicrored     ← usado como respaldo si el código no está disponible
```

Al cambiar la microred, se actualizan ambos campos simultáneamente.

### Tipos de catálogo en el frontend

Los tipos de catálogo están definidos en `types/catalog.types.ts`. Si el backend agrega un campo nuevo a un catálogo (como `grupo` en `CondicionLaboral`), hay que actualizar también la interfaz del frontend.

```typescript
// catalog.types.ts
export interface CondicionLaboralItem {
    condicion_laboral_id: number;
    name: string;
    grupo: 'NOMBRADOS' | 'CONTRATADOS' | 'SERUMS' | 'TERCEROS';
}
```