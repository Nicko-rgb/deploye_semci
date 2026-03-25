import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAccessLevel } from '../hooks/useAccessLevel';
import hierarchyService from '../services/hierarchyService';
import type { RedItem, MicroredItem, EstablecimientoItem } from '../services/hierarchyService';
import { Select } from '../../modules/recursos-humanos/components/FormComponents';

// ──────────────────────────────────────────────
// Tipos públicos
// ──────────────────────────────────────────────

export interface HierarchySelection {
    codigoRed: string | null;
    nomRed: string | null;
    codigoMicrored: string | null;
    nomMicrored: string | null;
    codigoUnico: string | null;
    nombreEstablecimiento: string | null;
}

export interface RedLevelAccessProps {
    /** Callback que se dispara cada vez que cambia la selección */
    onChange: (selection: HierarchySelection) => void;
    /** Mostrar el selector de microred (default: true) */
    showMicrored?: boolean;
    /** Mostrar el selector de establecimiento (default: true) */
    showEstablecimiento?: boolean;
    /** Deshabilitar toda interacción */
    disabled?: boolean;
    /** Clases CSS adicionales para el contenedor */
    className?: string;
    /** Labels personalizados */
    labels?: {
        red?: string;
        microred?: string;
        establecimiento?: string;
    };
}

