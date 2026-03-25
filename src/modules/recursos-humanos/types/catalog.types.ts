export interface UbigeoItem {
    id: string;
    name: string;
}

export interface DocumentTypeItem {
    doc_type_id: number;
    abbreviation: string;
    description: string;
}

export interface EducationLevelItem {
    education_level_id: number;
    name: string;
}

export interface GradeAcademicItem {
    grade_academic_id: number;
    name: string;
}

export interface ProfessionItem {
    profession_id: number;
    description: string;
    abbreviation: string;
    colegio_id?: number;
}

export interface CondicionProfesionItem {
    condicion_profesion_id: number;
    name: string;
}

export interface LaboralRegimeItem {
    laboral_regime_id: number;
    name: string;
}

export interface CondicionLaboralItem {
    condicion_laboral_id: number;
    name: string;
    grupo: 'NOMBRADOS' | 'CONTRATADOS' | 'SERUMS' | 'TERCEROS';
}

export interface EstablishmentItem {
    establecimiento_id: number;
    nombreEstablecimiento: string;
    ubigeo: string;
    nombreRed: string;
    nombreMicrored: string,
    descripcionSector: string,
    codigoUnico: string;
    departamento: string;
    provincia: string;
    distrito: string;
    categoriaEstablecimiento: string;
    codigoMicrored: string;
    codigoRed: string;
}

export interface OficinaDireccionItem {
    oficina_direccion_id: number;
    name: string;
    description?: string;
}

export interface UbigeoApiResponse<T> {
    success: boolean;
    data: T[];
}
