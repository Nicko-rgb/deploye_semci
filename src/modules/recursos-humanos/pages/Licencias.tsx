import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Plus, Settings, CheckCircle, XCircle, AlertCircle, Search, Calendar,
    User as UserIcon, History, X, Save, FileUp, Info, ChevronRight, Building2
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader';
import { useLicencias } from '../hooks/useLicencias';
import { Select, InputText } from '../components/FormComponents';
import { ResponseModal } from '../components/LicenciaResponseModals';
import { LicenciaConfigModal } from '../components/LicenciaConfigModal';
import RedLevelAccess from '../../../core/components/RedLevelAccess';
import { useSubmodulePermissions } from '../../../core/hooks/useSubmodulePermissions';

/**
 * Página Principal del Módulo de Licencias y Permisos
 */
export default function Licencias() {
    const navigate = useNavigate();
    const {
        licencias,
        tipos,
        loading,
        breadcrumb,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        totalPages,
        statusFilter,
        setStatusFilter,
        // selectedHierarchy,
        setSelectedHierarchy,
        // isMicroredLevel,
        // isEstablishmentLevel,
        isRedLevel,
        isMicroredHead,
        // isEstablishmentHead,
        stats,
        isModalOpen,
        isConfigModalOpen,
        observationModal,
        setObservationModal,
        rejectionModal,
        setRejectionModal,
        step,
        employeeSearchTerm,
        setEmployeeSearchTerm,
        searching,
        searchError,
        searchResults,
        selectedEmployee,
        vacationBalance,
        loadingInfo,
        formData,
        isSubmitting,
        tipoOptions,
        actions
    } = useLicencias();

    // ─── Permisos dinámicos desde el backend ────────────────────────────────
    const { canCreate, canUpdate, canApprove, canReject, hasPermission } = useSubmodulePermissions({
        submoduleName: 'Licencias',
        applicationCode: 'RRHH',
    });

    // Estado local para mostrar errores de validación al crear una licencia
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleCreateLicencia = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        const result = await actions.createLicencia(e as any);
        if (!result?.success && result?.message) {
            setSubmitError(result.message);
        }
    };

    // Detectar si el tipo seleccionado requiere adjunto
    const selectedTipo = tipos.find(t => String(t.tipo_licencia_id) === String(formData.tipoLicenciaId));

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'EMITIDO_JEFE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'APROBADO_MICRORED': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
            'RECHAZADO_MICRORED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'OBSERVADO_MICRORED': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            'APROBADO_RRHH': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'RECHAZADO_RRHH': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'OBSERVADO': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'EMITIDO_JEFE': 'EMITIDO JEFE ESTAB.',
            'APROBADO_MICRORED': 'APROBADO MICRORED',
            'RECHAZADO_MICRORED': 'RECHAZADO MICRORED',
            'OBSERVADO_MICRORED': 'OBSERVADO MICRORED',
            'APROBADO_RRHH': 'APROBADO RRHH',
            'RECHAZADO_RRHH': 'RECHAZADO RRHH',
            'OBSERVADO': 'OBSERVADO',
        };
        return labels[status] || status.replace(/_/g, ' ');
    };

    return (
        <>
            <div className="space-y-3">
                {/* Header Dinámico */}
                <PageHeader
                    title="Gestión de Licencias"
                    description={canUpdate ? "Bandeja de aprobación para la Red de Salud" : "Solicitudes de mi establecimiento"}
                    icon={FileText}
                    color="#9C27B0"
                    breadcrumb={breadcrumb}
                    badge={{ label: `${licencias.length} Licencias` }}
                    actions={[
                        ...(hasPermission('Configurar') || canUpdate ? [{
                            label: 'Configurar Reglas',
                            icon: Settings,
                            variant: 'secondary' as const,
                            onClick: () => actions.openConfigModal(),
                        }] : []),
                        ...(canCreate ? [{
                            label: 'Nueva Solicitud',
                            icon: Plus,
                            variant: 'primary' as const,
                            onClick: () => actions.openModal(),
                        }] : [])
                    ]}
                />

                {/* Dashboard de Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-2">Total</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider leading-none mb-2">Pendientes</p>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.EMITIDO_JEFE}</p>
                    </div>
                    <div className="bg-green-50/50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30 shadow-sm">
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider leading-none mb-2">Aprobadas</p>
                        <p className="text-2xl font-black text-green-600 dark:text-green-400">{stats.APROBADO_RRHH}</p>
                    </div>
                    <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider leading-none mb-2">Rechazadas</p>
                        <p className="text-2xl font-black text-red-600 dark:text-red-400">{stats.RECHAZADO_RRHH}</p>
                    </div>
                    <div className="bg-yellow-50/50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm">
                        <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider leading-none mb-2">Observadas</p>
                        <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{stats.OBSERVADO}</p>
                    </div>
                </div>

                {/* Panel de Filtros Rápidos */}
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                    {/* Búsqueda */}
                    <div className="flex-[2]">
                        <InputText
                            label="Buscar por empleado o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            Icon={Search}
                            variant='variant1'
                        />
                    </div>

                    {/* Selector de Jerarquía Multinivel */}
                    <div className="flex-[4]">
                        <RedLevelAccess
                            onChange={setSelectedHierarchy}
                            showEstablecimiento={true}
                            showMicrored={true}
                        />
                    </div>

                    {/* Filtro Estado */}
                    <div className="flex-[1]">
                        <Select
                            label="Estado"
                            name="status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            options={[
                                { value: 'TODOS', label: 'TODOS LOS ESTADOS' },
                                { value: 'EMITIDO_JEFE', label: 'EMITIDO JEFE ESTAB.' },
                                { value: 'APROBADO_MICRORED', label: 'APROBADO MICRORED' },
                                { value: 'RECHAZADO_MICRORED', label: 'RECHAZADO MICRORED' },
                                { value: 'OBSERVADO_MICRORED', label: 'OBSERVADO MICRORED' },
                                { value: 'APROBADO_RRHH', label: 'APROBADO RRHH' },
                                { value: 'RECHAZADO_RRHH', label: 'RECHAZADO RRHH' },
                                { value: 'OBSERVADO', label: 'OBSERVADO RRHH' },
                            ]}
                        />
                    </div>
                </div>

                {/* Listado de Solicitudes */}
                <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                    <th className="px-4 py-2">Personal</th>
                                    <th className="px-4 py-2">Establecimiento</th>
                                    <th className="px-4 py-2">Tipo / Periodo</th>
                                    <th className="px-4 py-2">Días</th>
                                    <th className="px-4 py-2">Estado</th>
                                    <th className="px-4 py-2 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-sm text-gray-500">Cargando solicitudes...</p>
                                        </td>
                                    </tr>
                                ) : licencias.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center">
                                            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No se encontraron solicitudes pendientes</p>
                                        </td>
                                    </tr>
                                ) : (
                                    licencias.map((licencia) => (
                                        <tr key={licencia.licencia_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-1">
                                                    <div className="p-2 rounded-full flex-shrink-0 bg-blue-50 text-blue-600">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-[13px]">{licencia.employee?.firstName} {licencia.employee?.lastNamePaternal} {licencia.employee?.lastNameMaternal}</h3>
                                                        <div className='text-[11px] text-gray-500'>
                                                            <span>{licencia.employee?.documentNumber}</span>
                                                            <span className="text-[11px] text-gray-500"> - {licencia.employee?.profession?.description}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                                                        {(() => {
                                                            const activeRotation = licencia.employee?.rotations?.find(r => r.isActive);
                                                            if (activeRotation?.targetEstablishment) {
                                                                return activeRotation.targetEstablishment.nombreEstablecimiento;
                                                            }
                                                            return licencia.employee?.establishment?.nombreEstablecimiento || 'Sede Central';
                                                        })()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                                                        {licencia.tipo?.name}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {licencia.startDate} al {licencia.endDate}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                    {licencia.totalDays} Días
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(licencia.status)}`}>
                                                    {getStatusLabel(licencia.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/home/rrhh/licencias/history/${licencia.employeeId}`)}
                                                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                        title="Ver Historial Completo"
                                                    >
                                                        <History className="w-5 h-5" />
                                                    </button>

                                                    {/* Nivel 2: Jefe de Microred actúa sobre EMITIDO_JEFE */}
                                                    {licencia.status === 'EMITIDO_JEFE' && isMicroredHead && (
                                                        <>
                                                            {canApprove && (
                                                                <button
                                                                    onClick={() => actions.updateLicenciaStatus(licencia.licencia_id, 'APROBADO_MICRORED')}
                                                                    className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                                                                    title="Aprobar (Microred)"
                                                                >
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            {canUpdate && (
                                                                <button
                                                                    onClick={() => setObservationModal({ isOpen: true, licenciaId: licencia.licencia_id, targetStatus: 'OBSERVADO_MICRORED' })}
                                                                    className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                                                    title="Observar (Microred)"
                                                                >
                                                                    <AlertCircle className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            {canReject && (
                                                                <button
                                                                    onClick={() => setRejectionModal({ isOpen: true, licenciaId: licencia.licencia_id, targetStatus: 'RECHAZADO_MICRORED' })}
                                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                    title="Rechazar (Microred)"
                                                                >
                                                                    <XCircle className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Nivel 3: RRHH actúa sobre APROBADO_MICRORED u OBSERVADO */}
                                                    {isRedLevel && (licencia.status === 'APROBADO_MICRORED' || licencia.status === 'OBSERVADO') && (
                                                        <>
                                                            {canApprove && (
                                                                <button
                                                                    onClick={() => actions.updateLicenciaStatus(licencia.licencia_id, 'APROBADO_RRHH')}
                                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                                    title="Aprobar (RRHH)"
                                                                >
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            {canUpdate && (
                                                                <button
                                                                    onClick={() => setObservationModal({ isOpen: true, licenciaId: licencia.licencia_id, targetStatus: 'OBSERVADO' })}
                                                                    className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                                                                    title="Observar (RRHH)"
                                                                >
                                                                    <AlertCircle className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            {canReject && (
                                                                <button
                                                                    onClick={() => setRejectionModal({ isOpen: true, licenciaId: licencia.licencia_id, targetStatus: 'RECHAZADO_RRHH' })}
                                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                    title="Rechazar (RRHH)"
                                                                >
                                                                    <XCircle className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-gray-500">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Modales de Respuesta (Observar/Rechazar) */}
            <ResponseModal
                isOpen={observationModal.isOpen}
                onClose={() => setObservationModal({ isOpen: false, licenciaId: 0, targetStatus: 'OBSERVADO' })}
                onSubmit={(comments, file) => actions.updateLicenciaStatus(observationModal.licenciaId, observationModal.targetStatus, comments, file)}
                title="Observar Licencia"
                description="Indica los motivos por los cuales se observa esta solicitud"
                actionLabel="Observar Solicitud"
                color="yellow"
                isSubmitting={isSubmitting}
            />

            <ResponseModal
                isOpen={rejectionModal.isOpen}
                onClose={() => setRejectionModal({ isOpen: false, licenciaId: 0, targetStatus: 'RECHAZADO_RRHH' })}
                onSubmit={(comments, file) => actions.updateLicenciaStatus(rejectionModal.licenciaId, rejectionModal.targetStatus, comments, file)}
                title="Rechazar Licencia"
                description="Indica los motivos del rechazo de esta solicitud"
                actionLabel="Rechazar Solicitud"
                color="red"
                isSubmitting={isSubmitting}
            />

            {/* Modal de Nueva Solicitud */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${step === 'form' ? 'max-w-5xl' : 'max-w-2xl'} overflow-hidden animate-in fade-in zoom-in duration-200 transition-all`}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nueva Solicitud de Licencia</h3>
                                    <p className="text-xs text-gray-500">Completa los datos para emitir la licencia</p>
                                </div>
                            </div>
                            <button
                                onClick={() => actions.closeModal()}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 w-full">
                            {step === 'search' ? (
                                <div className="space-y-4 w-full">
                                    <p className="text-sm text-gray-500 text-center">
                                        Busque el empleado por DNI o nombre para iniciar el proceso de emisión de licencia.
                                    </p>

                                    <form onSubmit={actions.handleEmployeeSearch} className="relative">
                                        <div className="flex items-center gap-2">
                                            <InputText
                                                label="Buscar empleado (DNI o Nombres)"
                                                value={employeeSearchTerm}
                                                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                                Icon={Search}
                                                variant="variant2"
                                                autoFocus
                                            />
                                            <button
                                                type="submit"
                                                disabled={searching || !employeeSearchTerm.trim()}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-sm flex items-center h-[42px]"
                                            >
                                                {searching ? 'Buscando...' : 'Buscar'}
                                            </button>
                                        </div>
                                    </form>

                                    {searchError && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs flex items-center gap-2 border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {searchError}
                                        </div>
                                    )}

                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {searchResults.length > 0 ? (
                                            searchResults.map((emp) => (
                                                <div
                                                    key={emp.employee_id}
                                                    onClick={() => actions.selectEmployee(emp)}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition-all group bg-white dark:bg-gray-800/50 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                                {emp.fullName}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] text-gray-500 font-medium">
                                                                    DNI: {emp.documentNumber}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">•</span>
                                                                <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                                                    {emp.establishment}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 group-hover:text-blue-500 flex items-center gap-1 font-bold">
                                                        Seleccionar <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : null}
                                    </div>

                                    {/* Footer del buscador similar al de rotaciones */}
                                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => actions.closeModal()}
                                            className="px-8 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 uppercase tracking-wider"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Columna Izquierda: Formulario */}
                                    <form onSubmit={handleCreateLicencia} className="lg:col-span-2 space-y-6">
                                        {/* Información del Empleado Seleccionado */}
                                        <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 shadow-sm">
                                                    <UserIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                                                        {selectedEmployee?.fullName}
                                                    </p>
                                                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
                                                        {selectedEmployee?.documentNumber} • {selectedEmployee?.establishment}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => actions.setStep('search')}
                                                className="text-[11px] font-bold text-blue-600 hover:underline"
                                            >
                                                Cambiar
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-1">
                                                <Select
                                                    label="Tipo de Licencia"
                                                    name="tipoLicenciaId"
                                                    value={formData.tipoLicenciaId}
                                                    onChange={actions.handleFormChange}
                                                    options={tipoOptions}
                                                    required
                                                />
                                            </div>

                                            <div className="flex items-end p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                                <Info className="w-5 h-5 text-blue-600 mr-2 mb-0.5" />
                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                    Total calculado: <span className="font-bold text-sm">{formData.totalDays} Días</span>
                                                </p>
                                            </div>

                                            <InputText
                                                label="Fecha Inicio"
                                                name="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={actions.handleDateChange}
                                                required
                                            />

                                            <InputText
                                                label="Fecha Fin"
                                                name="endDate"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={actions.handleDateChange}
                                                required
                                            />

                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                    Motivo / Observación
                                                </label>
                                                <textarea
                                                    name="reason"
                                                    value={formData.reason}
                                                    onChange={actions.handleFormChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24 text-sm"
                                                    placeholder="Escribe el motivo de la licencia..."
                                                />
                                            </div>

                                            <div className="md:col-span-2 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center hover:border-blue-400 transition-colors cursor-pointer group">
                                                <FileUp className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Adjuntar Sustento (PDF)</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Opcional - Máx 5MB</p>
                                            </div>
                                            {/* Error de validación */}
                                            {submitError && (
                                                <div className="md:col-span-2 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-xs">
                                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    <span>{submitError}</span>
                                                </div>
                                            )}

                                            {/* Adjunto requerido */}
                                            {selectedTipo?.requiresAttachment && (
                                                <div className="md:col-span-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 text-[11px] flex items-center gap-2">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Este tipo de licencia <strong>requiere documento adjunto</strong> para ser válida.
                                                </div>
                                            )}
                                        </div>

                                        {/* Modal Footer */}
                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() => actions.closeModal()}
                                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Save className="w-5 h-5" />
                                                )}
                                                Emitir Licencia
                                            </button>
                                        </div>
                                    </form>

                                    {/* Columna Derecha: Información Adicional */}
                                    <div className="lg:col-span-1 space-y-6">
                                        {/* Saldo de Vacaciones */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Saldo de Vacaciones</h4>
                                            </div>

                                            {loadingInfo ? (
                                                <div className="flex justify-center py-4">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : vacationBalance ? (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[11px] text-gray-500">Saldo disponible:</span>
                                                        <span className={`text-lg font-bold ${vacationBalance.remaining_days <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                            {vacationBalance.remaining_days} días
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[11px] text-gray-500">Devengados (máx):</span>
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{vacationBalance.total_entitled} días</span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[11px] text-gray-500">Ya gozados:</span>
                                                        <span className="text-sm font-semibold text-red-500">{vacationBalance.used_days} días</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div
                                                            className="bg-green-500 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${Math.min(100, vacationBalance.total_entitled > 0 ? (vacationBalance.remaining_days / vacationBalance.total_entitled) * 100 : 0)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        {vacationBalance.dias_por_anio} días/año · acumulable hasta {vacationBalance.acumulable_hasta} año(s)
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-gray-400 text-center py-4 italic">No hay información de vacaciones disponible</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Configuración de Reglas (RRHH) */}
            {isConfigModalOpen && (
                <LicenciaConfigModal
                    isOpen={isConfigModalOpen}
                    tipos={tipos}
                    onClose={actions.closeConfigModal}
                    onSaved={actions.refreshTipos}
                />
            )}
        </>
    );
}
