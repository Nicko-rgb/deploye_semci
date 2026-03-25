import { apiService } from '../../../core/services/apiService';
import type { NetworkHierarchy, EmployeeListDTO } from '../types/network.types';

export const NetworkService = {

    // Consulta de jerarquía de datos red microred establecimiento
    getHierarchy: async (codigo_red: string, year?: number, month?: number): Promise<NetworkHierarchy> => {
        // La respuesta del servidor tiene la estructura { success: boolean, data: NetworkHierarchy, ... }
        const params: any = { codigo_red };
        if (year) params.year = year;
        if (month) params.month = month;

        const response = await apiService.get<{ success: boolean, data: NetworkHierarchy }>('/semci/reportes/hierarchy', {
            params
        });
        return response.data;
    },

    // Obtener microredes por nombre de red
    getMicroredesByNomRed: async (nom_red: string): Promise<any[]> => {
        const response = await apiService.get<{ success: boolean, data: any[] }>('/semci/microredes/by-nombre', {
            params: { nom_red }
        });
        return response.data;
    },

    // Obtener establecimientos por nombre de red y microred
    getEstablecimientosByNomRedMicrored: async (nom_red: string, nom_microred: string): Promise<any[]> => {
        const response = await apiService.get<{ success: boolean, data: any[] }>('/semci/establecimientos/by-nombre', {
            params: { nom_red, nom_microred }
        });
        return response.data;
    },

    // Lista de empleados con filtro
    getEmployeesList: async (
        codigo_red: string,
        codigo_microred?: string,
        codigo_unico?: string,
        profession_name?: string,
        regime_name?: string,
        occupational_group?: string,
        personnel_type?: string,
        year?: number,
        month?: number,
        labor_condition_name?: string,
        limit?: number,
        distrito?: string
    ): Promise<EmployeeListDTO[]> => {
        const params = new URLSearchParams();
        params.append('codigoRed', codigo_red);
        if (codigo_microred) params.append('codigoMicrored', codigo_microred);
        if (codigo_unico) params.append('codigoUnico', codigo_unico);
        if (distrito) params.append('distrito', distrito);
        if (profession_name) params.append('professionName', profession_name);
        if (regime_name) params.append('regimeName', regime_name);
        if (occupational_group) params.append('occupationalGroup', occupational_group);
        if (personnel_type) params.append('personnelType', personnel_type);
        if (year) params.append('year', year.toString());
        if (month) params.append('month', month.toString());
        if (labor_condition_name) params.append('laborConditionName', labor_condition_name);
        if (limit) params.append('limit', limit.toString());

        const response = await apiService.get<{ success: boolean, data: EmployeeListDTO[] }>(`/rrhh/employees?${params.toString()}`);        
        return response.data || [];
    },

    // Exportar empleados a Excel
    exportEmployees: async (
        codigo_red: string,
        codigo_microred?: string,
        codigo_unico?: string,
        profession_name?: string,
        regime_name?: string,
        occupational_group?: string,
        personnel_type?: string,
        year?: number,
        month?: number,
        labor_condition_name?: string
    ): Promise<Blob> => {
        const params = new URLSearchParams();
        params.append('codigoRed', codigo_red);
        if (codigo_microred) params.append('codigoMicrored', codigo_microred);
        if (codigo_unico) params.append('codigoUnico', codigo_unico);
        if (profession_name) params.append('professionName', profession_name);
        if (regime_name) params.append('regimeName', regime_name);
        if (occupational_group) params.append('occupationalGroup', occupational_group);
        if (personnel_type) params.append('personnelType', personnel_type);
        if (year) params.append('year', year.toString());
        if (month) params.append('month', month.toString());
        if (labor_condition_name) params.append('laborConditionName', labor_condition_name);

        const response = await apiService.get<Blob>(`/rrhh/employees/export?${params.toString()}`, {
            responseType: 'blob'
        });
        return response;
    }
};
