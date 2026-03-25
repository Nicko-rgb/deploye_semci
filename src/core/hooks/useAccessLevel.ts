import { useMemo } from 'react';
import { useAuth } from './useAuth';

/**
 * Nivel de acceso a datos del usuario.
 *
 * - 'diresa'          → Solo tiene codigoDisa. Ve todas las redes.
 * - 'red'             → Tiene codigoRed. Ve toda la red.
 * - 'microred'        → Tiene codigoRed + codigoMicrored. Ve solo su microred.
 * - 'establecimiento' → Tiene codigoUnico. Ve solo su establecimiento.
 */
export type AccessLevel = 'diresa' | 'red' | 'microred' | 'establecimiento';

/**
 * Filtros de acceso a datos listos para enviar al backend.
 * Los valores `undefined` significan "sin restricción en ese nivel".
 */
export interface AccessFilters {
    codigoDisa?: number;
    codigoRed?: string;
    codigoMicrored?: string;
    codigoUnico?: string;
}

export interface UseAccessLevelResult {
    /** Nivel determinado según los códigos asignados al usuario */
    accessLevel: AccessLevel;
    /** Código DISA del usuario */
    codigoDisa: number | null;
    /** Código de red del usuario (null si es nivel diresa) */
    codigoRed: string | null;
    /** Código de microred del usuario (null si es nivel red o diresa) */
    codigoMicrored: string | null;
    /** Código único del establecimiento (null si es nivel red, microred o diresa) */
    codigoUnico: string | null;
    /**
     * Filtros de acceso listos para pasar al backend.
     * Cada módulo los usa como parámetros de query para restringir datos.
     */
    accessFilters: AccessFilters;
    /** true si el usuario puede ver datos de toda la DIRES */
    isDiresaLevel: boolean;
    /** true si el usuario puede ver datos de toda la red */
    isRedLevel: boolean;
    /** true si el usuario está restringido a una microred */
    isMicroredLevel: boolean;
    /** true si el usuario está restringido a un establecimiento */
    isEstablishmentLevel: boolean;
    /** true si el empleado vinculado al usuario es Jefe de Establecimiento */
    isEstablishmentHead: boolean;
    /** true si el empleado vinculado al usuario es Jefe de Microred */
    isMicroredHead: boolean;
    /** true si el empleado vinculado es Jefe de Profesión (programa turnos de su grupo) */
    isProfessionHead: boolean;
    /** ID de la profesión individual del empleado (para referencias directas) */
    professionId: number | null;
    /** Grupo de profesiones que gestiona (ej: 'ENFERMERIA'). null si no es jefe de profesión. */
    professionGroup: string | null;
    /** Código de la oficina/unidad asignada (ej: 'UNI-RRHH', 'UNI-LOG') */
    officeCode: string | null;
    /** true si el usuario pertenece a la Unidad de Recursos Humanos (UNI-RRHH) */
    isRrhh: boolean;
    /** RRHH a nivel de establecimiento: UNI-RRHH + tiene codigoUnico */
    isRrhhEst: boolean;
    /** RRHH a nivel de red: UNI-RRHH + solo tiene codigoRed (sin microred ni establecimiento) */
    isRrhhRed: boolean;
}

/**
 * Hook que determina el nivel de acceso a datos del usuario autenticado
 * a partir de codigoDisa, codigoRed, codigoMicrored y codigoUnico (vienen del login).
 *
 * Regla de prioridad (de más restrictivo a menos):
 *   codigoUnico presente       → nivel 'establecimiento'
 *   codigoMicrored sin unico   → nivel 'microred'
 *   codigoRed sin microred     → nivel 'red'
 *   solo codigoDisa o ninguno  → nivel 'diresa'
 *
 * @example
 * const { accessLevel, accessFilters, isRedLevel, canNominal } = useAccessLevel();
 */
export function useAccessLevel(): UseAccessLevelResult {
    const { user } = useAuth();

    return useMemo(() => {
        const codigoDisa      = user?.codigoDisa      ?? 34; // Ucayali por defecto
        const codigoRed       = user?.codigoRed       ?? null;
        const codigoMicrored  = user?.codigoMicrored  ?? null;
        const codigoUnico     = user?.codigoUnico     ?? null;

        let accessLevel: AccessLevel;

        if (codigoUnico) {
            accessLevel = 'establecimiento';
        } else if (codigoMicrored) {
            accessLevel = 'microred';
        } else if (codigoRed) {
            accessLevel = 'red';
        } else {
            accessLevel = 'diresa';
        }

        // Construir filtros según nivel — solo se incluyen los campos necesarios
        const accessFilters: AccessFilters = {};
        if (codigoDisa)      accessFilters.codigoDisa     = codigoDisa;
        if (codigoRed)       accessFilters.codigoRed      = codigoRed;
        if (codigoMicrored)  accessFilters.codigoMicrored = codigoMicrored;
        if (codigoUnico)     accessFilters.codigoUnico    = codigoUnico;

        const isProfessionHead = user?.employeeProfile?.isProfessionHead ?? false;
        const professionId     = user?.employeeProfile?.professionId     ?? null;
        const professionGroup  = user?.employeeProfile?.professionGroup  ?? null;
        const officeCode       = user?.employeeProfile?.officeCode        ?? null;
        const isRrhh           = officeCode === 'UNI-RRHH';
        const isRrhhEst        = isRrhh && !!codigoUnico;
        const isRrhhRed        = isRrhh && !codigoMicrored && !codigoUnico;

        return {
            accessLevel,
            codigoDisa,
            codigoRed,
            codigoMicrored,
            codigoUnico,
            accessFilters,
            isDiresaLevel:        accessLevel === 'diresa',
            isRedLevel:           accessLevel === 'red',
            isMicroredLevel:      accessLevel === 'microred',
            isEstablishmentLevel: accessLevel === 'establecimiento',
            isEstablishmentHead:  user?.employeeProfile?.isEstablishmentHead ?? false,
            isMicroredHead:       user?.employeeProfile?.isMicroredHead      ?? false,
            isProfessionHead,
            professionId,
            professionGroup,
            officeCode,
            isRrhh,
            isRrhhEst,
            isRrhhRed,
        };
    }, [user?.codigoDisa, user?.codigoRed, user?.codigoMicrored, user?.codigoUnico, user?.employeeProfile]);
}
