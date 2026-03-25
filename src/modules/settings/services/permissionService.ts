import { apiService } from '../../../core/services/apiService';
//import { authService } from '../../../core/services/authService';
import type { CreateUpdatePermissionData, datosPermission, Permission } from '../interface/modularidadInterface';

class PermissionService {
    // Obtener modulos y permisos del usuario
    async getById(applicationId: number): Promise<datosPermission> {
        return await apiService.get<datosPermission>(`/settings/permissions/${applicationId}`);
    }

    async getAll(): Promise<{
          success: boolean;
          message: string;
          data: Permission[];
        }> {
        const response = await apiService.get<{
          success: boolean;
          message: string;
          data: Permission[];
        }>(`/settings/permissions`);
        return response;
    }

    async create(permissionData: CreateUpdatePermissionData): Promise<datosPermission> {
        return await apiService.post<datosPermission>(`/settings/permissions`, permissionData);
    }

    async update(permissionId: number, data: CreateUpdatePermissionData): Promise<datosPermission> {
        return await apiService.put<datosPermission>(`/settings/permissions/${permissionId}`, data);
    }

    async delete(permissionId: number): Promise<void> {
        await apiService.delete(`/settings/permissions/${permissionId}`);
    }
}

export const permissionService = new PermissionService();