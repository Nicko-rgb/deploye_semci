import React, { useState, useEffect, useCallback } from 'react';
import { Settings, X, Save, CheckCircle, Loader2, RotateCcw, Info } from 'lucide-react';
import type { TipoLicencia } from '../types/licencia.types';
import { licenciaService } from '../services/licenciaService';

interface LicenciaConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    tipos: TipoLicencia[];
    onSaved?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Definición de qué campos de reglas son relevantes por tipo de licencia.
// Cada entrada define solo las claves que ese tipo puede tener en `rules`.
// ─────────────────────────────────────────────────────────────────────────────
type FieldKey =
    | 'max_days'
    | 'min_days'
    | 'min_advance_days'
    | 'dias_por_anio'
    | 'acumulable_hasta'
    | 'is_accumulable'
    | 'dias_dentro_region'
    | 'dias_fuera_region'
    | 'extra_por_complicacion_dias';

interface FieldSchema {
    key: FieldKey;
    label: string;
    type: 'number' | 'checkbox';
    placeholder?: string;
    min?: number;
    max?: number;
    hint?: string;
}

// Campos disponibles por tipo (por NAME del tipo de licencia)
const TIPO_FIELDS: Record<string, FieldSchema[]> = {
    VACACIONES: [
        { key: 'dias_por_anio', label: 'Días por año', type: 'number', placeholder: '30', min: 1 },
        { key: 'acumulable_hasta', label: 'Acumulable hasta (años)', type: 'number', placeholder: '2', min: 1, max: 10 },
        { key: 'min_advance_days', label: 'Anticipación mínima (días)', type: 'number', placeholder: '15', min: 0 },
        { key: 'is_accumulable', label: 'Acumulable', type: 'checkbox' },
    ],
    ENFERMEDAD: [
        // No tiene max_days fijo (depende del certificado); sin campos numéricos relevantes
    ],
    MATERNIDAD: [
        { key: 'max_days', label: 'Días base', type: 'number', placeholder: '98', min: 1 },
        { key: 'extra_por_complicacion_dias', label: 'Días extra por complicación', type: 'number', placeholder: '30', min: 0 },
    ],
    PATERNIDAD: [
        { key: 'min_days', label: 'Días mínimos', type: 'number', placeholder: '10', min: 1 },
        { key: 'max_days', label: 'Días máximos', type: 'number', placeholder: '20', min: 1 },
    ],
    'FALLECIMIENTO FAMILIAR': [
        { key: 'dias_dentro_region', label: 'Días dentro de región', type: 'number', placeholder: '5', min: 1 },
        { key: 'dias_fuera_region', label: 'Días fuera de región', type: 'number', placeholder: '8', min: 1 },
    ],
    CAPACITACION: [
        // Variable, sin límite fijo
    ],
    ONOMASTICO: [
        { key: 'max_days', label: 'Días permitidos', type: 'number', placeholder: '1', min: 1 },
        { key: 'min_advance_days', label: 'Anticipación mínima (días)', type: 'number', placeholder: '30', min: 0 },
    ],
    'SIN GOCE DE HABER': [
        { key: 'max_days', label: 'Días máximos', type: 'number', placeholder: '90', min: 1 },
    ],
    SINDICAL: [
        // Variable/evaluada
    ],
    'CON GOCE DE HABER': [
        { key: 'max_days', label: 'Días máximos', type: 'number', placeholder: '—', min: 1 },
        { key: 'min_advance_days', label: 'Anticipación mínima (días)', type: 'number', placeholder: '—', min: 0 },
    ],
    'TRABAJO REMOTO': [
        { key: 'max_days', label: 'Días máximos', type: 'number', placeholder: '—', min: 1 },
        { key: 'min_advance_days', label: 'Anticipación mínima (días)', type: 'number', placeholder: '—', min: 0 },
    ],
};

