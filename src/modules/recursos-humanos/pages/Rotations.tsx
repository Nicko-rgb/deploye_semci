import { Search, RefreshCw, User, MapPin, Calendar, Plus, XCircle, MoreVertical, Building2, ChevronLeft, ChevronRight, Edit2, History } from 'lucide-react';
import { createPortal } from 'react-dom';
import { InputText, Select } from '../components/FormComponents';
import { FormRotate } from '../components/FormRotate';
import { useRotation } from '../hooks/useRotation';
import PageHeader from '../../../core/components/PageHeader';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import RedLevelAccess from '../../../core/components/RedLevelAccess';
import { useSubmodulePermissions } from '../../../core/hooks/useSubmodulePermissions';

const LABOR_CONDITION_STYLES: Record<string, string> = {
    'NOMBRADO':    'bg-blue-50 text-blue-700 border-blue-200',
    'CONTRATADO':  'bg-green-50 text-green-700 border-green-200',
    'SERUMS':      'bg-purple-50 text-purple-700 border-purple-200',
    'TERCERO':     'bg-yellow-50 text-yellow-700 border-yellow-200',
};

function LaborConditionBadge({ value }: { value: string }) {
    const upper = value.toUpperCase();
    const key = Object.keys(LABOR_CONDITION_STYLES).find(k => upper.includes(k));
    const cls = key ? LABOR_CONDITION_STYLES[key] : 'bg-gray-50 text-gray-600 border-gray-200';
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
            {value}
        </span>
    );
}

export default function Rotations() {
    const breadcrumb = useAppBreadcrumb(['Rotaciones']);

    // ─── Permisos dinámicos desde el backend ────────────────────────────────
    const { canCreate, canUpdate } = useSubmodulePermissions({
        submoduleName: 'ROTACIÓN',
        applicationCode: 'RRHH',
    });

    const {
        rotations,
        loading,
        searchTerm,
        filters,
        pagination,
        openMenuId,
        menuPosition,
        showNewRotationModal,
        selectedRotationId,
        handleSearchChange,
        handleFilterChange,
        handlePageChange,
        handleMenuClick,
        handleEndRotation,
        handleEditRotation,
        handleNewRotation,
        handleViewHistory,
        handleCloseModal,
        handleSuccessModal,
        formatDate,
        getStatusConfig,
        setSelectedHierarchy,
    } = useRotation();

    // Obtener la rotación seleccionada para pasar el DNI al historial
    const selectedRotation = rotations.find(r => r.rotation_id === openMenuId);

    return (
        <div className="max-w-full mx-auto space-y-3">
            {/* Header */}
            <PageHeader
                title="Gestión de Rotaciones"
                description="Administre los desplazamientos temporales del personal entre establecimientos."
                icon={RefreshCw}
                color="#F97316"
                breadcrumb={breadcrumb}
                badge={{ label: `${pagination.total} Registros` }}
                actions={[
                    ...(canCreate ? [{
                        label: 'Nueva Rotación',
                        icon: Plus,
                        variant: 'primary' as const,
                        onClick: handleNewRotation,
                    }] : [])
                ]}
            />

            {/* Filters & Search */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3">
                <div className='flex-[2]'>
                    <InputText
                        label='Buscar por nombres o numero documento'
                        value={searchTerm}
                        onChange={handleSearchChange}
                        variant='variant1'
                        Icon={Search}
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
                <div className='flex-[1]'>
                    <Select
                        label='Estado'
                        value={filters.isActive === undefined ? 'ALL' : filters.isActive ? 'ACTIVE' : 'INACTIVE'}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleFilterChange('isActive', val === 'ALL' ? undefined : val === 'ACTIVE');
                        }}
                        options={[
                            { value: 'ALL', label: 'Todos' },
                            { value: 'ACTIVE', label: 'Activos' },
                            { value: 'INACTIVE', label: 'Finalizados' }
                        ]}
                    />
                </div>
            </div>

            {/* Rotations Table */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-4 py-2">Empleado</th>
                                <th className="px-4 py-2 text-center">Cond. Laboral</th>
                                <th className="px-4 py-2">Origen</th>
                                <th className="px-4 py-2 text-center">Destino</th>
                                <th className="px-4 py-2">Fechas</th>
                                <th className="px-4 py-2 text-center">Estado</th>
                                <th className="px-4 py-2 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        Cargando rotaciones...
                                    </td>
                                </tr>
                            ) : rotations.map((rotation) => (
                                <tr key={rotation.rotation_id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-1">
                                            <div className={`p-2 rounded-full flex-shrink-0 ${rotation.isActive ? 'bg-orange-100' : 'bg-gray-100'}`}>
                                                <User className={`w-5 h-5 ${rotation.isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-[13px]">{rotation.employee.fullName}</h3>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span>{rotation.employee.documentNumber}</span>
                                                    <span>•</span>
                                                    <span className="truncate" title={rotation.employee.profession}>{rotation.employee.profession || '---'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {rotation.employee.laborCondition ? (
                                            <LaborConditionBadge value={rotation.employee.laborCondition} />
                                        ) : (
                                            <span className="text-xs text-gray-400">---</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-1 text-[13px] text-gray-700">
                                            <Building2 className="w-4 h-4 text-gray-500" />
                                            {rotation.originName || '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="flex items-center gap-1 text-[13px] font-medium text-gray-900 bg-orange-50 p-1 rounded-md border border-orange-100 w-fit">
                                                <MapPin className="w-4 h-4 text-orange-500" />
                                                {rotation.targetName || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-1 items-center">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <div className='flex flex-col'>
                                                <span className="font-medium text-xs text-gray-500 truncate">
                                                    De: {formatDate(rotation.startDate)}
                                                </span>
                                                {rotation.endDate && (
                                                    <span className="text-xs text-gray-500 truncate">
                                                        A: {formatDate(rotation.endDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusConfig(rotation).className}`}>
                                            {getStatusConfig(rotation).label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => handleMenuClick(e, rotation.rotation_id)}
                                                className={`p-2 rounded-lg transition-colors ${openMenuId === rotation.rotation_id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                title="Opciones"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && rotations.length === 0 && (
                    <div className="text-center py-12 border-t border-gray-100">
                        <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No se encontraron rotaciones</h3>
                        <p className="text-gray-500 mt-1">Intente ajustar los filtros de búsqueda.</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando página <span className="font-medium">{pagination.page}</span> de <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} resultados)
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        <span className="sr-only">Anterior</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        <span className="sr-only">Siguiente</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <FormRotate
                isOpen={showNewRotationModal}
                onClose={handleCloseModal}
                rotationId={selectedRotationId}
                onSuccess={handleSuccessModal}
            />

            {/* Portal Context Menu */}
            {openMenuId && menuPosition && createPortal(
                <div
                    className="absolute w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-[9999] py-1 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => handleViewHistory(selectedRotation!.employeeId)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <History className="w-4 h-4 text-blue-500" />
                        Ver Historial
                    </button>

                    {selectedRotation?.isActive && (
                        <>
                            <div className="h-px bg-gray-100 my-1" />
                            {canUpdate && (
                                <button
                                    onClick={() => handleEditRotation(openMenuId)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4 text-gray-400" />
                                    Editar
                                </button>
                            )}
                            {canUpdate && (
                                <button
                                    onClick={() => handleEndRotation(openMenuId)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    Finalizar
                                </button>
                            )}
                        </>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
