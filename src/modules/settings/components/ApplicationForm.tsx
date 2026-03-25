import * as React from "react";
import type { Application } from "../interface/modularidadInterface";
import { Input } from "../../../core/components/Input";
import { ColorPicker } from "./ColorPicker";

const initialApps: Application = {
    applicationId: 0,
    code: "",
    name: "",
    description: "",
    url: "",
    icon: "",
    color: "#3b82f6",
    isActive: true
}

interface AppFormProps {
  onSubmit: (formData: Application) => void;
  initialData?: Application; // Para editar, si es necesario
}

export const ApplicationForm = ({ onSubmit, initialData }: AppFormProps) => {
  
    const [formData, setFormData] = React.useState<Application>(initialData || initialApps);

    // Este cambio permite limpiar el formulario cuando initialData pasa a ser null (clic en Nuevo)
    React.useEffect(() => {
        setFormData(initialData || initialApps);
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
                {initialData ? "Editar Aplicación" : "Agregar Nueva Aplicación"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agregué el campo Code por si es necesario */}
                <div className="md:col-span-2">
                    <Input
                        label="Código"
                        name="code"
                        type="text"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="Debe ser en Mayúscula"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Nombre"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ingrese el nombre de la aplicación"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="URL"
                        type="text"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        placeholder="Ingrese la URL de la aplicación"
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

                <div className="md:col-span-2">
                    <ColorPicker
                        label="Color representativo"
                        name="color"
                        value={formData.color ?? "#3b82f6"}
                        onChange={handleChange}
                    />
                </div>

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
                        {initialData ? "Guardar Cambios" : "Agregar Aplicación"}
                    </button>
                </div>
            </form>
        </div>
    );
};