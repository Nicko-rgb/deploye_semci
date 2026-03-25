import type { Licencia } from './licencia.types';

export interface EmployeeTurno {
    employee_id: number;
    fullName: string;
    documentType?: string;
    documentNumber: string;
    email: string;
    profession?: string;
    professionCondition?: string;
    specialty?: string;
    functionalPosition?: string;
    laborRegime?: string;
    laborCondition?: string;
    establishment?: string;
    occupationalGroup: string;
    personnelType: string;
    isEnabled: boolean;
    service?: string;
    professionGrupo?: string;
    codigoUnico: string;
    isServiceHead?: boolean;
    isProfessionHead?: boolean;
    /** ID de la profesión del empleado — usado para limitar edición al jefe de esa profesión */
    professionId?: number | null;
    servicioId?: number | null;
    originEstablishment?: { codigoUnico: string; nombre: string; categoria: string } | null;
    rotations?: Array<{
        rotation_id: number;
        targetCodigoUnico: string;
        isActive: boolean;
        startDate?: string;
        endDate?: string;
        targetEstablishment?: { codigoUnico: string; nombre: string; categoria: string } | null;
    }>;
    shifts?: Array<{
        day: number;
        shift_type_id: number;
        shiftType: {
            name: string;
            abbreviation: string;
            color: string;
        };
    }>;
    licencias?: Licencia[]; // Licencias del empleado
}

export interface ShiftType {
    shift_type_id: number;
    name: string;
    abbreviation: string;
    color: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    isActive: boolean;
}

export interface ICreateShiftDto {
    employeeId: number;
    codigoUnico: string;
    shiftTypeId: number;
    date: string; // YYYY-MM-DD
    year: number;
    month: number;
    day: number;
    yearMonth: string; // YYYY-MM
}

export interface ShiftResponse {
    success: boolean;
    data: EmployeeTurno[];
    error?: string;
}

export interface ShiftTypesResponse {
    success: boolean;
    data: ShiftType[];
    error?: string;
}

export type ShiftSubmissionStatus =
    | 'BORRADOR'
    | 'ENVIADO'
    | 'APR_RRHH_EST'
    | 'APR_JEFE_EST'
    | 'APR_JEFE_MR'
    | 'APROBADO'
    | 'RECHAZADO';

export type RejectedByLevel = 'RRHH_EST' | 'JEFE_EST' | 'JEFE_MR' | 'RRHH_RED';

export interface ShiftSubmission {
    submissionId: number;
    codigoUnico: string;
    professionId?: number | null;
    /** Grupo de profesión que generó este envío (ej: 'ENFERMERIA') */
    professionGroup?: string | null;
    establishment?: {
        nombreEstablecimiento?: string;
        categoriaEstablecimiento?: string;
        nombre_establecimiento?: string;
        categoria_establecimiento?: string;
    };
    yearMonth: string;
    status: ShiftSubmissionStatus;
    rejectionMessage?: string | null;
    rejectedByLevel?: RejectedByLevel | null;
    submittedAt?: string | null;
    reviewedAt?: string | null;
}

// ─── Submission Package (bandeja agrupada por establecimiento + mes) ──────────

/** Detalle de un grupo de profesión dentro de un paquete mensual */
export interface SubmissionPackageGroup {
    submissionId:     number;
    professionGroup:  string;
    status:           ShiftSubmissionStatus;
    submittedAt?:     string | null;
    rejectionMessage?: string | null;
}

/**
 * Un paquete agrupa TODOS los grupos de profesión de un establecimiento para un mes.
 * Es la unidad que ve y gestiona cada nivel aprobador en la bandeja.
 */
export interface SubmissionPackage {
    codigoUnico:  string;
    codigoDisa:   number | null;
    yearMonth:    string;
    /** Estado consenso — todos los grupos tienen el mismo estado en la bandeja */
    status:       ShiftSubmissionStatus;
    establishment?: {
        nombre_establecimiento:    string;
        categoria_establecimiento: string;
        codigo_microred?:          string;
    };
    /** Grupos de profesión que componen el paquete */
    groups:       SubmissionPackageGroup[];
    submittedAt?: string | null;
    reviewedAt?:  string | null;
    rejectionMessage?: string | null;
    rejectedByLevel?:  string | null;
}
