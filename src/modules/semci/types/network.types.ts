
export interface EmployeeStat {
    profession: string;
    profession_grupo: string;   // Campo "grupo" del modelo Profession (ej: MEDICO, ENFERMERA(O), OBSTETRA...)
    regime: string;
    labor_condition?: string;
    occupational_group: string;
    personnel_type: string;
    count: number;
}

export interface EstablishmentDetail {
    codigo_unico: string;
    nombre_establecimiento: string;
    categoria_establecimiento: string;
    distrito: string;
    employee_count: number;
    stats: EmployeeStat[];
}

export interface MicroredDetail {
    codigo_microred: string;
    nom_microred: string;
    establecimientos: EstablishmentDetail[];
    total_employees: number;
}

export interface NetworkHierarchy {
    codigo_red: string;
    nom_red: string;
    microredes: MicroredDetail[];
    total_employees: number;
    summary_counts?: {
        red_base: {
            count: number;
            regime_stats: Array<{ regime: string, count: number }>;
        };
        microredes: Array<{
            codigo_microred: string;
            nom_microred: string;
            count: number;
            regime_stats: Array<{ regime: string, count: number }>;
        }>;
    };
}

export interface EmployeeListDTO {
    employee_id: string;
    document_number: string;
    full_name: string;
    profession: string;
    regime: string;
    labor_condition: string;
    establishment: string;
    establishment_code: string;
    occupational_group: string;
    personnel_type: string;
    origin_establishment?: string;
    is_rotated: boolean;
    // New fields from RRHH API
    documentNumber?: string;
    fullName?: string;
    laborRegime?: string;
    laborCondition?: string;
    occupationalGroup?: string;
}