// Campos comunes que aparecen en TODOS los tipos (además de los específicos)
// Solo requiresAttachment va aquí (es un campo del modelo, no de rules)
// No hay campos de rules comunes a todos.

// ─────────────────────────────────────────────────────────────────────────────
// Estado draft expresado como Record<string, string | boolean>
// Solo guarda las claves que corresponden al schema del tipo
// ─────────────────────────────────────────────────────────────────────────────
type DraftRuleValues = Record<string, string | boolean>;

type DraftTipo = {
    requiresAttachment: boolean;
    rules: DraftRuleValues;
};

/**
 * Inicializa el draft SOLO con las claves del schema de ese tipo.
 * No mezcla claves de otros tipos.
 */
function initDraft(tipo: TipoLicencia): DraftTipo {
    const schema = TIPO_FIELDS[tipo.name] ?? [];
    const ruleDraft: DraftRuleValues = {};

    schema.forEach(field => {
        const raw = (tipo.rules as any)?.[field.key];
        if (field.type === 'checkbox') {
            ruleDraft[field.key] = typeof raw === 'boolean' ? raw : false;
        } else {
            ruleDraft[field.key] = raw != null ? String(raw) : '';
        }
    });

    return {
        requiresAttachment: tipo.requiresAttachment ?? false,
        rules: ruleDraft,
    };
}

/**
 * Construye el objeto rules final a partir del draft,
 * SOLO con las claves del schema del tipo (sin contaminar con claves ajenas).
 */
