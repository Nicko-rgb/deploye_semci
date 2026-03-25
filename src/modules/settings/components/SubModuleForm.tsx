import * as React from "react";
import type { Application, Module, SubModule } from "../interface/modularidadInterface";
import { Input } from "../../../core/components/Input";
import { ColorPicker } from "./ColorPicker";
import { moduleService } from "../services/moduleService";
const initialSubModuleData: SubModule = {
    submoduleId: 0,
    moduleId: 0,
    name: '',
    description: '',
    route: '',
    icon: '',
    color: '#3b82f6',
    orderIndex: 0,
    isActive: true,
    module: undefined,
}

interface SubModuleFormProps {
    onSubmit: (FormData: SubModule) => void;
    initialData?: SubModule;
    applications: Application[],
}

export const SubModuleForm = ({onSubmit, initialData, applications}: SubModuleFormProps) => {
    const [formData, setFormData] = React.useState<SubModule>(initialData || initialSubModuleData);
    const [modules, setModules] = React.useState<Module[]>([]);
    const [selectedApplicationId, setSelectedApplicationId] = React.useState<number | "">(
        initialData?.module?.application?.applicationId || ""
    );
    const [loadingModules, setLoadingModules] = React.useState(false);

    // Efecto para cargar módulos cuando cambia la aplicación seleccionada
    React.useEffect(() => {
        if (selectedApplicationId === "" || selectedApplicationId === 0) {
            setModules([]);
            setFormData(prev => ({ ...prev, moduleId: 0 }));
            return;
        }
        
        fetchModules(selectedApplicationId as number);
    }, [selectedApplicationId]);

    // Inicializar applicationId si hay datos previamente cargados
    React.useEffect(() => {
        if (initialData?.module?.application?.applicationId) {
            setSelectedApplicationId(initialData.module.application.applicationId);
        }
        //setFormData(initialData || initialModuleData);
    }, [initialData?.module?.application?.applicationId]);

    const fetchModules = async (applicationId: number) => {
        setLoadingModules(true);
        try {
            const response = await moduleService.getAllByApplication(applicationId);
            if (response && response.success) {
                setModules(response.data);
            } else {
                console.error("Error al cargar módulos para la aplicación", applicationId);
                setModules([]);
            }
        } catch (error) {
            console.error("Error al cargar módulos para la aplicación", applicationId, error);
            setModules([]);
        } finally {
            setLoadingModules(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Manejo especial para el select de aplicación
        if (name === "applicationId") {
            setSelectedApplicationId(value === "" ? "" : Number(value));
            return;
        }

        // Manejo simple de tipos para inputs
        const formattedValue = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
        setFormData({
            ...formData,
            [name]: formattedValue
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg mb-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {initialData ? "Editar SubMódulo" : "Agregar Nuevo SubMódulo"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aplicación <span className="text-red-500 ml-1 font-bold">*</span></label>
                    <select 
                        name="applicationId"
                        value={selectedApplicationId}
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
                        <option value="">Seleccione una aplicación</option>
                        {applications.map(app => (
                            <option key={app.applicationId} value={app.applicationId}>{app.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Módulo <span className="text-red-500 ml-1 font-bold">*</span></label>
                    <select 
                        name="moduleId"
                        value={formData.moduleId}
                        onChange={handleChange}
                        required
                        disabled={selectedApplicationId === "" || loadingModules}
                        className="mt-1 block w-full px-3 py-2 
                        bg-white dark:bg-gray-700 
                        border border-gray-300 dark:border-gray-600 
                        rounded-md shadow-sm dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        transition-all duration-200 border-gray-300"
                    >
                        <option value="">
                            {loadingModules ? "Cargando módulos..." : "Seleccione un módulo"}
                        </option>
                        {modules.map(mod => (
                            <option key={mod.moduleId} value={mod.moduleId}>{mod.name}</option>
                        ))}
                    </select>
                </div>
                <Input
                        label="Nombre"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ingrese el nombre del módulo"
                        required
                    />

                <ColorPicker
                    label="Color representativo"
                    name="color"
                    value={formData.color ?? "#3b82f6"}
                    onChange={handleChange}
                />

                <div className="md:col-span-2">
                    <Input
                        label="Ruta"
                        type="text"
                        name="route"
                        value={formData.route}
                        onChange={handleChange}
                        placeholder="Ingrese la ruta del módulo"
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
                        disabled={loadingModules}
                        className="w-full md:w-auto px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {initialData ? "Guardar Cambios" : "Agregar SubMódulo"}
                    </button>
                </div>
            </form>
        </div>
    );
}