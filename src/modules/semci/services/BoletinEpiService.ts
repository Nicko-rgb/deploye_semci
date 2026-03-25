import { apiService } from '../../../core/services/apiService';

export interface EdasAcuosa {
    nombre_establecimiento: string;
    total: number;
}

export interface EdasDesintericas {
    nombre_establecimiento: string;
    total: number;
}

export interface Iras {
    nombre_establecimiento: string;
    total: number;
}

export interface IrasTable {
    nom_microred: string;
    ira_m2: number;
    ira_2_11: number;
    ira_1_4a: number;
    ngr_2_11: number;
    ngr_1_4a: number;
    sob_2a: number;
    sob_2_4a: number;
    total: number;
}

interface datosEdasAcuosa {
    data: EdasAcuosa[];
    success: boolean;
    message: string;
}

interface datosEdasDisentericas {
    data: EdasDesintericas[];
    success: boolean;
    message: string;
}

interface datosIras {
    data: Iras[];
    success: boolean;
    message: string;
}

interface datosIrasTable {
    data: IrasTable[];
    success: boolean;
    message: string;
}

class BoletinEpiService {
    async getEdasAcuosa(anio: number, semana?: number, codigo_red?: string, codigo_microred?: string): Promise<EdasAcuosa[]> {
        // Construir query parameters
        const params = new URLSearchParams();
        
        // Parámetros obligatorios
        params.append('anio', anio.toString());
        
        // Parámetros opcionales - solo agregar si tienen valor
        if (semana !== undefined && semana !== null) {
            params.append('semana', semana.toString());
        }
        
        if (codigo_red && codigo_red.trim() !== '') {
            params.append('codigo_red', codigo_red);
        }
        
        if (codigo_microred && codigo_microred.trim() !== '') {
            params.append('codigo_microred', codigo_microred);
        }
        
        const queryString = params.toString();
        const url = `/epidemiologia/boletin/edas-acuosa${queryString ? `?${queryString}` : ''}`;
        
        const response: datosEdasAcuosa = await apiService.get(url);
        return response.data;
    }

    async getEdasDisentericas(anio: number, semana?: number, codigo_red?: string, codigo_microred?: string): Promise<EdasDesintericas[]> {
        // Construir query parameters
        const params = new URLSearchParams();
        
        // Parámetros obligatorios
        params.append('anio', anio.toString());
        
        // Parámetros opcionales - solo agregar si tienen valor
        if (semana !== undefined && semana !== null) {
            params.append('semana', semana.toString());
        }
        
        if (codigo_red && codigo_red.trim() !== '') {
            params.append('codigo_red', codigo_red);
        }
        
        if (codigo_microred && codigo_microred.trim() !== '') {
            params.append('codigo_microred', codigo_microred);
        }
        
        const queryString = params.toString();
        const url = `/epidemiologia/boletin/edas-disentericas${queryString ? `?${queryString}` : ''}`;

        const response: datosEdasDisentericas = await apiService.get(url);
        return response.data;
    }

    async getIras(anio: number, semana?: number, codigo_red?: string, codigo_microred?: string): Promise<Iras[]> {
        // Construir query parameters
        const params = new URLSearchParams();
        
        // Parámetros obligatorios
        params.append('anio', anio.toString());
        
        // Parámetros opcionales - solo agregar si tienen valor
        if (semana !== undefined && semana !== null) {
            params.append('semana', semana.toString());
        }
        
        if (codigo_red && codigo_red.trim() !== '') {
            params.append('codigo_red', codigo_red);
        }
        
        if (codigo_microred && codigo_microred.trim() !== '') {
            params.append('codigo_microred', codigo_microred);
        }
        
        const queryString = params.toString();
        const url = `/epidemiologia/boletin/iras${queryString ? `?${queryString}` : ''}`;

        const response: datosIras = await apiService.get(url);
        return response.data;
    }

    async getIrasTable(anio: number, semana?: number, codigo_red?: string, codigo_microred?: string): Promise<IrasTable[]> {
        // Construir query parameters
        const params = new URLSearchParams();
        
        // Parámetros obligatorios
        params.append('anio', anio.toString());
        
        // Parámetros opcionales - solo agregar si tienen valor
        if (semana !== undefined && semana !== null) {
            params.append('semana', semana.toString());
        }
        
        if (codigo_red && codigo_red.trim() !== '') {
            params.append('codigo_red', codigo_red);
        }
        
        if (codigo_microred && codigo_microred.trim() !== '') {
            params.append('codigo_microred', codigo_microred);
        }
        
        const queryString = params.toString();
        const url = `/epidemiologia/boletin/iras-table${queryString ? `?${queryString}` : ''}`;

        const response: datosIrasTable = await apiService.get(url);
        return response.data;
    }

}

export const boletinEpiService = new BoletinEpiService();