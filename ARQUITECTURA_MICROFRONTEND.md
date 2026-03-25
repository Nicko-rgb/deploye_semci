# 🏗️ Arquitectura Microfrontend - SEMCI

## 📁 Estructura del Proyecto

El proyecto ha sido reestructurado siguiendo una arquitectura de **microfrontend** modular, donde cada módulo funciona de manera independiente pero comparte la base común.

```
src/
├── core/                          # 🎯 Base principal (Shell Application)
│   ├── App.tsx                    # Aplicación principal
│   ├── main.tsx                   # Entry point
│   ├── components/                # Componentes compartidos
│   ├── layouts/                   # Layouts compartidos
│   ├── pages/                     # Páginas core (Landing, Login, Dashboard)
│   ├── contexts/                  # Contextos globales
│   ├── hooks/                     # Hooks compartidos
│   ├── config/                    # Configuración global
│   ├── utils/                     # Utilidades compartidas
│   └── services/                  # Servicios base (API, Auth)
│
└── modules/                       # 📦 Módulos independientes
    ├── semci/                     # Sistema de Estadística e Informática
    ├── recursos-humanos/          # Gestión de RRHH
    ├── tramite-documentario/      # Gestión documentaria
    └── registro-usuario/          # Gestión de usuarios
```

## 🎯 Módulos Disponibles

### 1. 📊 SEMCI (Sistema de Estadística e Informática)
**Ubicación:** `src/modules/semci/`

Funcionalidades:
- Epidemiología y seguimiento
- Reportes operacionales, generales y de producción
- Indicadores FED, Gestión y Salud Mental
- Sistema SIS
- Consultas (CNV, HIS, Personal de Salud, etc.)
- Calidad y Repositorio
- Importación y procesamiento de datos

### 2. 👥 Recursos Humanos
**Ubicación:** `src/modules/recursos-humanos/`

Funcionalidades (en construcción):
- Gestión de empleados
- Control de asistencia
- Permisos y licencias
- Planillas
- Evaluaciones de desempeño

### 3. 📄 Trámite Documentario
**Ubicación:** `src/modules/tramite-documentario/`

Funcionalidades (en construcción):
- Recepción de documentos
- Seguimiento de trámites
- Derivación de documentos
- Archivo digital
- Reportes de gestión

### 4. 📝 Registro de Usuario
**Ubicación:** `src/modules/registro-usuario/`

Funcionalidades:
- Gestión de usuarios
- Configuración de perfiles
- Roles y permisos (en construcción)

## 🔧 Estructura de un Módulo

Cada módulo sigue esta estructura estándar:

```
modules/[nombre-modulo]/
├── index.ts              # Entry point del módulo
├── types.ts              # Tipos TypeScript del módulo
├── routes.tsx            # Definición de rutas
├── pages/                # Páginas del módulo
├── components/           # Componentes específicos
├── services/             # Servicios del módulo
└── utils/                # Utilidades específicas
```

## 🚀 Cómo agregar un nuevo módulo

1. **Crear la estructura del módulo:**
```bash
mkdir -p src/modules/nuevo-modulo/{pages,services,components,utils}
```

2. **Crear archivos base:**
   - `index.ts` - Entry point
   - `types.ts` - Configuración y tipos
   - `routes.tsx` - Definición de rutas

3. **Registrar en la configuración:**
Editar `src/core/config/modules.ts` y agregar:
```typescript
{
  id: 'nuevo-modulo',
  name: 'Nuevo Módulo',
  basePath: '/home/nuevo',
  icon: '🎨',
  description: 'Descripción del módulo',
  enabled: true,
  order: 5
}
```

4. **Importar rutas en App.tsx:**
```typescript
const NuevoModuloRoutes = lazy(() => import('./modules/nuevo-modulo/routes'));
```

## 📝 Beneficios de esta arquitectura

✅ **Modularidad:** Cada módulo es independiente
✅ **Escalabilidad:** Fácil agregar nuevos módulos
✅ **Mantenibilidad:** Código organizado y separado
✅ **Performance:** Lazy loading de módulos
✅ **Desarrollo en paralelo:** Equipos pueden trabajar en módulos separados
✅ **Despliegue independiente:** Cada módulo puede desplegarse por separado

## 🔐 Autenticación y Seguridad

- La autenticación se maneja a nivel **core**
- Todos los módulos heredan el contexto de autenticación
- Las rutas protegidas se definen con `ProtectedRoute`

## 🎨 Recursos Compartidos

Los recursos compartidos se encuentran en:
- **Componentes:** `src/core/components/`
- **Hooks:** `src/core/hooks/`
- **Utilidades:** `src/core/utils/`
- **Servicios:** `src/core/services/`

## 📚 Migración de código existente

Todo el código existente del sistema SEMCI ha sido movido al módulo `src/modules/semci/` manteniendo su funcionalidad intacta.

## 🔄 Próximos pasos

1. Desarrollar funcionalidades de Recursos Humanos
2. Implementar Trámite Documentario
3. Expandir gestión de usuarios con roles y permisos
4. Configurar Module Federation (opcional para true microfrontends)
5. Implementar tests por módulo

---

**Última actualización:** Enero 2026
