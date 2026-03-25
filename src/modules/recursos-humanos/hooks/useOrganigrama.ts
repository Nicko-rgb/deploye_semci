import { useState, useCallback, useEffect, useMemo } from 'react';
import { organigramaService } from '../services/organigramaService';
import { useAccessLevel } from '../../../core/hooks/useAccessLevel';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import type {
    OrgRed, OrgMicrored, OrgEstablecimiento,
    OrgEstablecimientoDetalle, OrgSedeDetalle,
} from '../types/organigrama.types';

export type DrillView = 'redes' | 'microredes' | 'establecimientos';

// Qué está mostrando el panel derecho
export type DetailKind = 'establecimiento' | 'sede' | null;

export function useOrganigrama() {
    const {
        isEstablishmentLevel,
        isDiresaLevel,
        isRedLevel,
        isMicroredLevel,
        accessFilters,
    } = useAccessLevel();

    const pageBreadcrumb = useAppBreadcrumb(['Organigrama']);

    // ─── Árbol completo ──────────────────────────────────────────────────────────
    const [tree, setTree] = useState<OrgRed[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─── Navegación drill-down ───────────────────────────────────────────────────
    const [selectedRed, setSelectedRed] = useState<OrgRed | null>(null);
    const [selectedMicrored, setSelectedMicrored] = useState<OrgMicrored | null>(null);

    // ─── Panel derecho ───────────────────────────────────────────────────────────
    const [detailKind, setDetailKind] = useState<DetailKind>(null);
    const [selectedEst, setSelectedEst] = useState<OrgEstablecimiento | null>(null);
    const [estDetalle, setEstDetalle] = useState<OrgEstablecimientoDetalle | null>(null);
    const [sedeDetalle, setSedeDetalle] = useState<OrgSedeDetalle | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // ─── Carga del árbol ────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            setSelectedRed(null);
            setSelectedMicrored(null);
            setDetailKind(null);
            setSelectedEst(null);
            setEstDetalle(null);
            setSedeDetalle(null);

            try {
                const res = await organigramaService.getTree(accessFilters);
                if (cancelled) return;

                if (res.success) {
                    setTree(res.data);
                    // Auto-navegar según nivel del usuario
                    if (res.data.length === 1) {
                        const red = res.data[0];
                        if (isRedLevel || isMicroredLevel || isEstablishmentLevel) {
                            setSelectedRed(red);
                        }
                        if ((isMicroredLevel || isEstablishmentLevel) && red.microredes.length === 1) {
                            setSelectedMicrored(red.microredes[0]);
                        }
                    }
                } else {
                    setError(res.message ?? 'Error al obtener el organigrama');
                }
            } catch (e: any) {
                if (!cancelled) setError(e.message ?? 'Error de conexión');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessFilters, isRedLevel, isMicroredLevel, isEstablishmentLevel]);

    // ─── Vista actual ────────────────────────────────────────────────────────────
    const currentView: DrillView = useMemo(() => {
        if (selectedMicrored) return 'establecimientos';
        if (selectedRed) return 'microredes';
        return 'redes';
    }, [selectedRed, selectedMicrored]);

    const currentItems = useMemo((): OrgRed[] | OrgMicrored[] | OrgEstablecimiento[] => {
        if (selectedMicrored) return selectedMicrored.establecimientos;
        if (selectedRed) return selectedRed.microredes;
        return tree;
    }, [tree, selectedRed, selectedMicrored]);

    const establecimientosSinMicrored = useMemo(
        () => selectedRed?.establecimientos ?? [],
        [selectedRed]
    );

    // ─── Helpers de panel derecho ────────────────────────────────────────────────
    const clearDetail = useCallback(() => {
        setDetailKind(null);
        setSelectedEst(null);
        setEstDetalle(null);
        setSedeDetalle(null);
    }, []);

    // ─── Navegación ─────────────────────────────────────────────────────────────
    const enterRed = useCallback((red: OrgRed) => {
        setSelectedRed(red);
        setSelectedMicrored(null);
        clearDetail();
    }, [clearDetail]);

    const enterMicrored = useCallback((mr: OrgMicrored) => {
        setSelectedMicrored(mr);
        clearDetail();
    }, [clearDetail]);

    const goBack = useCallback(() => {
        if (selectedMicrored) {
            setSelectedMicrored(null);
            clearDetail();
        } else if (selectedRed && !isRedLevel) {
            setSelectedRed(null);
            clearDetail();
        }
    }, [selectedMicrored, selectedRed, isRedLevel, clearDetail]);

    const goToRed = useCallback(() => {
        setSelectedMicrored(null);
        clearDetail();
    }, [clearDetail]);

    /** Vuelve al listado raíz de redes (solo para usuarios DIRESA) */
    const goToRoot = useCallback(() => {
        setSelectedRed(null);
        setSelectedMicrored(null);
        clearDetail();
    }, [clearDetail]);

    // ─── Detalle de establecimiento ──────────────────────────────────────────────
    const selectEst = useCallback(async (est: OrgEstablecimiento) => {
        if (selectedEst?.codigoUnico === est.codigoUnico) {
            clearDetail();
            return;
        }
        setDetailKind('establecimiento');
        setSelectedEst(est);
        setEstDetalle(null);
        setSedeDetalle(null);
        setDetailLoading(true);
        try {
            const res = await organigramaService.getEstablecimientoDetalle(
                est.codigoUnico,
                selectedRed?.codigoRed,
                accessFilters.codigoDisa
            );
            if (res.success) setEstDetalle(res.data);
        } catch (e: any) {
            console.error('Error al cargar detalle:', e);
        } finally {
            setDetailLoading(false);
        }
    }, [selectedEst, selectedRed, accessFilters.codigoDisa, clearDetail]);

    // ─── Detalle de sede (red o microred) ───────────────────────────────────────
    const selectSede = useCallback(async () => {
        if (!selectedRed) return;

        // Toggle: si ya está mostrando la sede activa, cerrar
        if (detailKind === 'sede') {
            clearDetail();
            return;
        }

        setDetailKind('sede');
        setSelectedEst(null);
        setEstDetalle(null);
        setSedeDetalle(null);
        setDetailLoading(true);
        try {
            const res = await organigramaService.getSedeDetalle(
                selectedRed.codigoRed,
                selectedMicrored?.codigoMicrored,
                accessFilters.codigoDisa,
            );
            if (res.success) setSedeDetalle(res.data);
        } catch (e: any) {
            console.error('Error al cargar sede:', e);
        } finally {
            setDetailLoading(false);
        }
    }, [selectedRed, selectedMicrored, detailKind, accessFilters.codigoDisa, clearDetail]);

    // ─── Refrescar detalle actual ──────────────────────────────────────────────
    const refreshDetail = useCallback(async () => {
        if (detailKind === 'establecimiento' && selectedEst) {
            setDetailLoading(true);
            try {
                const res = await organigramaService.getEstablecimientoDetalle(
                    selectedEst.codigoUnico,
                    selectedRed?.codigoRed,
                    accessFilters.codigoDisa
                );
                if (res.success) setEstDetalle(res.data);
            } catch (e) {
                console.error('Error al refrescar detalle est:', e);
            } finally {
                setDetailLoading(false);
            }
        } else if (detailKind === 'sede' && selectedRed) {
            setDetailLoading(true);
            try {
                const res = await organigramaService.getSedeDetalle(
                    selectedRed.codigoRed,
                    selectedMicrored?.codigoMicrored,
                    accessFilters.codigoDisa,
                );
                if (res.success) setSedeDetalle(res.data);
            } catch (e) {
                console.error('Error al refrescar detalle sede:', e);
            } finally {
                setDetailLoading(false);
            }
        }
    }, [detailKind, selectedEst, selectedRed, selectedMicrored, accessFilters.codigoDisa]);

    // ─── Stats ───────────────────────────────────────────────────────────────────
    const totalEstablecimientos = useMemo(
        () => tree.reduce((sum, r) => sum + r.totalEstablecimientos, 0),
        [tree]
    );


    return {
        tree,
        loading,
        error,
        totalEstablecimientos,

        // Drill-down
        currentView,
        currentItems,
        establecimientosSinMicrored,
        selectedRed,
        selectedMicrored,
        enterRed,
        enterMicrored,
        goBack,
        goToRed,
        goToRoot,

        // Panel derecho
        detailKind,
        selectedEst,
        estDetalle,
        sedeDetalle,
        detailLoading,
        selectEst,
        selectSede,
        refreshDetail,
        clearDetail,

        // Access
        accessFilters,
        isEstablishmentLevel,
        isDiresaLevel,
        isRedLevel,
        isMicroredLevel,

        pageBreadcrumb,
    };
}
