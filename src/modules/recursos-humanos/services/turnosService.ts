import { apiService } from '../../../core/services/apiService';
import type { ShiftTypesResponse, ICreateShiftDto, EmployeeTurno, ShiftSubmission, SubmissionPackage, ShiftType } from '../types';

class TurnosService {
    
    // Obtener empleados del establecimiento
    async getEmployeesOnly(codigoUnico: string, month?: number, year?: number): Promise<{ success: boolean; data: EmployeeTurno[] }> {
        let url = `/rrhh/shifts/establishment/${codigoUnico}/employees`;
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        return apiService.get<{ success: boolean; data: EmployeeTurno[] }>(url);
    }

    // Trae solo los turnos de empleados 
    async getShiftsOnly(codigoUnico: string, month: number, year: number): Promise<{ success: boolean; data: any[] }> {
        const data = await apiService.get<{ success: boolean; data: any[] }>(`/rrhh/shifts/establishment/${codigoUnico}/shifts?month=${month}&year=${year}`);        
        return data;
    }

    // Trae los tipos de turnos segun categoria de establecimiento
    async getAllowedShiftTypes(codigoUnico: string): Promise<ShiftTypesResponse> {
        return apiService.get<ShiftTypesResponse>(`/rrhh/shifts/types/${codigoUnico}`);
    }

    /**
     * Endpoint unificado del calendario: obtiene empleados, tipos de turno,
     * turnos, licencias y estado de envío en una sola llamada HTTP.
     * Reemplaza las 4 llamadas separadas (getEmployeesOnly + getAllowedShiftTypes
     * + getShiftsOnly + getSubmissionStatus).
     *
     * @param professionGroup - Solo para Jefe de Profesión; filtra la submission por grupo.
     */
    async getCalendar(
        codigoUnico: string,
        month: number,
        year: number,
        professionGroup?: string | null,
    ): Promise<{ success: boolean; data: {
        employees:   EmployeeTurno[];
        shiftTypes:  ShiftType[];
        visibility:  { allowed: boolean; status: string | null };
        submission:  ShiftSubmission | null;
        shifts:      any[];
        licencias:   any[];
    }}> {
        const params = new URLSearchParams({
            month: month.toString(),
            year:  year.toString(),
        });
        if (professionGroup) params.append('professionGroup', professionGroup);
        return apiService.get(`/rrhh/shifts/establishment/${codigoUnico}/calendar?${params.toString()}`);
    }

    // Registrar turnos de forma masiva
    async bulkCreateShifts(shifts: ICreateShiftDto[]): Promise<{ success: boolean; message?: string; error?: string }> {
        const data = await apiService.post<{ success: boolean; message?: string; error?: string }>('/rrhh/shifts/bulk-create', { shifts });        
        return data;
    }

    // Actualización masiva de colores de tipos de turnos
    async bulkUpdateShiftTypeColors(colors: { id: number, color: string }[]): Promise<{ success: boolean; message?: string; data?: any }> {
        const data = await apiService.patch<{ success: boolean; message?: string; data?: any }>('/rrhh/shifts/types/colors/bulk-update', { colors });
        return data;
    }

    // ─── Submissions ────────────────────────────────────────────────────────────

    // Obtener estado de una submission de turnos de un establecimiento.
    async getSubmissionStatus(codigoUnico: string, yearMonth: string, professionGroup?: string | null): Promise<{ success: boolean; data: ShiftSubmission | null }> {
        const qs = professionGroup ? `?professionGroup=${encodeURIComponent(professionGroup)}` : '';
        return apiService.get(`/rrhh/shifts/submissions/establishment/${codigoUnico}/${yearMonth}${qs}`);
    }

    /**
     * Obtener bandeja de submissions agrupada por paquete (establecimiento + mes).
     * El backend agrupa los grupos de profesión y retorna un SubmissionPackage por fila.
     */
    async getSubmissions(userId: number, filters?: {
        yearMonth?: string;
        page?: number;
    }): Promise<{ success: boolean; data: { rows: SubmissionPackage[]; count: number } }> {
        const params = new URLSearchParams();
        params.append('userId', userId.toString());
        if (filters?.yearMonth) params.append('yearMonth', filters.yearMonth);
        if (filters?.page) params.append('page', filters.page.toString());
        return apiService.get(`/rrhh/shifts/submissions?${params.toString()}`);
    }

    // Jefe de Grupo de Profesión envía los turnos del mes al flujo de aprobación.
    async submitMonth(
        codigoUnico: string,
        yearMonth: string,
        userId: number,
        professionGroup?: string | null,
    ): Promise<{ success: boolean; data: ShiftSubmission; message?: string }> {
        return apiService.post('/rrhh/shifts/submissions/submit', { codigoUnico, yearMonth, userId, professionGroup: professionGroup ?? null });
    }

    /**
     * Aprueba todos los grupos de profesión de un establecimiento + mes en un solo click.
     * Reemplaza a approveMonth para la bandeja agrupada.
     */
    async approvePackage(codigoUnico: string, yearMonth: string, userId: number): Promise<{ success: boolean; data: { affected: number }; message?: string }> {
        return apiService.post('/rrhh/shifts/submissions/approve-package', { codigoUnico, yearMonth, userId });
    }

    /**
     * Rechaza todos los grupos de profesión de un establecimiento + mes en un solo click.
     * Reemplaza a rejectMonth para la bandeja agrupada.
     */
    async rejectPackage(codigoUnico: string, yearMonth: string, userId: number, message?: string): Promise<{ success: boolean; data: { affected: number }; message?: string }> {
        return apiService.post('/rrhh/shifts/submissions/reject-package', { codigoUnico, yearMonth, userId, message });
    }

    // Aprueba una submission individual por ID (legacy — no usado en bandeja).
    async approveMonth(submissionId: number, userId: number): Promise<{ success: boolean; data: ShiftSubmission; message?: string }> {
        return apiService.post(`/rrhh/shifts/submissions/${submissionId}/approve`, { userId });
    }

    // Rechaza una submission individual por ID (legacy — no usado en bandeja).
    async rejectMonth(submissionId: number, userId: number, message?: string): Promise<{ success: boolean; data: ShiftSubmission; message?: string }> {
        return apiService.post(`/rrhh/shifts/submissions/${submissionId}/reject`, { userId, message });
    }
}

export const turnosService = new TurnosService();
