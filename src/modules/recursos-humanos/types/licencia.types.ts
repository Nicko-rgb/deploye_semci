export interface TipoLicenciaRules {
    max_days?: number;
    min_days?: number;
    min_advance_days?: number;
    is_accumulable?: boolean;
    acumulable_hasta?: number;         // años máximos acumulables (ej: 2 para VACACIONES)
    dias_por_anio?: number;            // días anuales (ej: 30 para VACACIONES)
    requires_citt?: boolean;
    requires_attachment?: boolean;     // legacy/rules field
    dias_dentro_region?: number;
    dias_fuera_region?: number;
    extra_por_complicacion_dias?: number;
}

export interface TipoLicencia {
    tipo_licencia_id: number;
    name: string;
    description?: string;
    rules: TipoLicenciaRules;
    requiresAttachment: boolean;        // campo de la tabla
    isActive: boolean;
}

export interface Licencia {
    licencia_id: number;
    employeeId: number;
    tipoLicenciaId: number;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason?: string;
    attachmentUrl?: string;
    responseComments?: string;
    status: 'BORRADOR' | 'EMITIDO_JEFE' | 'APROBADO_MICRORED' | 'RECHAZADO_MICRORED' | 'OBSERVADO_MICRORED' | 'APROBADO_RRHH' | 'RECHAZADO_RRHH' | 'OBSERVADO';
    codigoUnico?: string;
    createdBy: number;
    createdAt: string;
    tipo?: TipoLicencia;
    employee?: {
        employee_id: number;
        firstName: string;
        lastNamePaternal: string;
        lastNameMaternal: string;
        documentNumber: string;
        fullName?: string;
        profession?: { description: string };
        establishment?: {
            nombreEstablecimiento: string;
        };
        rotations?: Array<{
            isActive: boolean;
            targetEstablishment?: {
                nombreEstablecimiento: string;
            };
        }>;
    };
}

export interface VacationBalance {
    total_entitled: number;      // días devengados totales según años trabajados
    used_days: number;           // días ya usados en licencias APROBADAS
    remaining_days: number;      // saldo disponible
    acumulable_hasta: number;    // años máximos de acumulación
    dias_por_anio: number;       // días por año trabajado
}
