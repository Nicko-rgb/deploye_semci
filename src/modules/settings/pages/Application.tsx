import * as React from "react";
import { ApplicationTable } from "../components/ApplicationTable";
import { ApplicationForm } from "../components/ApplicationForm";
import type { Application } from "../interface/modularidadInterface";
import { applicationService } from "../services/applicationService";
import { confirmDestruction, notify } from "../../../core/utils/Notify";

export default function Application() {
    const [apps, setApps] = React.useState<Application[]>([]);
    const [showForm, setShowForm] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState(false);

    const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);

    React.useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await applicationService.getAll();
            setApps(response.data); 
        } catch (error) {
            notify("error", "Error al cargar aplicaciones");
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (newData: Application) => {
        try {
            if (selectedApp) {
                // Lógica para ACTUALIZAR en la API (PUT)
                const response = await applicationService.update(selectedApp.applicationId, newData);

                if (response && response.success) {
                    notify("success", "Aplicación actualizada exitosamente");
                } else {
                    const errorMsg = response?.message || 'Error al actualizar aplicación';
                    notify("error", errorMsg);
                }

                setApps(apps.map(app => 
                    app.applicationId === selectedApp.applicationId ? newData : app
                ));
            } else {
                // Lógica para CREAR en la API (POST)
                const response = await applicationService.create(newData);
                const createdApp = response.data;

                if (response && response.success) {
                    notify("success", "Aplicación creada exitosamente");

                    // Usamos el objeto que devuelve la API (que ya trae el ID real)
                    setApps([...apps, createdApp]);
                    
                } else {
                    const errorMsg = response?.message || 'Error al crear aplicación';
                    
                    notify("error", errorMsg);
                }
            }
            
            setShowForm(false);
            setSelectedApp(null);
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const handleEdit = async (app: Application) => {
        try {
            const response = await applicationService.getById(app.applicationId);
            if (!response || !response.success) {
                const errorMsg = response?.message || 'Error al obtener detalles de la aplicación';
                notify("error", errorMsg);
                return;
            }

            setSelectedApp(response.data);
            setShowForm(true);
        } catch (error) {
            notify("error", "Error al obtener detalles de la aplicación");
        }
    };

    const handleDelete = async (applicationId: number) => {
        const confirmed = await confirmDestruction(
            "¿Estás seguro?", 
            "Esta acción no se puede deshacer"
        );
        
        if (!confirmed) return; 

        try {
            setLoading(true); 
            
            await applicationService.delete(applicationId);
            
            setApps(prevApps => prevApps.filter(app => app.applicationId !== applicationId));
            
            notify("success", "Aplicación eliminada exitosamente");
        } catch (error) {
            console.error("Delete error:", error);
            notify("error", "No se pudo eliminar la aplicación. Inténtelo de nuevo.");
        } finally {
            setLoading(false);
        }
    }

    const handleNewClick = () => {
        setSelectedApp(null); 
        setShowForm(true);  
    };

    const handleCancel = () => {
        setShowForm(false);
        setSelectedApp(null);
    };

    const toggleEstadoApp = async (applicationId: number, currentState: boolean) => {
        try {
            setLoading(true);
            const appToUpdate = apps.find(app => app.applicationId === applicationId);
            if (!appToUpdate) {
                notify("error", "Aplicación no encontrada");
                return;
            }
            
            const response = await applicationService.update(applicationId, { isActive: !currentState } as Application);
            if (response && response.success) {
                setApps(prev => prev.map(app => app.applicationId === applicationId ? response.data : app));
                notify("success", `Aplicación ${!currentState ? 'activada' : 'desactivada'} correctamente`);
            }else {
                notify("error", "Error al actualizar el estado de la aplicación");
                return;
            }
            
            
        } catch (error) {
            notify("error", `Error al actualizar el estado de la aplicación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
                        Gestión de Aplicaciones
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Administra las aplicaciones del sistema
                    </p>
                </div>

                {/* Botón alineado a la derecha */}
                <div className="flex items-center">
                    {!showForm ? (
                        <button 
                            onClick={handleNewClick}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Nuevo
                        </button>
                    ) : (
                        <button 
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Volver a la lista
                        </button>
                    )}
                </div>
            </div>

            {/* Renderizado Condicional */}
            {showForm ? (
                <ApplicationForm 
                    onSubmit={handleCreate} 
                    initialData={selectedApp || undefined} // Pasamos los datos si es edición
                />
            ) : (
                <ApplicationTable 
                    data={apps} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete}
                    toggleEstadoApp={toggleEstadoApp}
                    loading={loading}
                />
            )}

        </div>
    );
}