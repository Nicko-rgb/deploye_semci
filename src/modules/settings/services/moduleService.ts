import { apiService } from '../../../core/services/apiService';
import type { Module, CreateUpdateModuleData, datosModule, datosModules } from '../interface/modularidadInterface';


class ModuleService {
    async getById(moduleId: number): Promise<datosModule> {
        return await apiService.get<datosModule>(`/settings/modules/${moduleId}`);
    }

    async getAll(page = 1, limit = 10, applicationId?: number): Promise<{
          success: boolean;
          message: string;
          data: Module[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            };
        }> {

        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(applicationId !== undefined && { applicationId: applicationId.toString() })
        });
        const response = await apiService.get<{
          success: boolean;
          message: string;
          data: Module[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>(`/settings/modules?${params}`);
        return response;
    }

    async getAllByApplication(applicationId: number): Promise<datosModules> {
        return await apiService.get<datosModules>(`/settings/modules/application/${applicationId}`);
    }

    async create(moduleData: CreateUpdateModuleData): Promise<datosModule> {
        return await apiService.post<datosModule>(`/settings/modules`, moduleData);
    }

    async update(moduleId: number, data: CreateUpdateModuleData): Promise<datosModule> {
        return await apiService.put<datosModule>(`/settings/modules/${moduleId}`, data);
    }

    async delete(moduleId: number): Promise<void> {
        await apiService.delete(`/settings/modules/${moduleId}`);
    }
}

export const moduleService = new ModuleService();