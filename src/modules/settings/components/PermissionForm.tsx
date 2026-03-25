import * as React from 'react';
import type { Permission } from "../interface/modularidadInterface";
import { Input } from '../../../core/components/Input';

const initialDataForm: Permission = {
    permissionId: 0,
    name: '',
    description: '',
    action: '',
    isActive: true
}

interface PermissionFormProps {
    onSubmit: (formData: Permission) => void; // Cambia 'any' por tu tipo de permiso real
    initialData?: Permission; // Cambia 'any' por tu tipo de permiso real
}

export const PermissionForm = ({ onSubmit, initialData }: PermissionFormProps) => {
    const [formData, setFormData] = React.useState<Permission>(initialData || initialDataForm);

     React.useEffect(() => {
        setFormData(initialData || initialDataForm);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Manejo simple de tipos para inputs
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg mb-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {initialData ? "Editar Permiso" : "Agregar Nuevo Permiso"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agregué el campo Code por si es necesario */}

                <Input
                    label="Nombre"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre del permiso"
                    required
                />

                <Input
                    label="Acción"
                    type="text"
                    name="action"
                    value={formData.action}
                    onChange={handleChange}
                    placeholder="Ingrese la acción del permiso"
                    required
                />

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                    <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 rounded-md dark:text-white"
                    />
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {initialData ? "Guardar Cambios" : "Agregar Permiso"}
                    </button>
                </div>
            </form>
        </div>
    );
}