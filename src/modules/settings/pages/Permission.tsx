
import * as React from 'react';
import { PermissionTable } from '../components/PermissionTable';
import { PermissionForm } from '../components/PermissionForm';
import type { Permission } from '../interface/modularidadInterface';
import { confirmDestruction, notify } from '../../../core/utils/Notify';
import { permissionService } from '../services/permissionService';

export default function Permission() {
    const [showForm, setShowForm] = React.useState<boolean>(false);

    const [selectedPermission, setSelectedPermission] = React.useState<any>(null); // Cambia 'any' por tu tipo de permiso real
    const [permissions, setPermissions] = React.useState<any[]>([]); // Cambia 'any' por tu tipo de permiso real
    const [loading, setLoading] = React.useState<boolean>(false);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const response = await permissionService.getAll();
            if (response && response.success) {
                setPermissions(response.data);
            } else {
                const errorMsg = response?.message || 'Error al cargar permisos';
                notify("error", errorMsg);
            }
        } catch (error) {
            notify("error", "Error al cargar permisos");
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        fetchPermissions();
    }, []);

    const handleNewClick = () => {
        setShowForm(true);
        setSelectedPermission(null);
    }

    const handleCancel = () => {
        setSelectedPermission(null);
        setShowForm(false);
    }

    const handleCreate = async (newData: any) => {
        try {
            if (selectedPermission) {
                const response = await permissionService.update(selectedPermission.permissionId, newData);
                
                if (response && response.success) {
                    notify("success", "Permiso actualizado exitosamente");
                } else {
                    const errorMsg = response?.message || 'Error al actualizar permiso';
                    notify("error", errorMsg);
                }
                
                setPermissions(permissions.map(perm => 
                    perm.permissionId === selectedPermission.permissionId ? newData : perm
                ));
            } else {
                
                const response = await permissionService.create(newData);
                const createdPermission = response.data;
                if (response && response.success) {
                    notify("success", "Permiso creado exitosamente");
                    setPermissions([...permissions, createdPermission]);
                } else {
                    const errorMsg = response?.message || 'Error al crear permiso';
                    notify("error", errorMsg);
                }
            }
            
            setShowForm(false);
            setSelectedPermission(null);
        } catch (error) {
            notify("error", "Error al guardar el permiso");
        }
    }

    const handleEdit = async (newData: Permission) => {
        try {
            const response = await permissionService.getById(newData.permissionId);
            if (!response || !response.success) {
                notify("error", "Error al cargar el permiso");
                return;
            }
            setSelectedPermission(response.data);
            setShowForm(true);
        } catch (error) {
            notify("error", "Error al cargar el permiso");
        }
    }

    const handleDelete = async (permissionId: number) => {
        const confirmed = await confirmDestruction(
            "¿Estás seguro?", 
            "Esta acción no se puede deshacer"
        );

        if (!confirmed) return;

        try {
            setLoading(true); 
            await permissionService.delete(permissionId);
            setPermissions(prevPermissions => prevPermissions.filter(perm => perm.permissionId !== permissionId));
            notify("success", "Permiso eliminado correctamente");
        } catch (error) {
            notify("error", `Error al eliminar el permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    }

    const toggleEstadoPermission = async (permissionId: number, currentState: boolean) => {
        try {
            setLoading(true);
            const permissionToUpdate = permissions.find(perm => perm.permissionId === permissionId);
            if (!permissionToUpdate) {
                notify("error", "Permiso no encontrado");
                return;
            }
            
            const response = await permissionService.update(permissionId, { isActive: !currentState } as Permission);
            if (response && response.success) {
                setPermissions(prev => prev.map(perm => perm.permissionId === permissionId ? response.data : perm));
                notify("success", `Permiso ${!currentState ? 'activado' : 'desactivado'} correctamente`);
            }else {
                notify("error", "Error al actualizar el estado del permiso");
                return;
            }
            
            
        } catch (error) {
            notify("error", `Error al actualizar el estado del permiso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
                        Gestión de Permisos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Administra los permisos del sistema
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
                <PermissionForm 
                    onSubmit={handleCreate} 
                    initialData={selectedPermission || undefined} // Pasamos los datos si es edición
                />
            ) : (
                <PermissionTable 
                    data={permissions} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete}
                    toggleEstadoPermission={toggleEstadoPermission}
                    loading={loading}
                />
            )}

        </div>
    );
}