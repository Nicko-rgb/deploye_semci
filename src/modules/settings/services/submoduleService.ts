import { apiService } from '../../../core/services/apiService';
import type { SubModule, datosSubModule, CreateUpdateSubModuleData } from '../interface/modularidadInterface';

class SubmoduleService {
    async getById(submoduleId: number): Promise<datosSubModule> {
        return await apiService.get<datosSubModule>(`/settings/submodules/${submoduleId}`);
    }

    async getAll(
        page = 1, 
        limit = 10, 
        applicationId?: number,
        moduleId?: number,
        isActive?: boolean,
        search?: string
    ): Promise<{
        success: boolean;
        message: string;
        data: SubModule[];
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
            ...(applicationId !== undefined && { applicationId: applicationId.toString() }),
            ...(moduleId !== undefined && { moduleId: moduleId.toString() }),
            ...(isActive !== undefined && { isActive: isActive.toString() }),
            ...(search !== undefined && { search: search })
        });

        const response = await apiService.get<{
            success: boolean;
            message: string;
            data: SubModule[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        }>(`/settings/submodules?${params}`);
        return response;
    }

    async getByModule(moduleId: number): Promise<{
        success: boolean;
        message: string;
        data: SubModule[];
    }> {
        return await apiService.get(`/settings/submodules/module/${moduleId}`);
    }

    async create(submoduleData: CreateUpdateSubModuleData): Promise<datosSubModule> {
        return await apiService.post<datosSubModule>(`/settings/submodules`, submoduleData);
    }

    async update(submoduleId: number, data: CreateUpdateSubModuleData): Promise<datosSubModule> {
        return await apiService.put<datosSubModule>(`/settings/submodules/${submoduleId}`, data);
    }

    async delete(submoduleId: number): Promise<void> {
        await apiService.delete(`/settings/submodules/${submoduleId}`);
    }
}

export const submoduleService = new SubmoduleService();
