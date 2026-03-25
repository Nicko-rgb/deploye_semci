import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FileText, 
    ArrowLeft, 
    Calendar, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    Download,
    User,
    Building2,
    Briefcase,
    MessageSquare,
    History,
    Filter
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import { useSubmodulePermissions } from '../../../core';
import { licenciaService } from '../services/licenciaService';
import { employeeService } from '../services/employeeService';
import type { Licencia, VacationBalance } from '../types/licencia.types';
import type { EmployeeDetail } from '../types';

interface LicenciaResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export default function LicenciaHistory() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const breadcrumb = useAppBreadcrumb([
        { label: 'Licencias', to: '/home/rrhh/licencias'},
        'Historial',
    ]);

    const { canDownload } = useSubmodulePermissions({
        submoduleName: 'Licencias',
        applicationCode: 'RRHH',
    });
    
    const [history, setHistory] = useState<Licencia[]>([]);
    const [vacations, setVacations] = useState<VacationBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<EmployeeDetail | null>(null);

    // Filtros de fecha
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            if (!employeeId) return;
            setLoading(true);
            try {
                const [historyRes, vacationsRes, employeeRes] = await Promise.all([
                    licenciaService.getHistory(Number(employeeId), { month: selectedMonth, year: selectedYear }) as Promise<LicenciaResponse<Licencia[]>>,
                    licenciaService.getVacations(Number(employeeId)) as Promise<LicenciaResponse<VacationBalance>>,
                    employeeService.getEmployee(employeeId)
                ]);

                if (historyRes.success) {
                    setHistory(historyRes.data);
                }
                if (vacationsRes.success) {
                    setVacations(vacationsRes.data);
                }
                if (employeeRes.success) {
                    setEmployee(employeeRes.data);
                }
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [employeeId, selectedMonth, selectedYear]);

    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            'EMITIDO_JEFE': 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
            'APROBADO_RRHH': 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
            'RECHAZADO_RRHH': 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
            'OBSERVADO': 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
        };
        return styles[status] || 'bg-gray-50 text-gray-700 border-gray-100';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APROBADO_RRHH': return <CheckCircle className="w-4 h-4" />;
            case 'RECHAZADO_RRHH': return <XCircle className="w-4 h-4" />;
            case 'OBSERVADO': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Historial de Licencias"
                description="Detalle completo de solicitudes y vacaciones"
                icon={History}
                color="#3B82F6"
                breadcrumb={breadcrumb}
                actions={[
                    {
                        label: 'Volver',
                        icon: ArrowLeft,
                        variant: 'secondary',
                        onClick: () => navigate('/home/rrhh/licencias')
                    }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información del Empleado y Vacaciones */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shadow-inner">
                                <User className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {employee?.firstName} {employee?.lastNamePaternal} {employee?.lastNameMaternal}
                                </h3>
                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{employee?.documentNumber}</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="flex items-center gap-3 text-sm">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Establecimiento:</span>
                                <span className="text-gray-900 dark:text-white font-bold ml-auto truncate max-w-[150px]">{employee?.establishment?.nombreEstablecimiento || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Profesión:</span>
                                <span className="text-gray-900 dark:text-white font-bold ml-auto">{employee?.profession?.description || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Régimen:</span>
                                <span className="text-gray-900 dark:text-white font-bold ml-auto">{employee?.laboralRegime?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <History className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Condición:</span>
                                <span className="text-gray-900 dark:text-white font-bold ml-auto">{employee?.condicionLaboral?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard de Vacaciones */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="w-5 h-5 opacity-80" />
                            <h4 className="text-xs font-black uppercase tracking-widest">Balance de Vacaciones</h4>
                        </div>
                        
                        {vacations ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Días Pendientes</p>
                                        <p className="text-4xl font-black">{vacations.remaining_days}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Días Gozados</p>
                                        <p className="text-xl font-black">{vacations.used_days}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase">
                                        <span>Progreso de Uso</span>
                                        <span>{Math.round((vacations.used_days / vacations.total_entitled) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-white h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${(vacations.used_days / vacations.total_entitled) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                
                                <p className="text-[10px] font-medium opacity-60 text-center italic">
                                    * Basado en un total de {vacations.total_entitled} días anuales.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm opacity-70 text-center py-4">No hay datos de vacaciones</p>
                        )}
                    </div>
                </div>

                {/* Listado Detallado de Licencias */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Historial de Solicitudes ({history.length})
                        </h4>

                        {/* Filtros de Mes y Año */}
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <Filter className="w-4 h-4 text-gray-400 ml-1" />
                            <select 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="text-xs font-bold bg-transparent outline-none text-gray-700 dark:text-gray-300 border-none focus:ring-0 p-1"
                            >
                                <option value={1}>ENERO</option>
                                <option value={2}>FEBRERO</option>
                                <option value={3}>MARZO</option>
                                <option value={4}>ABRIL</option>
                                <option value={5}>MAYO</option>
                                <option value={6}>JUNIO</option>
                                <option value={7}>JULIO</option>
                                <option value={8}>AGOSTO</option>
                                <option value={9}>SEPTIEMBRE</option>
                                <option value={10}>OCTUBRE</option>
                                <option value={11}>NOVIEMBRE</option>
                                <option value={12}>DICIEMBRE</option>
                            </select>
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="text-xs font-bold bg-transparent outline-none text-gray-700 dark:text-gray-300 border-none focus:ring-0 p-1"
                            >
                                {[...Array(5)].map((_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-700">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No se registraron licencias previas</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((licencia) => (
                                <div 
                                    key={licencia.licencia_id} 
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
                                >
                                    {/* Cabecera de la Tarjeta */}
                                    <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">
                                                    {licencia.tipo?.name}
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-1 font-bold">ID: #{licencia.licencia_id}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 border ${getStatusStyle(licencia.status)}`}>
                                            {getStatusIcon(licencia.status)}
                                            {licencia.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    {/* Cuerpo de la Tarjeta */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Periodo</p>
                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            {licencia.startDate} al {licencia.endDate}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Duración Total</p>
                                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{licencia.totalDays} Días</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                                                        <MessageSquare className="w-3 h-3" />
                                                        Motivo de Solicitud
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                                        "{licencia.reason || 'Sin motivo especificado'}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sección de Respuesta (Si existe) */}
                                        {(licencia.status === 'RECHAZADO_RRHH' || licencia.status === 'OBSERVADO' || (licencia as any).responseComments) && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                                <div className={`rounded-xl p-4 border ${
                                                    licencia.status === 'RECHAZADO_RRHH' ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 
                                                    'bg-yellow-50/50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30'
                                                }`}>
                                                    <p className="text-[10px] font-black uppercase mb-2 flex items-center gap-1.5 text-gray-500">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Respuesta de RRHH
                                                    </p>
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">
                                                        {(licencia as any).responseComments || 'No se proporcionaron comentarios adicionales.'}
                                                    </p>
                                                    
                                                    {canDownload && (licencia as any).responseAttachmentUrl && (
                                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                                                            <Download className="w-3 h-3" />
                                                            Descargar Documento Adjunto
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
