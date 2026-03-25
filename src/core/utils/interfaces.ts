// Interfaces para la estructura de datos de la API
export interface Permission {
  permissionId: number;
  name: string;
  description: string;
  action: string;
}

export interface Submodule {
  submoduleId: number;
  name: string;
  description: string;
  icon: string;
  orderIndex: number;
  permissions?: Permission[];
  route?: string;
  color?: string;
}

export interface Module {
  moduleId: number;
  name: string;
  description: string;
  icon: string;
  orderIndex: number;
  route?: string;
  submodules?: Submodule[];
  permissions?: Permission[];
  color?: string;
}

export interface Application {
  applicationId: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  modules: Module[];
}

export interface User {
  userId: number;
  email: string;
  username: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  fullName: string;
  phone: string;
  documentType?: string | null;
  documentNumber?: string | null;
  gender?: string | null;
  profileImage: string | null;
  isActive: boolean;
  emailVerified: boolean;
  role?: string;
  diresa?: string | null;
  /** DISA a la que pertenece el usuario (por defecto 34 - Ucayali) */
  codigoDisa?: number | null;
  /** Nivel de acceso a datos: red (solo codigoRed), microred, o establecimiento */
  codigoRed?: string | null;
  codigoMicrored?: string | null;
  codigoUnico?: string | null;
  /** Perfil de empleado del usuario (null si no tiene empleado asociado) */
  employeeProfile?: {
    employeeId: number;
    isEstablishmentHead: boolean;
    isMicroredHead: boolean;
    isProfessionHead: boolean;
    /** ID de la profesión individual del empleado */
    professionId: number | null;
    /** Grupo de profesiones que gestiona el jefe (ej: 'ENFERMERIA'). null si no es jefe de profesión. */
    professionGroup: string | null;
    /** Código de la oficina/unidad (ej: 'UNI-RRHH', 'UNI-LOG') */
    officeCode: string | null;
  } | null;
  applications: Application[];
  createdAt: string;
  updatedAt: string;
}

export interface ChangeEventTarget {
  name: string;
  value: string;
}

export interface ChangeEvent {
  target: ChangeEventTarget;
}