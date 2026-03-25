import * as React from "react";
import { ModuleForm } from "../components/ModuleForm";
import { ModuleTable } from "../components/ModuleTable";
import { moduleService } from "../services/moduleService";
import { confirmDestruction, notify } from "../../../core/utils/Notify";
import type { Application, Module } from "../interface/modularidadInterface";
import { Pagination } from "../../../core/components/Pagination";
import { applicationService } from "../services/applicationService";

export default function Module() {
    const [showForm, setShowForm] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState(false);
    const [modules, setModules] = React.useState<Module[]>([]); 
    const [applications, setApplications] = React.useState<Application[]>([]);
    const [selectedModule, setSelectedModule] = React.useState<any | null>(null); 

    // Estados de Paginación y Filtro
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    const [appFilter, setAppFilter] = React.useState<string>("");
    const [totalPages, setTotalPages] = React.useState(1);
    const [totalResults, setTotalResults] = React.useState(0); 

    const fetchModules = async () => {
        setLoading(true);
        try {
            const responseApps = await applicationService.getAll();
            if (responseApps && responseApps.success) {
                setApplications(responseApps.data);
            }

            const filteredAppId = appFilter ? (appFilter!==""? Number(appFilter) : undefined) : undefined; 
            const response = await moduleService.getAll(currentPage, itemsPerPage, filteredAppId);
            if (response && response.success) {
                setModules(response.data);
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages);
                    setTotalResults(response.pagination.total);
                }
            } 
        } catch (error) {
            notify("error", "Error al cargar módulos");
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        fetchModules();
    }, [currentPage, appFilter]);

    const handleNewClick = () => {
        setSelectedModule(null);
        setShowForm(true);
    }

    const handleCancel = () => {
        setShowForm(false);
        setSelectedModule(null);
    }

    const handleCreate = async (newData: Module) => {
        try {
            if (selectedModule) {
                const response = await moduleService.update(selectedModule.moduleId, newData);
                
                if (response && response.success) {
                    notify("success", "Módulo actualizado exitosamente");
                } else {
                    const errorMsg = response?.message || 'Error al actualizar módulo';
                    notify("error", errorMsg);
                }
                
                setModules(modules.map(mod => 
                    mod.moduleId === selectedModule.moduleId ? newData : mod
                ));
            } else {
                
                const response = await moduleService.create(newData);
                const createdModule = response.data;
                if (response && response.success) {
                    notify("success", "Módulo creado exitosamente");
                    setModules([...modules, createdModule]);
                } else {
                    const errorMsg = response?.message || 'Error al crear módulo';
                    notify("error", errorMsg);
                }
            }
            
            setShowForm(false);
            setSelectedModule(null);
        } catch (error) {
            notify("error", "Error al guardar el módulo");
        }
    }

    const handleEdit = async (module: Module) => {
        try {
            const response = await moduleService.getById(module.moduleId);
            if (!response || !response.success) {
                notify("error", "Error al cargar el módulo");
                return;
            }
            setSelectedModule(response.data);
            setShowForm(true);
        } catch (error) {
            notify("error", "Error al cargar el módulo");
        }
    }

    const handleDelete = async (moduleId: number) => {
        const confirmed = await confirmDestruction(
            "¿Estás seguro?", 
            "Esta acción no se puede deshacer"
        );

        if (!confirmed) return;

        try {
            setLoading(true); 
            await moduleService.delete(moduleId);
            setModules(prevModules => prevModules.filter(mod => mod.moduleId !== moduleId));
            notify("success", "Módulo eliminado correctamente");
        } catch (error) {
            notify("error", `Error al eliminar el módulo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    }

    const toggleEstadoModule = async (moduleId: number, currentState: boolean) => {
        try {
            setLoading(true);
            const moduleToUpdate = modules.find(mod => mod.moduleId === moduleId);
            if (!moduleToUpdate) {
                notify("error", "Módulo no encontrado");
                return;
            }
            
            const response = await moduleService.update(moduleId, { isActive: !currentState } as Module);
            if (response && response.success) {
                setModules(prev => prev.map(mod => mod.moduleId === moduleId ? response.data : mod));
                notify("success", `Módulo ${!currentState ? 'activado' : 'desactivado'} correctamente`);
            }else {
                notify("error", "Error al actualizar el estado del módulo");
                return;
            }
            
            
        } catch (error) {
            notify("error", `Error al actualizar el estado del módulo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
                        Gestión de Módulos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Administra los módulos del sistema
                    </p>
                </div>

                {/* Filtro y Botón */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    {!showForm ? (
                        <>
                            <select 
                                value={appFilter}
                                onChange={(e) => { setAppFilter(e.target.value); setCurrentPage(1); }}
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full md:w-64 p-2.5"
                            >
                                <option value="">Todas las aplicaciones</option>
                                {applications.map(app => (
                                    <option key={app.applicationId} value={app.applicationId}>{app.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleNewClick}
                                className="w-full md:w-64 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                + Nuevo Módulo
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleCancel}
                            className="w-full md:w-64 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                        >
                            Volver a la lista
                        </button>
                    )}
                </div>
            </div>

            {/* Renderizado Condicional */}
            {!showForm ? (
                <>
                    <ModuleTable 
                        data={modules} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                        toggleEstadoModule={toggleEstadoModule}
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
                <ModuleForm 
                    onSubmit={handleCreate} 
                    initialData={selectedModule || undefined}
                    applications={applications}
                />
            )}
            
        </div>
    );
}