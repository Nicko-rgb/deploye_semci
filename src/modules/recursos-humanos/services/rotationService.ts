import { apiService } from '../../../core/services/apiService';
import type { Rotation, CreateRotationDTO, UpdateRotationDTO } from '../types';

interface RotationsResponse {
    success: boolean;
    data: Rotation[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    message?: string;
}

class RotationService {

    // Obtiene lista de rotaciones con filtros
    async getRotations(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        codigoMicrored?: string;
        codigoUnico?: string;
    }): Promise<RotationsResponse> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        // Nota: La ruta base ahora es /rrhh/rotations debido a la refactorización del backend
        const data = await apiService.get<RotationsResponse>(`/rrhh/rotations${queryString ? `?${queryString}` : ''}`);
        return data;
    }

    // Crea una nueva rotación (Red, Microred o Establecimiento)
    async createRotation(data: CreateRotationDTO): Promise<{ success: boolean; message?: string; data?: any }> {
        return await apiService.post('/rrhh/rotations', data);
    }

    // Actualiza una rotación existente
    async updateRotation(rotationId: number, data: UpdateRotationDTO): Promise<{ success: boolean; message?: string; data?: any }> {
        return await apiService.put(`/rrhh/rotations/${rotationId}`, data);
    }

    // Obtiene los detalles de una rotación por su ID
    async getRotationById(rotationId: number): Promise<{ success: boolean; message?: string; data?: any }> {
        return await apiService.get(`/rrhh/rotations/${rotationId}`);
    }

    // Obtiene el historial de rotaciones por ID de empleado
    async getRotationHistory(employeeId: number): Promise<{ success: boolean; data: Rotation[]; message?: string }> {
        return await apiService.get<{ success: boolean; data: Rotation[]; message?: string }>(`/rrhh/rotations/history/${employeeId}`);
    }

    // Obtiene el siguiente número de documento correlativo
    async getNextNumber(): Promise<{ success: boolean; data: string; message?: string }> {
        return await apiService.get<{ success: boolean; data: string; message?: string }>('/rrhh/rotations/next-number');
    }

    // Descarga el documento de rotación en formato .pdf
    async downloadRotationDoc(rotationId: number): Promise<void> {
        const response = await apiService.get<Blob>(`/rrhh/rotations/${rotationId}/download`, {
            responseType: 'blob'
        } as any);

        if (response) {
            const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ROTACION_${rotationId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }
    }
}

export const rotationService = new RotationService();
