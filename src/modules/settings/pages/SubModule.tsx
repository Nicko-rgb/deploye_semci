import * as React from "react";
import { Pagination } from "../../../core/components/Pagination";
import { SubModuleForm } from "../components/SubModuleForm";
import { SubModuleTable } from "../components/SubModuleTable";
import { Input } from "../../../core/components/Input";
import { applicationService } from "../services/applicationService";
import { moduleService } from "../services/moduleService";
import { submoduleService } from "../services/submoduleService";
import { confirmDestruction, notify } from "../../../core/utils/Notify";
import useDebounce from '../../../core/hooks/useDebounce';
import type { SubModule } from "../interface/modularidadInterface";

export default function SubModule() {
    const [showForm, setShowForm] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState(false);
    const [subModules, setSubModules] = React.useState<any[]>([]); 
    const [applications, setApplications] = React.useState<any[]>([]);
    const [modules, setModules] = React.useState<any[]>([]);
    const [selectedSubModule, setSelectedSubModule] = React.useState<any | null>(null);

    // Estados de Paginación y Filtro
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    const [appFilter, setAppFilter] = React.useState<string>("");
    const [moduleFilter, setModuleFilter] = React.useState<string>("");
    const [statusFilter, setStatusFilter] = React.useState<string>("");
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [totalPages, setTotalPages] = React.useState(1);
    const [totalResults, setTotalResults] = React.useState(0);

    React.useEffect(() => {
        const loadInitialData = async () => {
            const res = await applicationService.getAll();
            if (res?.success) setApplications(res.data);
        };
        loadInitialData();
    }, []);

    const fetchSubmodules = async () => {
        setLoading(true);
        try {
            // Preparar parámetros de búsqueda
            const searchQuery = debouncedSearchTerm.trim() || undefined;
            const filteredAppId = appFilter ? Number(appFilter) : undefined;
            const filteredModuleId = moduleFilter ? Number(moduleFilter) : undefined;
            const filteredStatus = statusFilter !== "" ? statusFilter === "true" : undefined;

            const response = await submoduleService.getAll(
                currentPage, 
                itemsPerPage, 
                filteredAppId, 
                filteredModuleId, 
                filteredStatus,
                searchQuery
            );
            
            if (response?.success) {
                setSubModules(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalResults(response.pagination.total);
            }
        } catch (error) {
            notify("error", "Error al cargar submódulos");
        } finally {
            setLoading(false);
        }
    };

    // Cargar módulos cuando cambie la aplicación seleccionada
    const fetchModulesByApplication = async () => {
        if (appFilter) {
            try {
                const response = await moduleService.getAllByApplication(Number(appFilter));
                if (response && response.success) {
                    setModules(response.data);
                }
            } catch (error) {
                notify("error", "Error al cargar módulos");
                setModules([]);
            }
        } else {
            setModules([]);
            setModuleFilter(""); // Limpiar filtro de módulo si no hay aplicación
        }
    }

    React.useEffect(() => {
        setCurrentPage(1);
        fetchSubmodules();
    }, [debouncedSearchTerm, appFilter, moduleFilter, statusFilter]);

    React.useEffect(() => {
        fetchSubmodules();
    }, [currentPage]);

    // Efecto para cargar módulos cuando cambia la aplicación
    React.useEffect(() => {
        fetchModulesByApplication();
    }, [appFilter]);

    const handleNewClick = () => {
        setSelectedSubModule(null);
        setShowForm(true);
    }

    const handleCancel = () => {
        setShowForm(false);
        setSelectedSubModule(null);
    }

    const handleCreate = async (newData: SubModule) => {
        try {
            if (selectedSubModule) {
                const response = await submoduleService.update(selectedSubModule.submoduleId, newData);
                                
                if (response && response.success) {
                    notify("success", "Submódulo actualizado exitosamente");
                } else {
                    const errorMsg = response?.message || 'Error al actualizar módulo';
                    notify("error", errorMsg);
                }
                
                setSubModules(subModules.map(sm => 
                    sm.submoduleId === selectedSubModule.submoduleId ? newData : sm
                ));
            } else {
                const response = await submoduleService.create(newData);
                if (response && response.success) {
                    notify("success", "Submódulo creado exitosamente");
                    // Agregar nuevo submódulo a la lista actual
                    setSubModules(prev => [...prev, response.data]);
                } else {
                    const errorMsg = response?.message || 'Error al crear submódulo';
                    notify("error", errorMsg);
                }
            }
            setShowForm(false);
            setSelectedSubModule(null);
        } catch (error) {
            notify("error", error instanceof Error ? error.message : "Error al guardar el submódulo");
        }
    }

    const handleEdit = async (subModule: SubModule) => {
        try {
            const response = await submoduleService.getById(subModule.submoduleId);
            if (!response || !response.success) {
                notify("error", "Error al cargar el submódulo");
                return;
            }
            setSelectedSubModule(response.data);
            setShowForm(true);
        } catch (error) {
            notify("error", "Error al cargar el submódulo");
        }
    }

    const handleDelete = async (subModuleId: number) => {
        const confirmed = await confirmDestruction(
            "¿Estás seguro?", 
            "Esta acción no se puede deshacer"
        );

        if (!confirmed) return;

        try {
            setLoading(true); 
            await submoduleService.delete(subModuleId);
            setSubModules(prev => prev.filter(sm => sm.submoduleId !== subModuleId));
            notify("success", "Submódulo eliminado correctamente");
        } catch (error) {
            notify("error", error instanceof Error ? error.message : "Error al eliminar el submódulo");
        } finally {
            setLoading(false);
        }
    }

    const toggleEstadoSubModule = async (id: number, currentState: boolean) => {
        try {
            setLoading(true);
            const subModuleToUpdate = subModules.find(sm => sm.submoduleId === id);
            if (!subModuleToUpdate) {
                notify("error", "Submódulo no encontrado");
                return;
            }

            const updatedData = { ...subModuleToUpdate, isActive: !currentState };
            const response = await submoduleService.update(id, updatedData);

            if (response && response.success) {
                setSubModules(prev => prev.map(sm => sm.submoduleId === id ? response.data : sm));
                notify("success", `Submódulo ${!currentState ? "activado" : "desactivado"} correctamente`);
            } else {
                const errorMsg = response?.message || 'Error al actualizar el estado del submódulo';
                notify("error", errorMsg);
            }
        } catch (error) {
            notify("error", error instanceof Error ? error.message : "Error al actualizar el estado del submódulo");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Contenedor de Títulos */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Gestión de SubMódulos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Administra los submódulos del sistema
                    </p>
                </div>
                {/* Botón alineado a la derecha */}
                <div className="flex items-center">
                    {!showForm ? (
                        <button 
                            onMouseDown={(e) => { e.preventDefault(); handleNewClick(); }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Nuevo
                        </button>
                    ) : (
                        <button 
                            onMouseDown={(e) => { e.preventDefault(); handleCancel(); }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Volver a la lista
                        </button>
                    )}
                </div>
            </div>

            {!showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    {/* Filtros */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 w-full">
                        <div className="w-full">
                            <Input
                                label="Buscar por nombre"
                                type="text"
                                name="search"
                                value={searchTerm}
                                autoComplete="off"
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Ingrese el nombre del submódulo"
                            />
                        </div>
                        {/* Filtro por Aplicación */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aplicación</label>    
                            <select
                                value={appFilter}
                                onChange={(e) => {setAppFilter(e.target.value); setCurrentPage(1);}}
                                onMouseDown={(e) => e.currentTarget.focus()}
                                className="mt-1 block w-full px-3 py-2 
                                bg-white dark:bg-gray-700 
                                border border-gray-300 dark:border-gray-600 
                                rounded-md shadow-sm dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                disabled:bg-gray-100 disabled:cursor-not-allowed
                                transition-all duration-200 border-gray-300"
                            >
                                <option value="">Todas las aplicaciones</option>
                                {applications.map((app) => (
                                    <option key={app.applicationId} value={app.applicationId}>
                                        {app.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Módulo */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Módulo</label>
                            <select
                                value={moduleFilter}
                                onChange={(e) => {setModuleFilter(e.target.value); setCurrentPage(1);}}
                                onMouseDown={(e) => e.currentTarget.focus()}
                                disabled={!appFilter}
                                className="mt-1 block w-full px-3 py-2 
                                bg-white dark:bg-gray-700 
                                border border-gray-300 dark:border-gray-600 
                                rounded-md shadow-sm dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                disabled:bg-gray-100 disabled:cursor-not-allowed
                                transition-all duration-200 border-gray-300"
                            >
                                <option value="">Todos los módulos</option>
                                {modules.map((mod) => (
                                    <option key={mod.moduleId} value={mod.moduleId}>
                                        {mod.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Estado */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                                onMouseDown={(e) => e.currentTarget.focus()}
                                className="mt-1 block w-full px-3 py-2 
                                bg-white dark:bg-gray-700 
                                border border-gray-300 dark:border-gray-600 
                                rounded-md shadow-sm dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                disabled:bg-gray-100 disabled:cursor-not-allowed
                                transition-all duration-200 border-gray-300"
                            >
                                <option value="">Todos los estados</option>
                                <option value="true">Activos</option>
                                <option value="false">Inactivos</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Renderizado Condicional */}
            {!showForm ? (
                <>
                    <SubModuleTable 
                        data={subModules} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                        toggleEstadoSubModule={toggleEstadoSubModule}
                        loading={loading}
                    />

                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalResults={totalResults}
                        resultsPerPage={itemsPerPage}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </>
            ) : (
                <SubModuleForm 
                    onSubmit={handleCreate} 
                    initialData={selectedSubModule || undefined}
                    applications={applications}
                />
            )}
        </div>
    );
}