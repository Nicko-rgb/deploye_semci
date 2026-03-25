import { apiService } from '../../../core/services/apiService';

export const licenciaService = {
    getTipos: async () => {
        return await apiService.get('/rrhh/licencias/tipos');
    },

    list: async (filters: any) => {
        return await apiService.get('/rrhh/licencias', { params: filters });
    },

    getStats: async (filters: any) => {
        return await apiService.get('/rrhh/licencias/stats', { params: filters });
    },

    create: async (data: any) => {
        return await apiService.post('/rrhh/licencias', data);
    },

    getPending: async (codigoUnico?: string) => {
        return await apiService.get('/rrhh/licencias/pending', {
            params: { codigoUnico }
        });
    },

    updateStatus: async (id: number, status: string, userId?: number, data: any = {}) => {
        return await apiService.patch(`/rrhh/licencias/${id}/status`, {
            status,
            userId,
            ...data
        });
    },

    getHistory: async (employeeId: number, filters: any = {}) => {
        return await apiService.get(`/rrhh/licencias/employee/${employeeId}/history`, { params: filters });
    },

    getVacations: async (employeeId: number) => {
        return await apiService.get(`/rrhh/licencias/employee/${employeeId}/vacations`);
    },

    updateTipoRules: async (tipoId: number, rules: any) => {
        return await apiService.patch(`/rrhh/licencias/tipos/${tipoId}/rules`, { rules });
    },

    updateTipoConfig: async (tipoId: number, config: { rules?: any; requiresAttachment?: boolean; description?: string }) => {
        return await apiService.put(`/rrhh/licencias/tipos/${tipoId}/config`, config);
    }
};
