import { ArrowLeft, User, Building2, MapPin, Calendar, RefreshCw, AlertCircle, FileDownIcon, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRotation } from '../hooks/useRotation';
import PageHeader from '../../../core/components/PageHeader';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import { useSubmodulePermissions } from '../../../core';

export default function RotationHistory() {
    const { employeeId } = useParams<{ employeeId: string }>();
    const navigate = useNavigate();
    const breadcrumb = useAppBreadcrumb([
        { label: 'Rotaciones', to: '/home/rrhh/rotation' },
        { label: 'Historial', to: '' }
    ]);

    const { canDownload } = useSubmodulePermissions({
        submoduleName: 'Rotación',
        applicationCode: 'RRHH',
    });

    const {
        history,
        loadingHistory,
        fetchHistory,
        handleDownloadDoc,
        downloadingId,
        formatDate,
        getStatusConfig
    } = useRotation();

    useEffect(() => {
        if (employeeId) {
            fetchHistory(parseInt(employeeId));
        }
    }, [employeeId, fetchHistory]);

    // Obtener la información del empleado de la primera rotación si existe
    const firstRotation = history.length > 0 ? (history[0] as any) : null;
    const employee = firstRotation?.employee;

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <PageHeader
                title={`Historial de Rotaciones`}
                description={employee ? employee.fullName : 'Buscando historial...'}
                icon={RefreshCw}
                color="#F97316"
                breadcrumb={breadcrumb}
                badge={{ label: `${history.length} Movimientos` }}
                actions={[
                    {
                        label: 'Volver',
                        icon: ArrowLeft,
                        variant: 'secondary',
                        onClick: () => navigate('/home/rrhh/rotation'),
                    }
                ]}
            />

            {/* Employee Basic Info Card */}
            {!loadingHistory && employee && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <User className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Empleado</p>
                            <p className="font-bold text-gray-900">{employee.fullName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-full">
                            <AlertCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Documento</p>
                            <p className="font-bold text-gray-900">{employee.documentNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 rounded-full">
                            <Building2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Origen Base</p>
                            <p className="font-bold text-gray-900">{firstRotation?.originName || '-'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline of Rotations */}
            <div className="relative">
                {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Cargando historial de rotaciones...</p>
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((rotation, index) => (
                            <div key={rotation.rotation_id} className="relative group">
                                {/* Timeline Line */}
                                {index !== history.length - 1 && (
                                    <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200 group-hover:bg-orange-200 transition-colors z-0" />
                                )}

                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative z-10 hover:border-orange-200 transition-all flex flex-wrap md:flex-nowrap items-center">
                                    {/* Date/Status Column */}
                                    <div className="flex flex-col items-center min-w-[100px]">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 ${rotation.isActive ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                                            <Calendar className={`w-6 h-6 ${rotation.isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${getStatusConfig(rotation).className}`}>
                                            {getStatusConfig(rotation).label}
                                        </span>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">
                                                    Rotación a {rotation.targetLevel === 'RED' ? 'SEDE RED' : rotation.targetLevel === 'MICRORED' ? 'SEDE MICRORED' : 'ESTABLECIMIENTO'}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MapPin className="w-4 h-4 text-orange-500" />
                                                    <span className="text-gray-700 font-medium text-sm">{rotation.targetName}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 font-medium uppercase">Periodo</p>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        {formatDate(rotation.startDate)} - {rotation.endDate ? formatDate(rotation.endDate) : 'Indefinido'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {rotation.description && (
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase">Descripción de rotación:</p>
                                                <p className="text-sm text-gray-600 leading-relaxed italic">"{rotation.description}"</p>
                                            </div>
                                        )}

                                        <div className='flex justify-between items-center'>
                                            {rotation.documentRef ? (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="font-bold">Doc Ref:</span>
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">{rotation.documentRef}</span>
                                                </div>
                                            ) : (<span className="text-sm text-gray-500">No hay documento de referencia</span> )}
                                            {canDownload && (
                                                        <button
                                                            onClick={() => handleDownloadDoc(rotation.rotation_id)}
                                                            disabled={downloadingId === rotation.rotation_id}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-100 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Descargar PDF"
                                                        >
                                                            {downloadingId === rotation.rotation_id ? (
                                                                <>
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    Generando...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileDownIcon className="w-3.5 h-3.5" />
                                                                    PDF
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-xl border border-gray-100 shadow-sm text-center">
                        <RefreshCw className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">Sin historial registrado</h3>
                        <p className="text-gray-500 mt-2">Este empleado no cuenta con movimientos previos registrados en el sistema.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
