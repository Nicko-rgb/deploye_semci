import { apiService } from '../../../core/services/apiService';
//import { authService } from '../../../core/services/authService';
import type { Application, CreateApplicationData, datosApplication } from '../interface/modularidadInterface';

class ApplicationService {
    // Obtener modulos y permisos del usuario
    async getById(applicationId: number): Promise<datosApplication> {
        return await apiService.get<datosApplication>(`/settings/application/${applicationId}`);
    }

    async getAll(): Promise<{
          success: boolean;
          message: string;
          data: Application[];
        }> {
        const response = await apiService.get<{
          success: boolean;
          message: string;
          data: Application[];
        }>(`/settings/application`);
        return response;
    }

    async create(applicationData: CreateApplicationData): Promise<datosApplication> {
        return await apiService.post<datosApplication>(`/settings/application`, applicationData);
    }

    async update(applicationId: number, data: CreateApplicationData): Promise<datosApplication> {
        return await apiService.put<datosApplication>(`/settings/application/${applicationId}`, data);
    }

    async delete(applicationId: number): Promise<void> {
        await apiService.delete(`/settings/application/${applicationId}`);
    }
}

export const applicationService = new ApplicationService();