/**
 * VerEmpleados — Modal que lista los empleados de una oficina o grupo de profesión.
 * Muestra: nombre completo, DNI, descripción de profesión y condición laboral.
 */

import { useEffect, useState } from 'react';
import { X, Loader2, Users, AlertTriangle } from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import type { JefeProfesionScope } from './JefeProfesion';
import type { EmployeeSummary } from '../../types';

interface VerEmpleadosProps {
    /** Título que se muestra en el encabezado del modal */
    title: string;
    /** Scope de acceso (red, microred, establecimiento, disa) */
    scope: JefeProfesionScope;
    /** Filtra empleados por oficina/dirección (tab Oficinas) */
    oficinaDireccionId?: number;
    /** Filtra empleados por grupo de profesión (tab Profesiones), mapeado a professionName en el backend */
    grupo?: string;
    onClose: () => void;
}

export function VerEmpleados({ title, scope, oficinaDireccionId, grupo, onClose }: VerEmpleadosProps) {

    const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState<string | null>(null);

    // Carga los empleados al montar el modal ───────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const fetchEmployees = async () => {
            try {
                setLoading(true);
                setError(null);

                // Ajustar parámetros según el ámbito (Sede Red, Sede Microred o Establecimiento)
                const searchParams: any = {
                    codigoDisa:     scope.codigoDisa,
                    codigoRed:      scope.codigoRed,
                    limit: 200,
                    page: 1,
                    // Para oficina: filtrar por id de oficina
                    ...(oficinaDireccionId !== undefined ? { oficinaDireccionId } : {}),
                    // Para grupo de profesión: reutilizar professionName que el backend mapea a Profession.grupo
                    ...(grupo ? { professionName: grupo } : {}),
                };

                if (scope.codigoUnico) {
                    searchParams.codigoUnico = scope.codigoUnico;
                    searchParams.codigoMicrored = scope.codigoMicrored;
                } else if (scope.codigoMicrored) {
                    searchParams.codigoMicrored = scope.codigoMicrored;
                    searchParams.codigoUnico = 'SOLO MICRORED';
                } else {
                    searchParams.codigoMicrored = 'SOLO RED';
                }

                const res = await employeeService.getEmployees(searchParams);

                if (!cancelled) {
                    setEmployees(res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError('No se pudo cargar la lista de empleados.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchEmployees();

        // Cleanup para evitar actualizaciones en componentes desmontados
        return () => { cancelled = true; };
    }, [oficinaDireccionId, grupo, scope]);

    return (
        // Overlay ─────────────────────────────────────────────────────────────
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-max max-w-[90vw] min-w-[360px] mx-4 flex flex-col max-h-[80vh]">

                {/* Encabezado */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <p className="text-[13px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">{title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                </div>

                {/* Cuerpo */}
                <div className="flex-1 overflow-y-auto px-4 py-3">

                    {/* Estado de carga */}
                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Cargando empleados...</span>
                        </div>
                    )}

                    {/* Estado de error */}
                    {!loading && error && (
                        <div className="flex items-center gap-2 text-red-500 py-6 justify-center text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Lista vacía */}
                    {!loading && !error && employees.length === 0 && (
                        <p className="text-center text-[13px] text-gray-400 py-8">
                            No hay empleados registrados en esta sección.
                        </p>
                    )}

                    {/* Tabla de empleados — sin wrap para que todo quede en una línea */}
                    {!loading && !error && employees.length > 0 && (
                        <table className="text-[12px] whitespace-nowrap">
                            <thead>
                                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                    <th className="pb-2 pr-6 font-semibold text-gray-500 dark:text-gray-400 text-[11px] uppercase">Nombre</th>
                                    <th className="pb-2 pr-6 font-semibold text-gray-500 dark:text-gray-400 text-[11px] uppercase">DNI</th>
                                    <th className="pb-2 pr-6 font-semibold text-gray-500 dark:text-gray-400 text-[11px] uppercase">Profesión</th>
                                    <th className="pb-2 font-semibold text-gray-500 dark:text-gray-400 text-[11px] uppercase">Condición</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                {employees.map(emp => (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="py-1.5 pr-6 font-medium text-gray-800 dark:text-gray-200">{emp.fullName}</td>
                                        <td className="py-1.5 pr-6 text-gray-500 dark:text-gray-400 font-mono">{emp.documentNumber}</td>
                                        <td className="py-1.5 pr-6 text-gray-600 dark:text-gray-300">{emp.profession ?? '—'}</td>
                                        <td className="py-1.5">
                                            <span className="inline-block px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-semibold">
                                                {emp.laborCondition ?? '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pie: total de resultados */}
                {!loading && !error && employees.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-400 text-right">
                        {employees.length} empleado{employees.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
}
