import { apiService } from '../../../core/services/apiService';
import type { EmployeeSummary, EmployeeDetail, EmployeeFormData } from '../types';
import type { OrgCandidatoJefe } from '../types/organigrama.types';

interface EmployeeResponse {
    success: boolean;
    data: EmployeeDetail;
    message?: string;
}

interface EmployeesResponse {
    success: boolean;
    data: EmployeeSummary[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

class EmployeeService {

    // Registra nuevo empleado
    async saveEmployee(employeeData: Partial<EmployeeFormData>): Promise<EmployeeResponse> {
        const data = await apiService.post<EmployeeResponse>('/rrhh/employees', employeeData);
        return data;
    }

    // Actualiza empleado
    async updateEmployee(id: string, employeeData: Partial<EmployeeFormData>): Promise<EmployeeResponse> {
        const data = await apiService.put<EmployeeResponse>(`/rrhh/employees/${id}`, employeeData);
        return data;
    }

    // Lista a todos los empleados
    async getEmployees(params?: {
        page?: number;
        limit?: number;
        search?: string;
        laborConditionId?: string;
        occupationalGroup?: string;
        isEnabled?: boolean; // Booleano para el backend
        codigoUnico?: string;
        nomRed?: string;
        codigoRed?: string;
        codigoDisa?: number;
        codigoMicrored?: string; // Código de microred (filtro directo por código)
        nomMicrored?: string;    // Nombre de microred (solo para caso especial SOLO RED)
        professionName?: string; // Filtra por grupo de profesión en el backend
        regimeName?: string;
        personnelType?: string;
        laborConditionName?: string;
        oficinaDireccionId?: number; // Filtra por oficina/dirección asignada
    }): Promise<EmployeesResponse> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        const data = await apiService.get<EmployeesResponse>(`/rrhh/employees${queryString ? `?${queryString}` : ''}`);
        return data;
    }

    // Exportar empleados a Excel
    async exportEmployees(params?: {
        search?: string;
        nomRed?: string;
        codigoRed?: string;
        codigoDisa?: number;
        codigoMicrored?: string; // Código de microred (filtro directo por código)
        nomMicrored?: string;    // Nombre de microred (solo para caso especial SOLO RED)
        codigoUnico?: string;
        professionName?: string;
        regimeName?: string;
        personnelType?: string;
        laborConditionName?: string;
        grupoCondicion?: string;
        laborRegimeId?: string | number;
        isEnabled?: boolean;
        occupationalGroup?: string;
    }): Promise<Blob> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        const response = await apiService.get<Blob>(`/rrhh/employees/export${queryString ? `?${queryString}` : ''}`, {
            responseType: 'blob'
        });
        return response;
    }

    // Obtienes detalles completos de un empleado
    async getEmployee(id: string): Promise<EmployeeResponse> {
        const data = await apiService.get<EmployeeResponse>(`/rrhh/employees/${id}`);
        return data;
    }

    /**
     * Lista candidatos para jefe de profesión en el scope dado.
     * GET /rrhh/employees/jefe-profesion/candidatos
     */
    async getCandidatosJefeProfesion(params:
        ({ professionId: number } | { grupo: string }) & {
            codigoDisa?: number;
            codigoUnico?: string;
            codigoRed?: string;
            codigoMicrored?: string;
        }
    ): Promise<{ success: boolean; data: OrgCandidatoJefe[] }> {
        const query = new URLSearchParams();
        if ('professionId' in params) query.append('professionId', String(params.professionId));
        if ('grupo' in params)        query.append('grupo', params.grupo);
        if (params.codigoDisa)        query.append('codigoDisa',     String(params.codigoDisa));
        if (params.codigoUnico)       query.append('codigoUnico',    params.codigoUnico);
        if (params.codigoRed)         query.append('codigoRed',      params.codigoRed);
        if (params.codigoMicrored)    query.append('codigoMicrored', params.codigoMicrored);
        return apiService.get(`/rrhh/employees/jefe-profesion/candidatos?${query.toString()}`);
    }

    /**
     * Asigna un empleado como jefe de profesión en el scope dado.
     * POST /rrhh/employees/jefe-profesion
     */
    async asignarJefeProfesion(params:
        ({ employeeId: number } & ({ professionId: number } | { grupo: string }) & {
            codigoDisa?: number;
            codigoUnico?: string;
            codigoRed?: string;
            codigoMicrored?: string;
        })
    ): Promise<{ success: boolean; message?: string }> {
        return apiService.post('/rrhh/employees/jefe-profesion', params);
    }
}

export const employeeService = new EmployeeService();