function buildRules(draft: DraftRuleValues, schema: FieldSchema[], originalRules: any): any {
    // Empezamos con las claves originales para no perder campos que el servidor puso
    // pero que no están en el schema (e.g. requires_citt para ENFERMEDAD)
    const result = { ...originalRules };

    schema.forEach(field => {
        const val = draft[field.key];
        if (field.type === 'checkbox') {
            result[field.key] = Boolean(val);
        } else {
            const str = String(val ?? '').trim();
            if (str !== '') {
                result[field.key] = parseInt(str, 10);
            } else {
                // Si se dejó vacío, quitar la clave (sin límite)
                delete result[field.key];
            }
        }
    });

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export const LicenciaConfigModal: React.FC<LicenciaConfigModalProps> = ({
    isOpen,
    onClose,
    tipos,
    onSaved,
}) => {
    const [drafts, setDrafts] = useState<Record<number, DraftTipo>>({});
    const [saving, setSaving] = useState<Record<number, 'idle' | 'saving' | 'saved' | 'error'>>({});
    const [errors, setErrors] = useState<Record<number, string>>({});

    // Inicializar drafts al abrir el modal o cuando cambien los tipos
    useEffect(() => {
        if (!isOpen) return;
        const init: Record<number, DraftTipo> = {};
        tipos.forEach(t => { init[t.tipo_licencia_id] = initDraft(t); });
        setDrafts(init);
        setSaving({});
        setErrors({});
    }, [isOpen, tipos]);

    const updateDraft = useCallback((tipoId: number, field: keyof DraftTipo, value: any) => {
        setDrafts(prev => ({
            ...prev,
            [tipoId]: { ...prev[tipoId], [field]: value },
        }));
    }, []);

    const updateDraftRule = useCallback((tipoId: number, key: string, value: any) => {
        setDrafts(prev => ({
            ...prev,
            [tipoId]: {
                ...prev[tipoId],
                rules: { ...prev[tipoId].rules, [key]: value },
            },
        }));
    }, []);

    const handleSave = async (tipo: TipoLicencia) => {
        const id = tipo.tipo_licencia_id;
        const draft = drafts[id];
        if (!draft) return;

        const schema = TIPO_FIELDS[tipo.name] ?? [];
        const rules = buildRules(draft.rules, schema, tipo.rules);

        setSaving(prev => ({ ...prev, [id]: 'saving' }));
        setErrors(prev => ({ ...prev, [id]: '' }));

        try {
            await licenciaService.updateTipoConfig(id, {
                rules,
                requiresAttachment: draft.requiresAttachment,
            });
            setSaving(prev => ({ ...prev, [id]: 'saved' }));
            onSaved?.();
            setTimeout(() => setSaving(prev => ({ ...prev, [id]: 'idle' })), 2500);
        } catch (err: any) {
            setSaving(prev => ({ ...prev, [id]: 'error' }));
            setErrors(prev => ({ ...prev, [id]: err.message || 'Error al guardar' }));
        }
    };

    const handleReset = (tipo: TipoLicencia) => {
        const id = tipo.tipo_licencia_id;
        setDrafts(prev => ({ ...prev, [id]: initDraft(tipo) }));
        setErrors(prev => ({ ...prev, [id]: '' }));
        setSaving(prev => ({ ...prev, [id]: 'idle' }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configuración de Licencias</h3>
                            <p className="text-xs text-gray-500">Cada tipo muestra solo sus campos configurables · Guarda de forma independiente</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 max-h-[72vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tipos.map(tipo => {
                            const id = tipo.tipo_licencia_id;
                            const draft = drafts[id];
                            const status = saving[id] ?? 'idle';
                            const errMsg = errors[id];
                            const schema = TIPO_FIELDS[tipo.name] ?? [];
                            const numberFields = schema.filter(f => f.type === 'number');
                            const checkboxFields = schema.filter(f => f.type === 'checkbox');
                            const hasNoSpecificRules = schema.length === 0;

                            if (!draft) return null;

                            return (
                                <div key={id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/30 flex flex-col gap-3">
                                    {/* Cabecera del tipo */}
                                    <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-600 pb-2">
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-600 uppercase">{tipo.name}</h4>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleReset(tipo)}
                                                title="Restablecer cambios"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleSave(tipo)}
                                                disabled={status === 'saving'}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${status === 'saved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : status === 'error'
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                                                    }`}
                                            >
                                                {status === 'saving'
                                                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Guardando...</>
                                                    : status === 'saved'
                                                        ? <><CheckCircle className="w-3 h-3" /> Guardado</>
                                                        : <><Save className="w-3 h-3" /> Guardar</>
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error */}
                                    {errMsg && (
                                        <p className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded-md">{errMsg}</p>
                                    )}

                                    {/* Sin reglas configurables */}
                                    {hasNoSpecificRules ? (
                                        <div className="flex items-center gap-2 py-2 text-gray-500">
                                            <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="text-[13px] italic">Este tipo no tiene límites configurables (duración variable)</span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Campos numéricos */}
                                            {numberFields.length > 0 && (
                                                <div className={`grid gap-2 ${numberFields.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                                    {numberFields.map(field => (
                                                        <div key={field.key}>
                                                            <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                                                                {field.label}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min={field.min ?? 0}
                                                                max={field.max}
                                                                value={draft.rules[field.key] as string ?? ''}
                                                                onChange={e => updateDraftRule(id, field.key, e.target.value)}
                                                                placeholder={field.placeholder}
                                                                className="w-full px-3 py-1.5 text-[13px] font-bold rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Checkboxes específicos del tipo */}
                                            {checkboxFields.length > 0 && (
                                                <div className="flex flex-col gap-1 pt-1">
                                                    {checkboxFields.map(field => (
                                                        <label key={field.key} className="flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={draft.rules[field.key] as boolean ?? false}
                                                                onChange={e => updateDraftRule(id, field.key, e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                            />
                                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{field.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* requiresAttachment — común a TODOS los tipos */}
                                    <div className="border-t border-gray-100 dark:border-gray-600 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={draft.requiresAttachment}
                                                onChange={e => updateDraft(id, 'requiresAttachment', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Requiere documento adjunto</span>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 flex justify-between items-center">
                    <p className="text-xs text-gray-400">Los cambios se guardan por tipo de forma independiente</p>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
