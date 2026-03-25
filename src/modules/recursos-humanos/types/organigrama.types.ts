// ─── Tipos del Organigrama (mirror del backend) ───────────────────────────────

export interface OrgHead {
    employeeId: number;
    fullName: string;
    profession: string | null;
}

export interface OrgOficina {
    id: number;
    code: string;
    name: string;
    orgLevel: string;
    parentId: number | null;
    totalEmpleados: number;
    head: OrgHead | null;
    children: OrgOficina[];
}

export interface OrgProfesion {
    professionId: number;
    name: string;
    grupo: string | null;
    count: number;
    head: OrgHead | null;
}

export interface OrgProfesionGroup {
    grupo: string;
    count: number;
    head: OrgHead | null;
    items: OrgProfesion[];
    /** Tipo de personal dominante del grupo, calculado en el backend (ASISTENCIAL, ADMINISTRATIVO, HÍBRIDO, DESCONOCIDO) */
    tipoPersonal?: string;
}

export interface OrgServicio {
    serviceId: number;
    name: string;
    group: string | null;
    count: number;
    head: OrgHead | null;
}

export interface OrgEstablecimiento {
    codigoUnico: string;
    nombre: string;
    categoria: string | null;
    distrito: string | null;
    head: OrgHead | null;
    totalEmpleados: number;
}

export interface OrgMicrored {
    codigoMicrored: string;
    nombre: string;
    totalEstablecimientos: number;
    totalEmpleados: number;
    head: OrgHead | null;
    establecimientos: OrgEstablecimiento[];
}

export interface OrgRed {
    codigoRed: string;
    nombre: string;
    codigoDisa: number | null;
    disa: string | null;
    totalEstablecimientos: number;
    totalEmpleados: number;
    head: OrgHead | null;
    microredes: OrgMicrored[];
    establecimientos: OrgEstablecimiento[];
}

export interface OrgEstablecimientoDetalle extends OrgEstablecimiento {
    oficinas: OrgOficina[];
    sinOficina: number;
    profesiones: OrgProfesionGroup[];
    sinProfesion: number;
    servicios: OrgServicio[];
}

/** Empleado candidato para asignar como jefe de profesión */
export interface OrgCandidatoJefe {
    employeeId: number;
    fullName: string;
    documentNumber: string;
    laborCondition: string;
    isProfessionHead: boolean;
}

export interface OrgSedeDetalle {
    label: string;
    codigoRed: string;
    codigoMicrored: string | null;
    oficinas: OrgOficina[];
    sinOficina: number;
    profesiones: OrgProfesionGroup[];
    sinProfesion: number;
    totalEmpleados: number;
}
