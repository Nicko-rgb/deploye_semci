import type {
    DocumentTypeItem,
    EducationLevelItem,
    GradeAcademicItem,
    ProfessionItem,
    CondicionProfesionItem,
    LaboralRegimeItem,
    CondicionLaboralItem,
    EstablishmentItem,
    OficinaDireccionItem
} from './catalog.types';

/**
 * Representa un empleado en la lista (resumen)
 * Endpoint: GET /employees (listEmployees)
 */
export interface EmployeeSummary {
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
    is_rotated?: boolean;
    origin_establishment?: string | null;
    occupationalGroup: string;
    personnelType: string;
    isEnabled: boolean;
    oficinaDireccion?: string; // Nombre de la oficina/dirección
}

/**
 * Representa el detalle completo de un empleado
 * Endpoint: GET /employees/:id (getEmployeeById)
 */
export interface EmployeeDetail {
    employee_id: number;
    firstName: string;
    lastNamePaternal: string;
    lastNameMaternal: string;
    documentTypeId: number;
    documentNumber: string;
    birthDate: string; // Date string from JSON
    gender: string;
    email: string;
    phone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    healthCondition?: string;
    photoUrl?: string;

    // Ubigeo
    idUbigueoReniec: string;
    address?: string;

    // Formación
    educationLevelId: number;
    academicGradeId: number;
    professionId: number;
    professionConditionId: number;
    specialty?: string;
    colegiatura?: string;
    colegiaturaNumber?: string;

    // Laboral
    origin?: string;
    laborRegimeId: number;
    laborConditionId: number;
    functionalPosition?: string;
    levelPosition?: string;
    hireDate: string;
    appointmentDate?: string;
    lowDate?: string;
    airhspPlazaCode?: string;
    oficinaDireccionId: number;
    salary?: number;
    occupationalGroup: string;
    personnelType: string;

    // Establecimiento
    codigoUnico: string; 
    isEstablishmentHead: boolean;
    serviceId?: number;
    isServiceHead: boolean;
    appointmentConsultoryId?: number;
    consultoryNumber?: string;

    // Sistema
    isEnabled: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: number;
    updatedBy?: number;

    // Relaciones pobladas
    establishment?: EstablishmentItem;
    oficinaDireccion?: OficinaDireccionItem;
    profession?: ProfessionItem;
    service?: {
        service_id: number;
        name: string;
        group: string;
    };
    consultorio?: {
        consultorio_id: number;
        name: string;
    };
    documentType?: DocumentTypeItem;
    educationLevel?: EducationLevelItem;
    gradeAcademic?: GradeAcademicItem;
    condicionProfesion?: CondicionProfesionItem;
    laboralRegime?: LaboralRegimeItem;
    condicionLaboral?: CondicionLaboralItem;
    ubigeo?: {
        Id_Ubigueo_Inei: string;
        Id_Ubigueo_Reniec: string;
        Departamento: string;
        Provincia: string;
        Distrito: string;
    };
    rotations?: Rotation[];
}

/**
 * Datos del formulario para crear/editar empleado
 * Los IDs suelen manejarse como strings en los formularios HTML/React
 */
export interface EmployeeFormData {
    firstName: string;
    lastNamePaternal: string;
    lastNameMaternal: string;
    documentTypeId: string | number;
    documentNumber: string;
    birthDate: string;
    gender: string;
    email: string;
    phone: string;
    photoUrl?: string;
    
    emergencyContact?: string;
    emergencyPhone?: string;
    healthCondition?: string;

    // Ubigeo
    idUbigueoReniec: string;
    address: string;
    ubigeo_departamento?: string; // Helpers para UI
    ubigeo_provincia?: string;
    ubigeo_distrito?: string;

    // Formación
    educationLevelId: string | number;
    academicGradeId: string | number;
    professionId: string | number;
    professionConditionId: string | number;
    specialty: string;
    colegiaturaNumber: string;

    // Laboral
    origin: string;
    laborRegimeId: string | number;
    laborConditionId: string | number;
    functionalPosition: string;
    hireDate: string;
    airhspPlazaCode: string;
    oficinaDireccionId: string | number | null;
    occupationalGroup: string;
    personnelType: string;

    // Establecimiento
    codigoUnico: string | number;
    isEstablishmentHead: boolean;

    // Estado
    isEnabled: boolean;
}

// Alias para compatibilidad si es necesario, o usar directamente los nuevos tipos
export type Employee = EmployeeDetail; // Para ViewEmployee y componentes que esperan el objeto completo

/**
 * Representa una rotación de empleado
 */
export interface Rotation {
    rotation_id: number;
    employeeId: number;
    targetLevel: 'RED' | 'MICRORED' | 'ESTABLECIMIENTO';
    targetCodigoRed?: string;
    targetCodigoMicrored?: string;
    targetCodigoUnico?: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    documentRef?: string;
    description?: string;
    targetName?: string;
    originName?: string;
    employee: {
        employee_id: number;
        fullName: string;
        documentNumber: string;
        profession: string;
        laborCondition?: string;
        occupationalGroup?: string;
        personnelType?: string;
        establishment?: {
            codigoUnico: string;
            nombreEstablecimiento: string;
            categoriaEstablecimiento?: string;
            departamento?: string;
            provincia?: string;
            distrito?: string;
        };
    };
    targetEstablishment?: {
        codigoUnico: string;
        nombreEstablecimiento: string;
        categoriaEstablecimiento?: string;
        departamento?: string;
        provincia?: string;
        distrito?: string;
    };
}

export interface CreateRotationDTO {
    employeeId: number;
    targetLevel: 'RED' | 'MICRORED' | 'ESTABLECIMIENTO';
    targetCodigoRed?: string;
    targetCodigoMicrored?: string;
    targetCodigoUnico?: string | null;
    startDate: string;
    endDate?: string | null;
    description?: string;
    documentRef?: string;
}

export interface UpdateRotationDTO extends Partial<CreateRotationDTO> {
    isActive?: boolean;
}
