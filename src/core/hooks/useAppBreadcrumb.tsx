import { useMemo } from 'react';
import { useBackToApp } from './useBackToApp';
import type { BreadcrumbItem } from '../components/PageHeader';

/**
 * Hook que genera automáticamente el breadcrumb para páginas de submódulos.
 *
 * Construye: Inicio (→ QuickAccess del app) → ...páginas adicionales
 *
 * "Inicio" apunta siempre al QuickAccess correcto del aplicativo actual:
 *   /home/quick-access?applicationId=X
 *
 * @param extra  Ítems adicionales después de "Inicio"
 *
 * @example
 * // Página de lista
 * const breadcrumb = useAppBreadcrumb(['Empleados']);
 *
 * // Página de detalle con sub-niveles
 * const breadcrumb = useAppBreadcrumb([
 *   { label: 'Empleados', to: '/home/rrhh/employees' },
 *   'Detalle',
 * ]);
 */
export function useAppBreadcrumb(
    extra: BreadcrumbItem[] = [],
): BreadcrumbItem[] {
    const backLink = useBackToApp(); // Ej: '/home/quick-access?applicationId=2'

    return useMemo<BreadcrumbItem[]>(
        () => [
            { label: 'Inicio', to: backLink },
            ...extra,
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [backLink, JSON.stringify(extra)],
    );
}
