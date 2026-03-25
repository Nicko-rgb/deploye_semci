import { useState, useEffect, useMemo } from 'react';
import { X, Save, Palette, AlertCircle } from 'lucide-react';
import type { ShiftType } from '../types';
import { turnosService } from '../services/turnosService';
// import toast from 'react-hot-toast';

interface ColorEditProps {
    isOpen: boolean;
    onClose: () => void;
    shiftTypes: ShiftType[];
    onUpdateSuccess: () => void;
}

export default function ColorEdit({
    isOpen,
    onClose,
    shiftTypes,
    onUpdateSuccess
}: ColorEditProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [localColors, setLocalColors] = useState<Record<number, string>>({});

    // Sincronizar estados para animación de entrada/salida
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            const timer = setTimeout(() => setIsAnimating(true), 10);
            // Inicializar colores locales
            const colors: Record<number, string> = {};
            shiftTypes.forEach(st => {
                colors[st.shift_type_id] = st.color || '#ffffff';
            });
            setLocalColors(colors);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shiftTypes]);

    // Calcular si hay cambios pendientes
    const hasChanges = useMemo(() => {
        return shiftTypes.some(st => localColors[st.shift_type_id] !== st.color);
    }, [localColors, shiftTypes]);

    const changedCount = useMemo(() => {
        return shiftTypes.filter(st => localColors[st.shift_type_id] !== st.color).length;
    }, [localColors, shiftTypes]);

    if (!isVisible) return null;

    const handleColorChange = (id: number, color: string) => {
        setLocalColors(prev => ({ ...prev, [id]: color }));
    };

    const handleSaveAll = async () => {
        const changes = shiftTypes
            .filter(st => localColors[st.shift_type_id] !== st.color)
            .map(st => ({
                id: st.shift_type_id,
                color: localColors[st.shift_type_id]
            }));

        if (changes.length === 0) return;

        setSaving(true);
        try {
            const response = await turnosService.bulkUpdateShiftTypeColors(changes);
            if (response.success) {
                // toast.success(`Se actualizaron ${changes.length} colores correctamente`);
                onUpdateSuccess();
                // onClose();
            } else {
                // toast.error(response.message || 'Error al actualizar colores');
            }
        } catch (error) {
            console.error('Error:', error);
            // toast.error('Error de conexión al actualizar colores');
        } finally {
            setSaving(false);
        }
    };

    const handleResetAll = () => {
        const colors: Record<number, string> = {};
        shiftTypes.forEach(st => {
            colors[st.shift_type_id] = st.color || '#ffffff';
        });
        setLocalColors(colors);
        // toast.success('Cambios revertidos');
    };

    return (
        <div 
            className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300 ${
                isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transition-all duration-300 transform ${
                    isAnimating 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-95 translate-y-4'
                }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Colores de Turnos</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Personaliza la visualización de la matriz</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Info Bar if changes */}
                {hasChanges && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30 px-6 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Tienes {changedCount} cambios sin guardar
                        </div>
                        <button 
                            onClick={handleResetAll}
                            className="text-[10px] uppercase font-bold text-amber-600 hover:text-amber-700 dark:text-amber-500 underline underline-offset-2"
                        >
                            Descartar cambios
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shiftTypes.map((type) => {
                            const isChanged = localColors[type.shift_type_id] !== type.color;
                            return (
                                <div 
                                    key={type.shift_type_id}
                                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                                        isChanged 
                                            ? 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-800/30 dark:bg-indigo-900/10' 
                                            : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20'
                                    }`}
                                >
                                    {/* Previsualización del Turno */}
                                    <div 
                                        className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm shrink-0 relative"
                                        style={{ 
                                            backgroundColor: localColors[type.shift_type_id],
                                            color: 'black',
                                            border: '1px solid rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {type.abbreviation}
                                        {isChanged && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-800" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800 dark:text-white truncate text-sm">
                                            {type.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {type.startTime.substring(0, 5)} - {type.endTime.substring(0, 5)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={localColors[type.shift_type_id] || '#ffffff'}
                                            onChange={(e) => handleColorChange(type.shift_type_id, e.target.value)}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white dark:border-gray-700 shadow-sm p-0 bg-transparent"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving || !hasChanges}
                        className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                            hasChanges 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                        }`}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Guardar Cambios {hasChanges && `(${changedCount})`}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
