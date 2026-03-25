import { useState, useEffect, useMemo } from 'react';
import { Search, User, CheckCircle, Loader2, X, AlertTriangle } from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import type { OrgCandidatoJefe, OrgHead } from '../../types/organigrama.types';
import { InputText } from '../FormComponents';
import { notify } from '../../../../core/utils/Notify'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Scope organizacional para filtrar candidatos */
export interface JefeProfesionScope {
    codigoDisa?: number;
    codigoUnico?: string;    // Establecimiento
    codigoRed?: string;      // Red
    codigoMicrored?: string; // Microred
}

type JefeProfesionProps =
    ({
        mode?: 'profession';
        professionId: number;
        professionName: string;
        groupName?: never;
    } | {
        mode: 'group';
        groupName: string;
        professionId?: never;
        professionName?: never;
    }) & {
        currentHead: OrgHead | null;
        scope: JefeProfesionScope;
        onClose: () => void;
        onSuccess: () => void;
    };

// ─── Modal de asignación de jefe de profesión ─────────────────────────────────

/**
 * Modal que lista los empleados de una profesión en el scope dado,
 * permite buscarlos y seleccionar al nuevo jefe con un radio button.
 */
export function JefeProfesion({
    mode = 'profession',
    professionId,
    professionName,
    groupName,
    currentHead,
    scope,
    onClose,
    onSuccess,
}: JefeProfesionProps) {
    const [candidatos, setCandidatos] = useState<OrgCandidatoJefe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    // El empleado seleccionado para asignar (pre-cargado con el jefe actual si existe)
    const [selected, setSelected] = useState<number | null>(currentHead?.employeeId ?? null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Cargar candidatos al montar el modal ────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        const fetchParams = mode === 'group'
            ? { grupo: groupName!, ...scope }
            : { professionId: professionId!, ...scope };

        employeeService.getCandidatosJefeProfesion(fetchParams as any)
            .then(res => {
                if (!cancelled) setCandidatos(res.data ?? []);
            })
            .catch(() => {
                if (!cancelled) setError('No se pudieron cargar los candidatos.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [mode, professionId, groupName, scope]);

    // Filtrar por buscador (nombre, documento o condición) ───────────────────
    const filtrados = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return candidatos;
        return candidatos.filter(c =>
            c.fullName.toLowerCase().includes(q) ||
            c.documentNumber.includes(q) ||
            c.laborCondition.toLowerCase().includes(q)
        );
    }, [candidatos, search]);

    // Confirmar asignación ────────────────────────────────────────────────────
    async function handleAsignar() {
        if (!selected) return;
        setSaving(true);
        setSaveError(null);
        try {
            const payload = mode === 'group'
                ? { employeeId: selected, grupo: groupName!, ...scope }
                : { employeeId: selected, professionId: professionId!, ...scope };
            const res = await employeeService.asignarJefeProfesion(payload as any);
            notify('success', res.message || 'Jefe de profesión asignado con éxito.');
            onSuccess();
            onClose();
        } catch (err: any) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    }

    // Cambio de selección sin guardar ─────────────────────────────────────────
    const hasChanged = selected !== (currentHead?.employeeId ?? null);

    return (
        // Overlay ─────────────────────────────────────────────────────────────
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

                {/* Header ──────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-1 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[12px] font-bold uppercase tracking-wide text-gray-400">
                                {mode === 'group' ? 'Asignar jefe de grupo de profesión' : 'Asignar jefe de profesión'}
                            </p>
                            {!loading && !error && (
                                <span className="text-[12px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">{filtrados.length} {filtrados.length === 1 ? 'candidato' : 'candidatos'}</span>
                            )}
                        </div>
                        <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 -mt-1">
                            {mode === 'group' ? groupName : professionName}
                        </h2>
                        {currentHead && (
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">Jefe actual: {currentHead.fullName}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Buscador ────────────────────────────────────────────────── */}
                <div className="px-5 pt-3 pb-2 shrink-0">
                    <InputText
                        label='Buscar empleado...'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        type='text'
                        variant='variant2'
                        Icon={Search}
                    />
                </div>

                {/* Lista de candidatos ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-5 pb-2">
                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-[13px]">Cargando empleados...</span>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex items-center gap-2 py-6 text-red-500 text-[13px]">
                            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                        </div>
                    )}

                    {!loading && !error && filtrados.length === 0 && (
                        <p className="text-[13px] text-gray-400 text-center py-8">
                            {search ? 'Sin resultados.' : 'No hay empleados en esta profesión.'}
                        </p>
                    )}

                    {!loading && !error && filtrados.length > 0 && (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filtrados.map(c => {
                                const isSelected = selected === c.employeeId;
                                const isCurrent = currentHead?.employeeId === c.employeeId;
                                return (
                                    <li key={c.employeeId}>
                                        <button
                                            type="button"
                                            onClick={() => setSelected(c.employeeId)}
                                            className={`w-full text-left flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors
                                                ${isSelected
                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {/* Radio circle */}
                                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                                                ${isSelected
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>

                                            {/* Icono empleado */}
                                            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                                <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                            </div>

                                            {/* Nombre y badges */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[13px] font-bold truncate mb-0.5
                                                    ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {c.fullName}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                                        {c.documentNumber}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">•</span>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                                                        {c.laborCondition}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 ml-1">
                                                            <CheckCircle className="w-3 h-3" />Jefe actual
                                                        </span>
                                                    )}
                                                    {c.isProfessionHead && !isCurrent && (
                                                        // Jefe en otro scope (edge case)
                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-1">
                                                            Jefe en otro scope
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer ──────────────────────────────────────────────────── */}
                <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-700 shrink-0 space-y-2">
                    {saveError && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />{saveError}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-[13px] font-semibold rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleAsignar}
                            disabled={!selected || !hasChanged || saving}
                            className="flex-1 px-4 py-2 text-[13px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {saving ? 'Guardando...' : 'Asignar jefe'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
