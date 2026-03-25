import type { Permission } from "../interface/modularidadInterface";

interface PermissionTableProps {
    data: Permission[]; // Cambia 'any' por tu tipo de permiso real
    onEdit: (permission: Permission) => void;
    onDelete: (permissionId: number) => void;
    toggleEstadoPermission: (permissionId: number, currentState: boolean) => void;
    loading: boolean;
}

export const PermissionTable = ({ data, onEdit, onDelete, toggleEstadoPermission, loading }: PermissionTableProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Overlay de carga */}
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                    {/* Spinner simple con Tailwind */}
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Cargando datos...</span>
                </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {!loading && data.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No se encontraron aplicaciones disponibles.
                        </td>
                    </tr>
                    ) : (
                    data.map((permission) => (
                        <tr key={permission.permissionId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-white">{permission.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{permission.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{permission.action}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={permission.isActive || false}
                                onChange={() => toggleEstadoPermission(permission.permissionId, permission.isActive || false)}
                                className="sr-only peer"
                            />
                            <div className={`w-11 h-6 rounded-full peer peer-focus:ring-4 transition-colors duration-200 ease-in-out after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white ${
                                permission.isActive
                                ? 'bg-green-500 peer-focus:ring-green-300 dark:peer-focus:ring-green-800'
                                : 'bg-red-400 peer-focus:ring-red-300 dark:peer-focus:ring-red-800'
                            }`}></div>
                            </label>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                            <button 
                            onClick={() => onEdit(permission)}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-md transition-colors"
                            title="Editar Permiso"
                            >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            </button>
                            <button 
                            onClick={() => onDelete(permission.permissionId)}
                            className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-md transition-colors"
                            title="Eliminar Permiso"
                            >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
        </div>
    );
}