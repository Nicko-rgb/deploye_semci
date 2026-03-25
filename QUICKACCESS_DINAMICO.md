# QuickAccess Dinámico - Documentación

## Resumen de Cambios

Se ha implementado un sistema dinámico de accesos rápidos que se adapta al módulo de aplicación seleccionado desde la página Home.

## Arquitectura

### 1. Página Home (`src/core/pages/Home.tsx`)
- Muestra 4 módulos principales como cards:
  - **SEMCI**: Sistema de Estadística y Monitoreo de Control de Indicadores
  - **Recursos Humanos**: Gestión integral de personal
  - **Registro de Usuario**: Administración de usuarios, roles y permisos
  - **Trámite Documentario**: Sistema de gestión de documentos

- Cada módulo navega a `/home/quick-access?module=<moduleId>` con su identificador único

### 2. Página QuickAccess (`src/core/pages/QuickAccess.tsx`)

#### Cambios Principales:
1. **Parámetros de URL**: Ahora lee el parámetro `module` de la URL usando `useSearchParams()`
2. **Datos Mokeados por Módulo**: Contiene datos específicos para cada módulo
3. **Renderizado Dinámico**: Muestra el título, descripción y accesos rápidos según el módulo seleccionado
4. **Botón de Regreso**: Permite volver a la selección de módulos

#### Estructura de Datos:

```typescript
interface QuickAccessItem {
  id: string;
  label: string;
  route: string;
  icon: React.ReactElement;
  section: string;
  description: string;
  color: string;
  badge?: string;
}

interface ModuleQuickAccess {
  moduleId: string;
  moduleName: string;
  moduleDescription: string;
  sections: { section: string; items: QuickAccessItem[] }[];
}
```

## Datos Mokeados por Módulo

### SEMCI
- **Secciones**: CONSULTAS, INDICADORES, REPORTES, EPIDEMIOLOGÍA
- **Items**:
  - Consultas: HIS DIGITAL, PADRÓN NOMINAL, CNV
  - Indicadores: INDICADORES FED, INDICADORES GESTIÓN
  - Reportes: REPORTES OPERACIONALES, REPORTES GENERALES
  - Epidemiología: VIGILANCIA EPIDEMIOLÓGICA

### Recursos Humanos
- **Secciones**: PERSONAL, NÓMINA
- **Items**:
  - Personal: GESTIÓN DE EMPLEADOS, CONTROL DE ASISTENCIA
  - Nómina: PLANILLAS

### Registro de Usuario
- **Secciones**: USUARIOS, CONFIGURACIÓN
- **Items**:
  - Usuarios: GESTIÓN DE USUARIOS, ROLES Y PERMISOS
  - Configuración: CONFIGURACIÓN GENERAL

### Trámite Documentario
- **Secciones**: DOCUMENTOS
- **Items**:
  - Documentos: RECEPCIÓN DE DOCUMENTOS, SEGUIMIENTO DE TRÁMITES, ARCHIVO DIGITAL

## Flujo de Navegación

```
Login → Home (Selector de Módulos) → QuickAccess (Accesos Rápidos Específicos) → Funcionalidad
```

### Ejemplo de URLs:
- `/home` - Selector de módulos
- `/home/quick-access?module=semci` - Accesos rápidos de SEMCI
- `/home/quick-access?module=recursos-humanos` - Accesos rápidos de RRHH
- `/home/quick-access?module=registro-usuario` - Accesos rápidos de Registro
- `/home/quick-access?module=tramite-documentario` - Accesos rápidos de Trámite

## Características Implementadas

### 1. Header Dinámico
- Muestra el nombre del módulo seleccionado
- Muestra la descripción específica del módulo
- Icono personalizado por módulo

### 2. Búsqueda de Funcionalidades
- Campo de búsqueda que filtra items por nombre o descripción
- Búsqueda en tiempo real
- Funciona en todos los módulos

### 3. Secciones Organizadas
- Los accesos rápidos están agrupados por secciones
- Cada sección muestra su icono y el número de items
- Grid responsive de cards

### 4. Cards de Accesos Rápidos
- Diseño con gradiente de color
- Hover effects con animaciones
- Badges opcionales (Nuevo, Popular)
- Descripción del item
- Icono SVG personalizado

### 5. Navegación
- Botón "Volver a selección de módulos" 
- Navegación fluida entre Home y QuickAccess
- Preservación del parámetro de módulo en la URL

## Próximos Pasos (Integración con API)

### 1. Endpoint para Accesos Rápidos
```typescript
GET /api/modules/:moduleId/quick-access
Response: {
  moduleId: string;
  moduleName: string;
  moduleDescription: string;
  sections: Section[];
}
```

### 2. Permisos y Roles
- Los accesos rápidos deben filtrarse según los permisos del usuario
- El endpoint debe devolver solo los items autorizados para el rol del usuario

### 3. Personalización
- Permitir al usuario personalizar qué accesos rápidos desea ver
- Guardar preferencias en la base de datos

### 4. Estadísticas
- Tracking de los accesos más utilizados
- Badge "Popular" basado en estadísticas reales

## Código de Ejemplo

### Navegación desde Home:
```typescript
// En Home.tsx
const modules = [
  {
    id: 'semci',
    name: 'SEMCI',
    route: '/home/quick-access?module=semci', // Parámetro de módulo
    // ... otros campos
  }
];
```

### Lectura del Parámetro en QuickAccess:
```typescript
// En QuickAccess.tsx
const [searchParams] = useSearchParams();
const moduleId = searchParams.get('module') || 'semci'; // Default a SEMCI

const currentModule = moduleQuickAccessData[moduleId] || moduleQuickAccessData.semci;
```

### Renderizado del Título:
```tsx
<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
  {currentModule.moduleName}
</h1>
<p className="text-gray-600 dark:text-gray-300">
  {currentModule.moduleDescription}
</p>
```

## Beneficios

1. **Experiencia de Usuario Mejorada**: Cada módulo tiene su propia interfaz de accesos rápidos personalizada
2. **Escalabilidad**: Fácil agregar nuevos módulos y accesos rápidos
3. **Mantenibilidad**: Código organizado y separación de responsabilidades
4. **Preparado para API**: Estructura lista para integración con backend
5. **Flexibilidad**: Los datos mokeados facilitan el desarrollo y testing sin depender del backend

## Notas de Implementación

- Todos los datos actuales son mokeados
- La integración con la API requerirá modificar la lógica de carga de datos en `useEffect`
- Los iconos SVG se pueden reemplazar con iconos de librerías o desde la base de datos
- El módulo por defecto es SEMCI si no se especifica el parámetro

## Compatibilidad

- ✅ React 19
- ✅ React Router v7
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Dark Mode
- ✅ Responsive Design
