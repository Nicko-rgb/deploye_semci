import { useState, useEffect, useCallback } from 'react';
import { Search, X, User as UserIcon, Building2, Loader2, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';
import { InputText, Select } from '../FormComponents';
import { employeeService } from '../../services/employeeService';
import { commonService } from '../../services/commonService';
import type { EmployeeSummary } from '../../types';
import type { OficinaDireccionItem } from '../../types/catalog.types';
import type { JefeProfesionScope } from './JefeProfesion';
import { notify } from '../../../../core/utils/Notify';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CrearOficinaProps {
    /** Scope del panel para filtrar la búsqueda de empleados según nivel de acceso */
    scope: JefeProfesionScope;
    onClose: () => void;
    onSuccess: () => void;
}

// ─── CrearOficina ─────────────────────────────────────────────────────────────

/**
 * Modal para asignar una oficina/dirección a un empleado.
 * Flujo: buscar empleado → seleccionar empleado → seleccionar oficina → guardar.
 */
export function CrearOficina({ scope, onClose, onSuccess }: CrearOficinaProps) {
    // ── Búsqueda de empleados ──────────────────────────────────────────────────
    const [searchTerm, setSearchTerm]       = useState('');
    const [searching, setSearching]         = useState(false);
    const [searchError, setSearchError]     = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<EmployeeSummary[]>([]);

    // ── Empleado y oficina seleccionados ──────────────────────────────────────
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummary | null>(null);
    const [selectedOfficeId, setSelectedOfficeId] = useState('');

    // ── Catálogo de oficinas ───────────────────────────────────────────────────
    const [officeOptions, setOfficeOptions]         = useState<{ value: string; label: string }[]>([]);
    const [loadingOffices, setLoadingOffices]       = useState(false);

    // ── Estado del guardado ────────────────────────────────────────────────────
    const [saving, setSaving]       = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Cargar catálogo de oficinas al montar
    useEffect(() => {
        setLoadingOffices(true);
        commonService.getOficinasDirecciones()
            .then(res => {
                // Convertir a formato { value, label } que requiere Select
                const opts = res.data.map((o: OficinaDireccionItem) => ({
                    value: String(o.oficina_direccion_id),
                    label: o.name,
                }));
                setOfficeOptions(opts);
            })
            .catch(() => setOfficeOptions([]))
            .finally(() => setLoadingOffices(false));
    }, []);

    /**
     * Busca empleados por término dentro del scope del panel.
     * Se dispara al enviar el formulario (igual que en Licencias).
     */
    const handleSearch = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setSearching(true);
        setSearchError(null);
        setSearchResults([]);
        try {
            // Ajustar parámetros según el ámbito (Sede Red, Sede Microred o Establecimiento)
            const searchParams: any = {
                search:         searchTerm.trim(),
                codigoDisa:     scope.codigoDisa,
                codigoRed:      scope.codigoRed,
                limit: 20,
            };

            if (scope.codigoUnico) {
                // Ámbito Establecimiento: buscar solo en este establecimiento
                searchParams.codigoUnico = scope.codigoUnico;
                searchParams.codigoMicrored = scope.codigoMicrored;
            } else if (scope.codigoMicrored) {
                // Ámbito Sede Microred: buscar personal que no tiene establecimiento (SOLO MICRORED)
                searchParams.codigoMicrored = scope.codigoMicrored;
                searchParams.codigoUnico = 'SOLO MICRORED';
            } else {
                // Ámbito Sede Red: buscar personal que no tiene ni microred ni establecimiento (SOLO RED)
                searchParams.codigoMicrored = 'SOLO RED';
            }

            const res = await employeeService.getEmployees(searchParams);
            if (res.data.length === 0) {
                setSearchError('No se encontraron empleados con ese criterio.');
            } else {
                setSearchResults(res.data);
            }
        } catch {
            setSearchError('Error al buscar empleados. Intente nuevamente.');
        } finally {
            setSearching(false);
        }
    }, [searchTerm, scope]);

    /** Selecciona un empleado y limpia resultados de búsqueda */
    const handleSelectEmployee = (emp: EmployeeSummary) => {
        setSelectedEmployee(emp);
        setSearchResults([]);
        setSearchTerm('');
        setSearchError(null);
        // Pre-seleccionar la oficina actual del empleado si tiene una
        setSelectedOfficeId('');
    };

    /** Guarda la asignación de oficina al empleado seleccionado */
    const handleSave = async () => {
        if (!selectedEmployee || !selectedOfficeId) return;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await employeeService.updateEmployee(String(selectedEmployee.employee_id), {
                oficinaDireccionId: Number(selectedOfficeId),
            });
            notify('success', res.message || 'Empleado asignado a la oficina correctamente.');
            onSuccess();
        } catch (err: any) {
            setSaveError(err?.response?.data?.message ?? err?.message ?? 'Error al guardar');
            notify('error', err?.response?.data?.message ?? err?.message ?? 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const canSave = selectedEmployee !== null && selectedOfficeId !== '' && !saving;

    /** Quita la oficina actual del empleado seleccionado (oficinaDireccionId → null) */
    const handleRemoveOficina = async () => {
        if (!selectedEmployee) return;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await employeeService.updateEmployee(String(selectedEmployee.employee_id), {
                oficinaDireccionId: null,
            });
            notify('success', res.message || 'Oficina removida correctamente.');
            onSuccess();
        } catch (err: any) {
            setSaveError(err?.response?.data?.message ?? err?.message ?? 'Error al quitar la oficina');
            notify('error', err?.response?.data?.message ?? err?.message ?? 'Error al quitar la oficina');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col">

                {/* Header ─────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-500" />
                        <h2 className="text-[14px] font-bold text-purple-500 dark:text-gray-100">
                            Asignar oficina a empleado
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body — sin overflow para que el Select pueda desplegarse libremente */}
                <div className="px-5 py-5 space-y-5">

                    {/* ── Paso 1: Buscar empleado ──────────────────────────────── */}
                    <section>
                        <p className="text-[11px] font-bold uppercase text-gray-400 mb-3 tracking-wide">
                            1. Buscar empleado
                        </p>

                        <form onSubmit={handleSearch}>
                            <div className="flex items-center gap-2">
                                <InputText
                                    label="Buscar por DNI o nombres"
                                    name="searchTerm"
                                    value={searchTerm}
                                    onChange={e => { setSearchTerm(e.target.value); setSelectedEmployee(null); }}
                                    Icon={Search}
                                    variant="variant2"
                                    color="purple"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={searching || !searchTerm.trim()}
                                    className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-[13px] flex items-center h-[42px] shrink-0"
                                >
                                    {searching ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </form>

                        {/* Error de búsqueda */}
                        {searchError && (
                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-[12px] flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {searchError}
                            </div>
                        )}

                        {/* Resultados de búsqueda */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                {searchResults.map(emp => (
                                    <div
                                        key={emp.employee_id}
                                        onClick={() => handleSelectEmployee(emp)}
                                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition-all group bg-white dark:bg-gray-800/50 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                                    {emp.fullName}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    DNI: {emp.documentNumber}
                                                    {emp.profession && ` · ${emp.profession}`}
                                                </p>
                                                {emp.oficinaDireccion && (
                                                    <p className="text-[11px] text-purple-500 font-medium">
                                                        {emp.oficinaDireccion}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-[12px] text-gray-400 group-hover:text-blue-500 flex items-center gap-1 font-bold shrink-0">
                                            Seleccionar <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empleado seleccionado */}
                        {selectedEmployee && (
                            <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                        <UserIcon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-bold text-blue-700 dark:text-blue-300 truncate">
                                            {selectedEmployee.fullName}
                                        </p>
                                        {selectedEmployee.oficinaDireccion && (
                                            <p className="text-[12px] font-medium text-blue-400">
                                                Oficina actual: {selectedEmployee.oficinaDireccion}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedEmployee(null)}
                                    className="text-blue-400 hover:text-blue-600 shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* ── Paso 2: Seleccionar oficina ──────────────────────────── */}
                    <section>
                        <p className="text-[11px] font-bold uppercase text-gray-400 mb-3 tracking-wide">
                            2. Seleccionar oficina / dirección
                        </p>

                        {loadingOffices ? (
                            <div className="flex items-center gap-2 text-gray-400 text-[12px]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Cargando oficinas…
                            </div>
                        ) : (
                            <Select
                                label="Oficina / Dirección"
                                name="oficina"
                                value={selectedOfficeId}
                                options={officeOptions}
                                onChange={e => setSelectedOfficeId(e.target.value)}
                                disabled={!selectedEmployee}
                                color="purple"
                            />
                        )}
                    </section>

                    {/* Error de guardado */}
                    {saveError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-[12px] flex items-center gap-2 border border-red-100">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {saveError}
                        </div>
                    )}
                </div>

                {/* Footer ──────────────────────────────────────────────────────── */}
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">

                    {/* Quitar de oficina — solo visible si el empleado ya tiene una asignada */}
                    {selectedEmployee?.oficinaDireccion ? (
                        <button
                            type="button"
                            onClick={handleRemoveOficina}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Quitar de {selectedEmployee.oficinaDireccion}
                        </button>
                    ) : (
                        <span />
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold transition-colors
                                ${canSave
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
