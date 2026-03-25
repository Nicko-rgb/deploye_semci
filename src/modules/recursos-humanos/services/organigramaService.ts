import { apiService } from '../../../core/services/apiService';
import type { OrgRed, OrgEstablecimientoDetalle, OrgSedeDetalle } from '../types/organigrama.types';

interface OrgTreeResponse {
    success: boolean;
    data: OrgRed[];
    message?: string;
}

interface OrgDetalleResponse {
    success: boolean;
    data: OrgEstablecimientoDetalle;
    message?: string;
}

interface OrgSedeResponse {
    success: boolean;
    data: OrgSedeDetalle;
    message?: string;
}

class OrganigramaService {

    async getTree(params?: {
        codigoDisa?: number;
        codigoRed?: string;
        codigoMicrored?: string;
        codigoUnico?: string;
    }): Promise<OrgTreeResponse> {
        const query = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') query.append(key, String(value));
            });
        }
        const qs = query.toString();
        return apiService.get<OrgTreeResponse>(`/rrhh/organigrama${qs ? `?${qs}` : ''}`);
    }

    /** Detalle interno de un establecimiento (oficinas, profesiones, servicios) */
    async getEstablecimientoDetalle(codigoUnico: string, codigoRed?: string, codigoDisa?: number): Promise<OrgDetalleResponse> {
        const query = new URLSearchParams();
        if (codigoRed)  query.append('codigoRed',  codigoRed);
        if (codigoDisa) query.append('codigoDisa', String(codigoDisa));
        const qs = query.toString();
        return apiService.get<OrgDetalleResponse>(`/rrhh/organigrama/establecimiento/${codigoUnico}${qs ? `?${qs}` : ''}`);
    }

    /** Empleados de la sede de una red o microred agrupados por oficina */
    async getSedeDetalle(codigoRed: string, codigoMicrored?: string, codigoDisa?: number): Promise<OrgSedeResponse> {
        const query = new URLSearchParams({ codigoRed });
        if (codigoMicrored) query.append('codigoMicrored', codigoMicrored);
        if (codigoDisa)     query.append('codigoDisa', String(codigoDisa));
        return apiService.get<OrgSedeResponse>(`/rrhh/organigrama/sede?${query.toString()}`);
    }
}

export const organigramaService = new OrganigramaService();
