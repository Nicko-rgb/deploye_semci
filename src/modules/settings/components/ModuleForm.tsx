import * as React from "react";
import type { Application, Module } from "../interface/modularidadInterface";
import { Input } from "../../../core/components/Input";
import { ColorPicker } from "./ColorPicker";

const initialModuleData: Module = {
    moduleId: 0,
    name: '',
    description: '',
    route: '',
    icon: '',
    color: '#3b82f6',
    orderIndex: 0,
    secondary: false,
    applicationId: 0,
    isActive: true
};

interface ModuleFormProps {
    onSubmit: (formData: Module) => void;
    initialData?: Module; 
    applications: Application[];
}

export const ModuleForm = ({ onSubmit, initialData, applications }: ModuleFormProps) => {
    const [formData, setFormData] = React.useState<Module>(initialData || initialModuleData);

    React.useEffect(() => {
            setFormData(initialData || initialModuleData);
        }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                {initialData ? "Editar Módulo" : "Agregar Nuevo Módulo"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Input
                        label="Nombre"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ingrese el nombre del módulo"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="URL"
                        type="text"
                        name="route"
                        value={formData.route}
                        onChange={handleChange}
                        placeholder="Ingrese la URL del módulo"
                    />
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Icono"
                        type="text"
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        placeholder="Ingrese el codigo del svg del icono, en una sola linea"
                    />
                </div>

                <div>
                    <ColorPicker
                        label="Color representativo"
                        name="color"
                        value={formData.color ?? "#3b82f6"}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aplicación <span className="text-red-500 ml-1 font-bold">*</span></label>
                    <select 
                        name="applicationId"
                        value={formData.applicationId}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 
                        bg-white dark:bg-gray-700 
                        border border-gray-300 dark:border-gray-600 
                        rounded-md shadow-sm dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        transition-all duration-200 border-gray-300"
                    >
                        <option value="">Seleccione</option>
                        {applications.map(app => (
                            <option key={app.applicationId} value={app.applicationId}>{app.name}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                    <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 rounded-md dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="md:col-span-2">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {initialData ? "Guardar Cambios" : "Agregar Módulo"}
                    </button>
                </div>
            </form>
        </div>
    ); 
}