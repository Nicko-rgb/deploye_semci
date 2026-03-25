import { useEffect, useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import type { EmployeeListDTO } from '../../../types/network.types';
import { NetworkService } from '../../../services/network.service';

interface ViewAsistencialProps {
    isOpen: boolean;
    onClose: () => void;
    filters: {
        codigo_red: string;
        codigo_microred?: string;
        codigo_unico?: string;
        profession_name?: string;
        regime_name?: string;
        occupational_group?: string;
        personnel_type?: string;
        year?: number;
        month?: number;
        labor_condition_name?: string;
        distrito?: string;
    };
    title: string;
}

export const ViewAsistencial = ({ isOpen, onClose, filters, title }: ViewAsistencialProps) => {
    const [employees, setEmployees] = useState<EmployeeListDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        } else {
            setEmployees([]);
            setError(null);
        }
    }, [isOpen, filters]);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await NetworkService.getEmployeesList(
                filters.codigo_red,
                filters.codigo_microred,
                filters.codigo_unico,
                filters.profession_name,
                filters.regime_name,
                filters.occupational_group,
                filters.personnel_type,
                filters.year,
                filters.month,
                filters.labor_condition_name,
                1000, // Aumentamos el límite para ver todos los registros del dashboard
                filters.distrito
            );
            setEmployees(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar la lista de empleados');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-full h-full max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">{title}</h2>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400">{loading ? 'Cargando...' : `${employees?.length || 0} registros encontrados`}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-red-500">
                            {error}
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto sm:rounded-sm border dark:border-slate-700">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-600 dark:text-gray-200 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-3 py-3">N° Doc</th>
                                        <th scope="col" className="px-3 py-3">Apellidos y Nombres</th>
                                        <th scope="col" className="px-3 py-3">Profesión</th>
                                        <th scope="col" className="px-3 py-3">Régimen</th>
                                        <th scope="col" className="px-3 py-3">Condición</th>
                                        <th scope="col" className="px-3 py-3 min-w-[300px]">Establecimiento</th>
                                        <th scope="col" className="px-3 py-3">Grupo Ocupacional</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees && employees.length > 0 ? (
                                        employees.map((emp, index) => {
                                            // Normalizar campos para manejar tanto el DTO antiguo como el nuevo de RRHH
                                            const docNum = emp.documentNumber || emp.document_number;
                                            const name = emp.fullName || emp.full_name;
                                            const reg = emp.laborRegime || emp.regime;
                                            const cond = emp.laborCondition || emp.labor_condition;
                                            const group = emp.occupationalGroup || emp.occupational_group;

                                            return (
                                                <tr key={emp.employee_id || index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-600">
                                                    <td className="px-3 py-2 text-[13px] font-medium text-gray-900 whitespace-nowrap dark:text-white">{docNum}</td>
                                                    <td className="px-3 py-2 text-[13px] font-medium text-gray-900 dark:text-white">{name}</td>
                                                    <td className="px-3 py-2 text-[13px] ">{emp.profession || '------'}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                            ${reg?.includes('CAS') ? 'bg-blue-100 text-blue-800' : 
                                                              reg?.includes('276') ? 'bg-green-100 text-green-800' : 
                                                              'bg-orange-100 text-orange-800'}`}>
                                                            {reg || '------'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-[13px] ">{cond} </td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-medium text-[13px] leading-tight text-slate-700 dark:text-slate-200">{emp.establishment}</span>
                                                            {emp.is_rotated && emp.origin_establishment && (
                                                                <div className="flex items-center gap-1 text-[11px] leading-tight text-orange-600 dark:text-orange-400 font-semibold uppercase">
                                                                    <ArrowRightLeft size={10} />
                                                                    <span>ROTADO — origen: {emp.origin_establishment}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-[13px]">{group}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                No se encontraron registros para los filtros seleccionados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