const PadlockIcon = () => (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

// ──────────────────────────────────────────────
// Componente
// ──────────────────────────────────────────────

export default function RedLevelAccess({
    onChange,
    showMicrored = true,
    showEstablecimiento = true,
    disabled = false,
    className = '',
    labels = {},
}: RedLevelAccessProps) {
    const {
        codigoDisa,
        codigoRed,
        codigoMicrored,
        codigoUnico,
        isMicroredLevel,
        isEstablishmentLevel,
    } = useAccessLevel();

    // ── Listas de datos ──────────────────────────
    const [redes, setRedes] = useState<RedItem[]>([]);
    const [microredes, setMicroredes] = useState<MicroredItem[]>([]);
    const [establecimientos, setEstablecimientos] = useState<EstablecimientoItem[]>([]);

    // ── Estados de carga ─────────────────────────
    const [loadingRedes, setLoadingRedes] = useState(false);
    const [loadingMicroredes, setLoadingMicroredes] = useState(false);
    const [loadingEst, setLoadingEst] = useState(false);

    // ── Selecciones actuales ─────────────────────
    const [selectedRed, setSelectedRed] = useState<RedItem | null>(null);
    const [selectedMicrored, setSelectedMicrored] = useState<MicroredItem | null>(null);
    const [selectedEst, setSelectedEst] = useState<EstablecimientoItem | null>(null);

    // ── Opciones para Selects ────────────────────
    const redOptions = useMemo(() => {
        const base = redes.map(r => ({ value: r.codigo_red, label: r.nom_red }));
        return [{ value: '', label: loadingRedes ? 'Cargando redes...' : '— Todas las redes —' }, ...base];
    }, [redes, loadingRedes]);

    const microredOptions = useMemo(() => {
        const base = microredes.map(m => ({ value: m.codigo_microred, label: m.nom_microred }));
        const options = [{
            value: '',
            label: !selectedRed ? '— Seleccione una red —' : (loadingMicroredes ? 'Cargando microredes...' : '— Todas las microredes —')
        }, ...base];

        if (selectedRed && !loadingMicroredes) {
            options.splice(1, 0, { value: 'SOLO RED', label: '— SOLO SEDE RED —' });
        }
        return options;
    }, [microredes, selectedRed, loadingMicroredes]);

    const estOptions = useMemo(() => {
        const base = establecimientos.map(e => ({ value: e.codigo_unico, label: e.nombre_establecimiento }));
        const options = [{
            value: '',
            label: !selectedMicrored ? '— Seleccione una microred —' : (loadingEst ? 'Cargando establecimientos...' : '— Todos los establecimientos —')
        }, ...base];

        if (selectedMicrored && selectedMicrored.codigo_microred !== 'SOLO RED' && !loadingEst) {
            options.splice(1, 0, { value: 'SOLO MICRORED', label: '— SOLO SEDE MICRORED —' });
        }
        return options;
    }, [establecimientos, selectedMicrored, loadingEst]);

    // Ref para comparar y evitar emitir onChange con valores idénticos
    const prevEmittedRef = useRef<string>('');

    // ── Emitir cambio ────────────────────────────
    const emitChange = useCallback(
        (red: RedItem | null, microred: MicroredItem | null, est: EstablecimientoItem | null) => {
            const selection: HierarchySelection = {
                codigoRed: red?.codigo_red ?? null,
                nomRed: red?.nom_red ?? null,
                codigoMicrored: microred?.codigo_microred ?? null,
                nomMicrored: microred?.nom_microred ?? null,
                codigoUnico: est?.codigo_unico ?? null,
                nombreEstablecimiento: est?.nombre_establecimiento ?? null,
            };
            const key = JSON.stringify(selection);
            if (prevEmittedRef.current !== key) {
                prevEmittedRef.current = key;
                onChange(selection);
            }
        },
        [onChange]
    );

    // ── Efecto: cargar redes al montar ───────────
    useEffect(() => {
        let cancelled = false;
        setLoadingRedes(true);

        hierarchyService
            .getRedes(codigoDisa ?? undefined)
            .then((data) => {
                if (cancelled) return;
                setRedes(data);
                setLoadingRedes(false);

                // Si el usuario tiene red fija, auto-seleccionarla
                if (codigoRed) {
                    const found = data.find((r) => r.codigo_red === codigoRed) ?? null;
                    setSelectedRed(found);
                }
            })
            .catch(() => {
                if (!cancelled) setLoadingRedes(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo al montar; el user no cambia en sesión

    // ── Efecto: cargar microredes cuando cambia la red ───
    useEffect(() => {
        if (!selectedRed) {
            setMicroredes([]);
            setSelectedMicrored(null);
            setEstablecimientos([]);
            setSelectedEst(null);
            return;
        }

        let cancelled = false;
        setLoadingMicroredes(true);

        hierarchyService
            .getMicrorredesByRed(selectedRed.codigo_red, codigoDisa ?? undefined)
            .then((data) => {
                if (cancelled) return;
                setMicroredes(data);
                setLoadingMicroredes(false);

                // Si el usuario tiene microred fija, auto-seleccionarla
                if (codigoMicrored) {
                    const found = data.find((m) => m.codigo_microred === codigoMicrored) ?? null;
                    setSelectedMicrored(found);
                }
            })
            .catch(() => {
                if (!cancelled) setLoadingMicroredes(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRed?.codigo_red]);

    // ── Efecto: cargar establecimientos cuando cambia la microred ───
    useEffect(() => {
        if (!selectedRed || !selectedMicrored || selectedMicrored.codigo_microred === 'SOLO RED') {
            setEstablecimientos([]);
            setSelectedEst(null);
            return;
        }

        let cancelled = false;
        setLoadingEst(true);

        hierarchyService
            .getEstablecimientosByMicrored(selectedRed.codigo_red, selectedMicrored.codigo_microred, codigoDisa ?? undefined)
            .then((data) => {
                if (cancelled) return;
                setEstablecimientos(data);
                setLoadingEst(false);

                // Si el usuario tiene establecimiento fijo, auto-seleccionarlo
                if (codigoUnico) {
                    const found = data.find((e) => e.codigo_unico === codigoUnico) ?? null;
                    setSelectedEst(found);
                }
            })
            .catch(() => {
                if (!cancelled) setLoadingEst(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRed?.codigo_red, selectedMicrored?.codigo_microred]);

    // ── Efecto: emitir onChange cuando la selección cambia ───
    useEffect(() => {
        emitChange(selectedRed, selectedMicrored, selectedEst);
    }, [selectedRed, selectedMicrored, selectedEst, emitChange]);

    // ── Flags de bloqueo según nivel de acceso ───
    const isRedLocked = codigoRed !== null;
    const isMicroredLocked = isMicroredLevel || isEstablishmentLevel;
    const isEstLocked = isEstablishmentLevel;

    // ── Handlers de usuario ──────────────────────
    const handleRedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const found = redes.find((r) => r.codigo_red === e.target.value) ?? null;
        setSelectedRed(found);
        setSelectedMicrored(null);
        setSelectedEst(null);
    };

    const handleMicroredChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'SOLO RED') {
            setSelectedMicrored({
                codigo_microred: 'SOLO RED',
                nom_microred: 'SOLO RED',
                codigo_red: selectedRed?.codigo_red || ''
            } as any);
        } else {
            const found = microredes.find((m) => m.codigo_microred === val) ?? null;
            setSelectedMicrored(found);
        }
        setSelectedEst(null);
    };

    const handleEstChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'SOLO MICRORED') {
            setSelectedEst({
                codigo_unico: 'SOLO MICRORED',
                nombre_establecimiento: 'SOLO MICRORED',
                codigo_red: selectedRed?.codigo_red || '',
                codigo_microred: selectedMicrored?.codigo_microred || ''
            } as any);
        } else {
            const found = establecimientos.find((es) => es.codigo_unico === val) ?? null;
            setSelectedEst(found);
        }
    };

    // ── Render ────────────────────────────────────
    return (
        <div className={`flex flex-wrap gap-3 w-full items-end ${className}`}>

            {/* ── RED ── */}
            <div className="flex flex-col min-w-[180px] flex-1">
                <Select
                    label={labels.red ?? 'Red'}
                    name="codigoRed"
                    value={selectedRed?.codigo_red ?? ''}
                    options={redOptions}
                    onChange={handleRedChange}
                    disabled={disabled || isRedLocked || loadingRedes}
                    Icon={isRedLocked ? PadlockIcon : undefined}
                />
            </div>

            {/* ── MICRORED ── */}
            {showMicrored && (
                <div className="flex flex-col min-w-[180px] flex-1">
                    <Select
                        label={labels.microred ?? 'Microred'}
                        name="codigoMicrored"
                        value={selectedMicrored?.codigo_microred ?? ''}
                        options={microredOptions}
                        onChange={handleMicroredChange}
                        disabled={disabled || isMicroredLocked || !selectedRed || loadingMicroredes}
                        Icon={isMicroredLocked ? PadlockIcon : undefined}
                    />
                </div>
            )}

            {/* ── ESTABLECIMIENTO ── */}
            {showEstablecimiento && (
                <div className="flex flex-col min-w-[220px] flex-1">
                    <Select
                        label={labels.establecimiento ?? 'Establecimiento'}
                        name="codigoUnico"
                        value={selectedEst?.codigo_unico ?? ''}
                        options={estOptions}
                        onChange={handleEstChange}
                        disabled={disabled || isEstLocked || !selectedMicrored || loadingEst}
                        Icon={isEstLocked ? PadlockIcon : undefined}
                    />
                </div>
            )}

        </div>
    );
}
