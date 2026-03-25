import { Search, User, Users, Download, EyeIcon, Plus } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import type { EmployeeSummary } from '../types';
import PageHeader from '../../../core/components/PageHeader';
import { Select, InputText } from '../components/FormComponents';
import { useSubmodulePermissions } from '../../../core/hooks/useSubmodulePermissions';
import RedLevelAccess from '../../../core/components/RedLevelAccess';
import { Pagination } from '../../../core/components/Pagination';

export default function Employees() {
    const {
        employees,
        loading,
        searchTerm,
        filters,
        pagination,
        exporting,
        breadcrumb,
        occupationalGroupOptions,
        statusOptions,
        laborConditionOptions,
        laborRegimeOptions,
        handleSearchChange,
        handleFilterChange,
        handleHierarchyChange,
        handlePageChange,
        handleNavigateToDetail,
        handleExport,
        navigate
    } = useEmployees();

    // ─── Permisos dinámicos desde el backend ─────────────────────────────────
    const { canCreate, canExport } = useSubmodulePermissions({
        submoduleName: 'GESTIÓN DE EMPLEADOS',
        applicationCode: 'RRHH',
    });

    const headerActions: import('../../../core/components/PageHeader').PageHeaderAction[] = [];

    if (canExport) {
        headerActions.push({
            label: exporting ? 'Exportando...' : 'Exportar',
            icon: Download,
            variant: 'secondary',
            onClick: handleExport,
            disabled: exporting
        });
    }

    if (canCreate) {
        headerActions.push({
            label: 'Nuevo Empleado',
            icon: Plus,
            variant: 'primary' as const,
            onClick: () => navigate('/home/rrhh/employees/new'),
            disabled: false
        });
    }

    return (

        <div className="space-y-3">
            {/* Header */}
            <PageHeader
                title="Gestión de Empleados"
                description="Administra el personal de la Red de Salud"
                icon={Users}
                color="#245ee5"
                breadcrumb={breadcrumb}
                badge={{ label: `${pagination.total} Registros` }}
                actions={headerActions}
            />

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                    <RedLevelAccess onChange={handleHierarchyChange} className="mb-1" />
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <InputText
                            type='text'
                            label='Buscar datos...'
                            placeholder='Buscar por nombres apellidos, DNI...'
                            value={searchTerm}
                            onChange={handleSearchChange}
                            variant='variant1'
                            Icon={Search}
                        />
                        <Select
                            label="Régimen Laboral"
                            name="laborRegimeId"
                            value={filters.laborRegimeId}
                            onChange={handleFilterChange}
                            options={laborRegimeOptions}
                            variant="custom"
                        />
                        <Select
                            label="Grupo Condición Laboral"
                            name="grupoCondicion"
                            value={filters.grupoCondicion}
                            onChange={handleFilterChange}
                            options={laborConditionOptions}
                            variant="custom"
                        />
                        <Select
                            label="Grupo Ocupacional"
                            name="occupationalGroup"
                            value={filters.occupationalGroup}
                            onChange={handleFilterChange}
                            options={occupationalGroupOptions}
                            variant="custom"
                        />
                        <Select
                            label="Estado"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            options={statusOptions}
                            variant="custom"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px] relative">
                <div className="overflow-x-auto">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cargando empleados...</span>
                            </div>
                        </div>
                    )}

                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm uppercase font-semibold">
                            <tr>
                                <th className="px-3 py-2 text-[12px]">Empleado</th>
                                <th className="px-3 py-2 text-[12px]">Profesión / Especialidad</th>
                                <th className="px-3 py-2 text-[12px]">Cargo/Laboral</th>
                                <th className="px-3 py-2 text-[12px]">Establecimiento</th>
                                <th className="px-3 py-2 text-[12px]">Estado</th>
                                <th className="px-3 py-2 text-[12px] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {employees.map((empleado: EmployeeSummary) => (
                                <tr
                                    key={empleado.employee_id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group text-sm"
                                >
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className='flex flex-col leading-tight'>
                                                <p className="font-bold text-gray-900 dark:text-white truncate text-[13px]">{empleado.fullName}</p>
                                                <span className='text-[12px] text-gray-500 dark:text-gray-400'>{empleado.documentType}: {empleado.documentNumber}</span>
                                                <span className='text-[12px] text-gray-500 dark:text-gray-400'>{empleado.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 flex flex-col leading-tight">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {empleado.profession}
                                        </div>
                                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{empleado.specialty || '---'}</div>
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 italic">{empleado.professionCondition}</div>
                                    </td>
                                    <td className="px-3 py-2 leading-snug">
                                        <div className="font-medium text-gray-900 dark:text-white">{empleado.functionalPosition}</div>
                                        <div className="flex gap-2">
                                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                {empleado.laborRegime}
                                            </span>
                                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                                                {empleado.laborCondition}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 flex flex-col leading-tight">
                                        <p className="text-gray-700 font-medium dark:text-gray-300 max-w-[170px] truncate" title={empleado.establishment}>
                                            {empleado.establishment}
                                        </p>
                                        <p className="text-[12px] text-gray-500 dark:text-gray-400">{empleado.occupationalGroup}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${empleado.isEnabled
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${empleado.isEnabled ? 'bg-green-500' : 'bg-red-500'
                                                }`}></span>
                                            {empleado.isEnabled ? 'Activo' : 'Cesado'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button onClick={() => handleNavigateToDetail(empleado.employee_id!)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            {!loading && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalResults={pagination.total}
                    resultsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
