import { apiService } from './apiService';

/** Código DISA fijo para esta instancia (Ucayali - DISA 34) */
const CODIGO_DISA = 34;

// ──────────────────────────────────────────────
// Tipos de respuesta de la API
// ──────────────────────────────────────────────

export interface HierarchyItem {
    codigo_microred: string;
    nom_microred: string;
    establecimientos: {
        codigoUnico: string;
        nombre_establecimiento: string;
        codigoMicrored: string;
        codigoRed: string;
    }[];
}

export interface RedItem {
    codigo_red: string;
    nom_red: string;
    codigo_disa: string;
    disa: string;
}

export interface MicroredItem {
    codigo_microred: string;
    nom_microred: string;
    codigo_red: string;
    nom_red: string;
    codigo_disa: string;
    disa: string;
}

export interface EstablecimientoItem {
    id_establecimiento: number;
    nombre_establecimiento: string;
    codigo_unico: string;
    codigo_disa: string;
    disa: string;
    codigo_red: string;
    nom_red: string;
    codigo_microred: string;
    nom_microred: string;
    categoria_establecimiento: string;
}

// ──────────────────────────────────────────────
// Servicio
// ──────────────────────────────────────────────

const hierarchyService = {
    /**
     * Obtiene todas las redes de una DISA (por defecto Ucayali - 34).
     */
    async getRedes(codigoDisa?: number): Promise<RedItem[]> {
        const disa = codigoDisa ?? CODIGO_DISA;
        const data = await apiService.get<{ success: boolean; data: RedItem[] }>(
            `/settings/red/codigo-disa/${disa}`
        );
        return data.data ?? [];
    },

    /**
     * Obtiene las microredes de una red dentro de una DISA.
     */
    async getMicrorredesByRed(codigoRed: string, codigoDisa?: number): Promise<MicroredItem[]> {
        const disa = codigoDisa ?? CODIGO_DISA;
        const res = await apiService.get<{ success: boolean; data: MicroredItem[] }>(
            `/settings/microred/codigo-disa-red/${disa}/${codigoRed}`
        );
        return res.data ?? [];
    },

    /**
     * Obtiene los establecimientos filtrados por red y microred.
     */
    async getEstablecimientosByMicrored(
        codigoRed: string,
        codigoMicrored: string,
        codigoDisa?: number
    ): Promise<EstablecimientoItem[]> {
        const disa = codigoDisa ?? CODIGO_DISA;
        const params = new URLSearchParams({
            codigo_disa: String(disa),
            codigo_red: codigoRed,
            codigo_microred: codigoMicrored,
        });
        const res = await apiService.get<{ success: boolean; data: EstablecimientoItem[] }>(
            `/settings/establecimiento?${params}`
        );
        return res.data ?? [];
    },

    /**
     * Obtiene los establecimientos filtrados solo por red (sin filtro de microred).
     */
    async getEstablecimientosByRed(codigoRed: string, codigoDisa?: number): Promise<EstablecimientoItem[]> {
        const disa = codigoDisa ?? CODIGO_DISA;
        const params = new URLSearchParams({
            codigo_disa: String(disa),
            codigo_red: codigoRed,
        });
        const res = await apiService.get<{ success: boolean; data: EstablecimientoItem[] }>(
            `/settings/establecimiento?${params}`
        );
        return res.data ?? [];
    },

    /**
     * Construye la jerarquía completa de microredes y establecimientos para la red '01'.
     * Devuelve un array de microredes, cada una con su lista de establecimientos anidados.
     */
    async getHierarchy(codigoRed = '01'): Promise<HierarchyItem[]> {
        const [microredes, establecimientos] = await Promise.all([
            hierarchyService.getMicrorredesByRed(codigoRed),
            hierarchyService.getEstablecimientosByRed(codigoRed),
        ]);
        return microredes.map(m => ({
            codigo_microred: m.codigo_microred,
            nom_microred: m.nom_microred,
            establecimientos: establecimientos
                .filter(e => e.codigo_microred === m.codigo_microred)
                .map(e => ({
                    codigoUnico: e.codigo_unico,
                    nombre_establecimiento: e.nombre_establecimiento,
                    codigoMicrored: e.codigo_microred,
                    codigoRed: e.codigo_red,
                })),
        }));
    },
};

export default hierarchyService;
