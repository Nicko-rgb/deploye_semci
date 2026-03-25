import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { Permission } from '../utils/interfaces';

/**
 * Resultado del hook: conjunto de permisos del submódulo.
 */
export interface SubmodulePermissions {
    /** Lista completa de permisos que entregó el backend para este submódulo */
    permissions: Permission[];
    // ── CRUD básico ──────────────────────────────────────────────────────────
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    // ── Exportación / Importación ─────────────────────────────────────────
    canExport: boolean;
    canImport: boolean;
    // ── Aprobación ────────────────────────────────────────────────────────
    canApprove: boolean;
    canReject: boolean;
    // ── Especiales ────────────────────────────────────────────────────────
    canPrint: boolean;
    canSend: boolean;
    canDownload: boolean;
    /** Acceso a datos nominales (DNI, nombre completo, datos sensibles) */
    canNominal: boolean;
    /**
     * Verifica si existe un permiso cuyo `name` coincida exactamente
     * (case-insensitive) con el valor suministrado.
     * Útil para permisos no contemplados en los booleans anteriores.
     */
    /** Verifica si existe un permiso cuyo `action` coincida (case-insensitive) */
    hasPermission: (action: string) => boolean;
    /** true cuando el submódulo NO fue encontrado o no tiene permisos asignados */
    isEmpty: boolean;
}

/**
 * Opciones de búsqueda del submódulo.
 * Se puede buscar por nombre, ruta o applicationCode + moduleId.
 */
export interface UseSubmodulePermissionsOptions {
    /**
     * Nombre del submódulo tal como viene del backend (ej: "GESTIÓN DE EMPLEADOS").
     * La comparación es case-insensitive y tolera espacios extra.
     */
    submoduleName?: string;
    /**
     * Ruta del submódulo (ej: "/home/rrhh/employees").
     * Se usa como criterio alternativo si no se proporciona `submoduleName`.
     */
    submoduleRoute?: string;
    /**
     * Código de la aplicación (ej: "RRHH").
     * Si se omite, busca en TODAS las aplicaciones del usuario.
     */
    applicationCode?: string;
}

/**
 * Hook que extrae los permisos de un submódulo directamente del objeto
 * `user` que entrega el backend, sin necesidad de validaciones de perfil
 * (isRedHead, office.code, etc.).
 *
 * @example
 * const { canCreate, canUpdate, hasPermission } = useSubmodulePermissions({
 *   submoduleName: 'GESTIÓN DE EMPLEADOS',
 *   applicationCode: 'RRHH',
 * });
 *
 * // Ocultar botón según permiso
 * {canCreate && <button>Nuevo Empleado</button>}
 * {hasPermission('export') && <button>Exportar</button>}
 */
export function useSubmodulePermissions(
    options: UseSubmodulePermissionsOptions,
): SubmodulePermissions {
    const { user } = useAuth();

    const permissions = useMemo<Permission[]>(() => {
        if (!user?.applications?.length) return [];

        const { submoduleName, submoduleRoute, applicationCode } = options;

        // Filtra las aplicaciones según el código (opcional)
        const apps = applicationCode
            ? user.applications.filter(
                (a) => a.code?.toLowerCase() === applicationCode.toLowerCase(),
            )
            : user.applications;

        for (const app of apps) {
            if (!Array.isArray(app.modules)) continue;

            for (const mod of app.modules) {
                const submodules = Array.isArray(mod.submodules) ? mod.submodules : [];

                for (const sub of submodules) {
                    const matchName =
                        submoduleName &&
                        sub.name.trim().toLowerCase() ===
                        submoduleName.trim().toLowerCase();

                    const matchRoute =
                        submoduleRoute &&
                        sub.route?.trim().toLowerCase() ===
                        submoduleRoute.trim().toLowerCase();

                    if (matchName || matchRoute) {
                        return Array.isArray(sub.permissions) ? sub.permissions : [];
                    }
                }
            }
        }

        return [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, options.submoduleName, options.submoduleRoute, options.applicationCode]);

    const hasPermission = (action: string): boolean =>
        permissions.some(
            (p) => p.action?.trim().toLowerCase() === action.trim().toLowerCase(),
        );

    return {
        permissions,
        // CRUD básico
        canRead:     hasPermission('read'),
        canCreate:   hasPermission('create'),
        canUpdate:   hasPermission('update'),
        canDelete:   hasPermission('delete'),
        // Exportación / Importación
        canExport:   hasPermission('export'),
        canImport:   hasPermission('import'),
        // Aprobación
        canApprove:  hasPermission('approve'),
        canReject:   hasPermission('reject'),
        // Especiales
        canPrint:    hasPermission('print'),
        canSend:     hasPermission('send'),
        canDownload: hasPermission('download'),
        canNominal:  hasPermission('nominal'),
        hasPermission,
        isEmpty: permissions.length === 0,
    };
}
