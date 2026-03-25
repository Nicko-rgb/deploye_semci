import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, User, Building2, MapPin, AlertCircle, ChevronRight } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { rotationService } from '../services/rotationService';
import hierarchyService from '../../../core/services/hierarchyService';
import type { RedItem, MicroredItem, EstablecimientoItem } from '../../../core/services/hierarchyService';
import { InputText, Select } from './FormComponents';
import type { EmployeeSummary, CreateRotationDTO, UpdateRotationDTO } from '../types';
import { useAccessLevel } from '../../../core/hooks/useAccessLevel';

interface FormRotateProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    rotationId?: number; // ID para edición
}

export const FormRotate: React.FC<FormRotateProps> = ({ isOpen, onClose, onSuccess, rotationId }) => {
    const { isRedLevel, isMicroredLevel, isEstablishmentLevel, codigoRed, codigoMicrored, codigoUnico } = useAccessLevel();

    // UI State
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'search' | 'form'>('search');
    const isEditing = !!rotationId;

    // Data State
    const [redes, setRedes] = useState<RedItem[]>([]);
    const [microredes, setMicroredes] = useState<MicroredItem[]>([]);
    const [establecimientos, setEstablecimientos] = useState<EstablecimientoItem[]>([]);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<EmployeeSummary[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummary | null>(null);
    const [, setNextDocNumber] = useState<string>('01');

    // Form State
    const [formData, setFormData] = useState({
        targetLevel: 'ESTABLECIMIENTO' as 'RED' | 'MICRORED' | 'ESTABLECIMIENTO',
        targetCodigoRed: codigoRed || '01',
        targetCodigoMicrored: '',
        targetCodigoUnico: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
        documentRef: ''
    });

    // Load initial data
    useEffect(() => {
        const init = async () => {
            if (isOpen) {
                await loadInitialData();
                loadNextDocNumber();
                if (isEditing && rotationId) {
                    loadRotationData(rotationId);
                }
            } else {
                // Reset state when closed
                resetForm();
            }
        };
        init();
    }, [isOpen, rotationId]);

    const loadNextDocNumber = async () => {
        try {
            const response = await rotationService.getNextNumber();
            if (response.success) {
                setNextDocNumber(response.data);
                setFormData(prev => ({ ...prev, documentRef: response.data }));
            }
        } catch (err) {
            console.error('Error loading next doc number:', err);
        }
    };

    const loadInitialData = async () => {
        try {
            const data = await hierarchyService.getRedes();
            setRedes(data);
        } catch (err) {
            console.error('Error loading redes:', err);
        }
    };

    const loadRotationData = async (id: number) => {
        setLoading(true);
        try {
            const response = await rotationService.getRotationById(id);
            if (response.success && response.data) {
                const rotation = response.data;
                if (rotation.employee) {
                    setSelectedEmployee({
                        employee_id: rotation.employee.employee_id,
                        fullName: `${rotation.employee.lastNamePaternal} ${rotation.employee.lastNameMaternal}, ${rotation.employee.firstName}`,
                        documentNumber: rotation.employee.documentNumber,
                        email: rotation.employee.email || '',
                        occupationalGroup: rotation.employee.occupationalGroup || '',
                        personnelType: rotation.employee.personnelType || '',
                        establishment: rotation.originName || '---',
                        isEnabled: true
                    });
                }

                setFormData({
                    targetLevel: rotation.targetLevel || 'ESTABLECIMIENTO',
                    targetCodigoRed: rotation.targetCodigoRed || codigoRed || '',
                    targetCodigoMicrored: rotation.targetCodigoMicrored || '',
                    targetCodigoUnico: rotation.targetCodigoUnico || '',
                    startDate: rotation.startDate,
                    endDate: rotation.endDate || '',
                    description: rotation.description || '',
                    documentRef: rotation.documentRef || ''
                });

                setStep('form');
            }
        } catch (err) {
            console.error('Error loading rotation:', err);
            setError('Error al cargar los datos de la rotación');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep('search');
        setSearchTerm('');
        setSearchResults([]);
        setSelectedEmployee(null);
        setFormData({
            targetLevel: 'ESTABLECIMIENTO',
            targetCodigoRed: codigoRed || '01',
            targetCodigoMicrored: '',
            targetCodigoUnico: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            description: '',
            documentRef: ''
        });
        setError(null);
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Limpiar campos inferiores si cambia el nivel superior
            if (name === 'targetLevel') {
                newData.targetCodigoMicrored = '';
                newData.targetCodigoUnico = '';
            }
            if (name === 'targetCodigoMicrored') {
                newData.targetCodigoUnico = '';
            }
            return newData;
        });
    };

    const levelOptions = [
        { value: 'RED', label: 'NIVEL RED' },
        { value: 'MICRORED', label: 'NIVEL MICRORED' },
        { value: 'ESTABLECIMIENTO', label: 'ESTABLECIMIENTO DE SALUD' }
    ];

    // Cascading loads: microredes when red changes, establishments when microred changes
    useEffect(() => {
        if (formData.targetCodigoRed) {
            hierarchyService.getMicrorredesByRed(formData.targetCodigoRed).then(setMicroredes);
        } else {
            setMicroredes([]);
        }
    }, [formData.targetCodigoRed]);

    useEffect(() => {
        if (formData.targetCodigoRed && formData.targetCodigoMicrored) {
            hierarchyService.getEstablecimientosByMicrored(formData.targetCodigoRed, formData.targetCodigoMicrored).then(setEstablecimientos);
        } else {
            setEstablecimientos([]);
        }
    }, [formData.targetCodigoRed, formData.targetCodigoMicrored]);

    const redOptions = useMemo(() =>
        redes.map(r => ({ value: r.codigo_red, label: r.nom_red }))
    , [redes]);

    const microredOptions = useMemo(() =>
        microredes.map(m => ({ value: m.codigo_microred, label: m.nom_microred }))
    , [microredes]);

    const establishmentOptions = useMemo(() =>
        establecimientos.map(e => ({ value: e.codigo_unico, label: e.nombre_establecimiento }))
    , [establecimientos]);

    // Helpers para la vista previa
    const originLabel = useMemo(() => {
        const origin = selectedEmployee?.establishment || '';
        if (origin.startsWith('RED:')) return 'de la RED';
        if (origin.startsWith('MICRORED:')) return 'de la MICRORED';
        return 'del ESTABLECIMIENTO';
    }, [selectedEmployee]);

    const originName = useMemo(() => {
        const origin = selectedEmployee?.establishment || '---';
        // Limpiamos el prefijo si existe para que no se repita (ej: "de la RED RED: CORONEL")
        return origin.replace(/^(RED:|MICRORED:)\s*/, '');
    }, [selectedEmployee]);

    const targetLabel = useMemo(() => {
        if (formData.targetLevel === 'RED') return 'en la RED';
        if (formData.targetLevel === 'MICRORED') return 'en la MICRORED';
        if (formData.targetLevel === 'ESTABLECIMIENTO') return 'en el ESTABLECIMIENTO';
        return 'en el';
    }, [formData.targetLevel]);

    const targetName = useMemo(() => {
        if (formData.targetLevel === 'RED') {
            return redes.find(r => r.codigo_red === formData.targetCodigoRed)?.nom_red || 'RED DE SALUD';
        }
        if (formData.targetLevel === 'MICRORED') {
            return microredes.find(m => m.codigo_microred === formData.targetCodigoMicrored)?.nom_microred || '---';
        }
        if (formData.targetLevel === 'ESTABLECIMIENTO') {
            return establecimientos.find(e => e.codigo_unico === formData.targetCodigoUnico)?.nombre_establecimiento || '---';
        }
        return '---';
    }, [formData.targetLevel, formData.targetCodigoRed, formData.targetCodigoMicrored, formData.targetCodigoUnico, redes, microredes, establecimientos]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchTerm.trim()) return;

        setSearching(true);
        setError(null);
        try {
            const params: any = {
                search: searchTerm,
                limit: 5,
                page: 1,
                isEnabled: true, // Solo empleados activos pueden rotar
            };

            if (isEstablishmentLevel) {
                params.codigoUnico = codigoUnico;
            } else if (isMicroredLevel) {
                params.codigoMicrored = codigoMicrored;
            } else if (isRedLevel) {
                params.codigoRed = codigoRed;
            }

            const response = await employeeService.getEmployees(params);

            if (response.success) {
                setSearchResults(response.data);
                if (response.data.length === 0) {
                    setError('No se encontraron empleados con ese criterio');
                }
            }
        } catch (err) {
            console.error('Error searching employees:', err);
            setError('Error al buscar empleados');
        } finally {
            setSearching(false);
        }
    };

    const selectEmployee = (employee: EmployeeSummary) => {
        setSelectedEmployee(employee);
        setStep('form');
        setSearchResults([]);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        // Validation
        if (formData.targetLevel === 'ESTABLECIMIENTO' && !formData.targetCodigoUnico) {
            setError('Debe seleccionar el establecimiento de destino');
            return;
        }
        if (formData.targetLevel === 'MICRORED' && !formData.targetCodigoMicrored) {
            setError('Debe seleccionar la microred de destino');
            return;
        }
        if (!formData.startDate) {
            setError('Debe seleccionar la fecha de inicio');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let codigoRedFinal: string = formData.targetCodigoRed;
            let codigoMicroredFinal: string | undefined = formData.targetCodigoMicrored;
            let codigoUnicoFinal: string | undefined = formData.targetCodigoUnico;

            if (formData.targetLevel === 'MICRORED') {
                const mr = microredes.find(m => m.codigo_microred === formData.targetCodigoMicrored);
                codigoMicroredFinal = formData.targetCodigoMicrored;
                codigoRedFinal = mr?.codigo_red || formData.targetCodigoRed;
                codigoUnicoFinal = undefined;
            } else if (formData.targetLevel === 'ESTABLECIMIENTO') {
                const est = establecimientos.find(e => e.codigo_unico === formData.targetCodigoUnico);
                codigoMicroredFinal = est?.codigo_microred || formData.targetCodigoMicrored;
                codigoRedFinal = est?.codigo_red || formData.targetCodigoRed;
                codigoUnicoFinal = formData.targetCodigoUnico;
            } else if (formData.targetLevel === 'RED') {
                codigoMicroredFinal = undefined;
                codigoUnicoFinal = undefined;
            }

            const payload: CreateRotationDTO = {
                employeeId: selectedEmployee.employee_id,
                targetLevel: formData.targetLevel,
                targetCodigoRed: codigoRedFinal,
                targetCodigoMicrored: codigoMicroredFinal,
                targetCodigoUnico: codigoUnicoFinal,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                description: formData.description,
                documentRef: formData.documentRef
            };

            let response;
            if (isEditing && rotationId) {
                response = await rotationService.updateRotation(rotationId, payload as UpdateRotationDTO);
            } else {
                response = await rotationService.createRotation(payload);
            }

            if (response.success) {
                // Si es una nueva rotación, descargar el documento automáticamente
                if (!isEditing && response.data?.rotation_id) {
                    try {
                        await rotationService.downloadRotationDoc(response.data.rotation_id);
                    } catch (downloadErr) {
                        console.error('Error al descargar documento tras creación:', downloadErr);
                    }
                }
                onSuccess();
                onClose();
            } else {
                setError(response.message || 'Error al registrar la rotación');
            }
        } catch (err: any) {
            console.error('Error processing rotation:', err);
            setError(err.message || 'Error al procesar la rotación');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

            {/* Modal */}
            <div className={`relative m-auto transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full ${step === 'form' ? 'sm:max-w-[95%]' : 'sm:my-8 sm:max-w-xl'}`}>
                {/* Header */}
                <div className="bg-white p-3 sm:px-6 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        {isEditing ? 'Editar Rotación de Personal' : 'Nueva Rotación de Personal'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors p-1" ><X className="w-6 h-6" /></button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30 p-2">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2 border border-red-100">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Search Employee */}
                    {step === 'search' && (
                        <div className="space-y-4 max-w-lg mx-auto py-4 ">
                            <p className="text-sm text-gray-500 text-center">
                                Busque el empleado por DNI o nombre para iniciar el proceso de rotación.
                            </p>
                            {/* ... (resto del buscador igual) */}
                            <form onSubmit={handleSearch} className="relative">
                                <div className="flex items-center gap-2">
                                    <InputText
                                        label="Buscar empleado (DNI o Nombres)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        Icon={Search}
                                        variant="variant2"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={searching || !searchTerm.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center h-[42px]"
                                    >
                                        {searching ? 'Buscando...' : 'Buscar'}
                                    </button>
                                </div>
                            </form>

                            {searchResults.length > 0 && (
                                <div className="mt-2 border rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto bg-white">
                                    {searchResults.map((emp) => (
                                        <button
                                            key={emp.employee_id}
                                            onClick={() => selectEmployee(emp)}
                                            className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {emp.fullName}
                                                </p>
                                                <p className="text-xs text-gray-500 flex flex-col gap-1">
                                                    <span className='truncate leading-none'>DNI: {emp.documentNumber}</span>
                                                    <span className="truncate leading-none">{emp.profession || 'Sin profesión'}</span>
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-400 group-hover:text-blue-600 flex items-center gap-1">
                                                Seleccionar <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Rotation Details Layout Horizontal */}
                    {step === 'form' && selectedEmployee && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start px-2">
                            {/* Form Column */}
                            <form id="rotation-form" onSubmit={handleSubmit} className="space-y-3">
                                {/* Selected Employee Card */}
                                <div className="bg-blue-50 p-3 flex-1 rounded-lg border border-blue-100 flex justify-between flex-col shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-blue-900">{selectedEmployee.fullName}</h4>
                                        {!isEditing && (
                                            <button type="button" onClick={() => setStep('search')} className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-white px-2 py-1 rounded border border-blue-200" >
                                                CAMBIAR EMPLEADO
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-800/80 uppercase tracking-tight">
                                        <div className="flex items-center gap-1 text-[13px]">
                                            <span className='font-bold text-blue-600 text-[13px] '>DNI: </span>
                                            <span className='text-[13px]'>{selectedEmployee.documentNumber} </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[13px]">
                                            <span className='font-bold text-blue-600 text-[13px]'>TIPO: </span>
                                            <span className='text-[13px]'>{selectedEmployee.personnelType || '---'} </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[13px]">
                                            <span className='font-bold text-blue-600 text-[13px] mr-1'>PROFESIÓN:</span>
                                            <span className='text-[13px] truncate'>{selectedEmployee.profession || 'SIN PROFESIÓN ASIGNADA'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[13px]">
                                            <span className='font-bold text-blue-600 mr-1 text-[13px] flex items-center gap-1'><Building2 className="w-3.5 h-3.5 text-blue-600" />ORIGEN:</span>
                                            <span className='text-[13px] truncate'>{selectedEmployee.establishment || 'SIN ORIGEN ASIGNADO'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Selectores de Destino */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Configuración de Destino</h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Select
                                            label="Nivel de Destino"
                                            name="targetLevel"
                                            value={formData.targetLevel}
                                            onChange={handleInputChange}
                                            options={levelOptions}
                                            Icon={MapPin}
                                        />
                                        <Select
                                            label="Red de Salud"
                                            name="targetCodigoRed"
                                            value={formData.targetCodigoRed}
                                            onChange={handleInputChange}
                                            options={redOptions}
                                            Icon={Building2}
                                            disabled={!!codigoRed}
                                            className={codigoRed ? 'bg-gray-50' : ''}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {formData.targetLevel !== 'RED' && (
                                            <Select
                                                label="Microred de Destino"
                                                name="targetCodigoMicrored"
                                                value={formData.targetCodigoMicrored}
                                                onChange={handleInputChange}
                                                options={microredOptions}
                                                Icon={Building2}
                                            />
                                        )}
                                        {formData.targetLevel === 'ESTABLECIMIENTO' && (
                                            <Select
                                                label="Establecimiento de Destino"
                                                name="targetCodigoUnico"
                                                value={formData.targetCodigoUnico}
                                                onChange={handleInputChange}
                                                options={establishmentOptions}
                                                Icon={MapPin}
                                                disabled={!formData.targetCodigoMicrored}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Fechas y Referencia */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Información del Documento</h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <InputText
                                            type="date"
                                            label="Fecha Inicio"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            variant="variant2"
                                            required
                                        />
                                        <InputText
                                            type="date"
                                            label="Fecha Fin (Opcional)"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            variant="variant2"
                                        />
                                        <InputText
                                            label="Nº Correlativo"
                                            name="documentRef"
                                            value={formData.documentRef}
                                            onChange={handleInputChange}
                                            variant="variant2"
                                            placeholder="Ej: 01"
                                            required
                                            disabled
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                            Descripción / Motivo (Cuerpo del Documento)
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-4 border transition-all hover:border-blue-300 min-h-[120px] resize-none"
                                            placeholder="Describa el motivo de la rotación..."
                                            required
                                        />
                                    </div>
                                </div>
                            </form>

                            {/* Preview Column */}
                            <div className="h-full space-y-2 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.3em]">Vista Previa en Tiempo Real</span>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>

                                <div className="border border-gray-500 shadow-inner overflow-y-auto max-h-[calc(100vh-250px)]">
                                    <div className="bg-white p-8 shadow-2xl text-[12px] leading-relaxed text-gray-800 font-serif max-w-full mx-auto rounded-sm">
                                        <div className="mb-8">
                                            <p>Manantay, <span className="font-bold">{new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
                                        </div>

                                        <div className="mb-8">
                                            <p className="font-bold underline text-sm tracking-tight">
                                                CARTA Nº {formData.documentRef || 'XX'}-{new Date().getFullYear()}-GRU-DIRESA-RIS1CP-DIS
                                            </p>
                                        </div>

                                        <div className="mb-8 space-y-0.5">
                                            <p>Señor:</p>
                                            <p className="font-bold">CPCC. Irma Salís Torres</p>
                                            <p>Jefe de la Unidad de Recursos Humanos</p>
                                        </div>

                                        <div className="grid grid-cols-[90px_1fr] gap-2 mb-2">
                                            <p className="font-bold">Asunto</p>
                                            <p>: Solicito rotación de personal</p>
                                        </div>

                                        <div className="grid grid-cols-[90px_1fr] gap-2 mb-10">
                                            <p className="font-bold">Referencia</p>
                                            <p>: Nota Informativa Nº {formData.documentRef || 'XX'}-{new Date().getFullYear()}-GOREU-DRIS1CP/DIS-UEIT</p>
                                        </div>

                                        <div className="mb-6">
                                            <p className="font-bold">De mi especial consideración:</p>
                                        </div>

                                        <div className="text-justify mb-6 space-y-6">
                                            <p>
                                                Es grato dirigirme a usted, para saludarle cordialmente y al mismo tiempo en atención al documento de la referencia,
                                                donde comunica que actualmente la Red Integrada de Salud 1 Coronel Portillo cuenta con 6 Microrredes y 92 establecimientos de salud,
                                                que por medio de la Unidad de Estadística, Informática y Telecomunicaciones, es necesario contar un recurso humano, para
                                                <span className="font-bold text-blue-600 underline decoration-dotted bg-blue-50/50 px-1 rounded"> {formData.description || ' [completar motivo en el campo descripción] '} </span>
                                                {targetLabel} <span className="font-bold underline">{targetName}</span>.
                                            </p>

                                            <p>
                                                En ese contexto, se solicita a su despacho por necesidad de servicio, la rotación del Servidor
                                                <span className="font-bold uppercase"> {selectedEmployee?.occupationalGroup || '[GRUPO OCUPACIONAL]'} </span>
                                                <span className="font-bold uppercase"> {selectedEmployee?.personnelType || '[TIPO PERSONAL]'} </span>
                                                <span className="font-bold uppercase"> {selectedEmployee?.fullName || '[NOMBRE COMPLETO]'} </span> con <span className="font-bold">DNI {selectedEmployee?.documentNumber}</span> {originLabel} <span className="font-bold underline uppercase">{originName}</span> de la oficina <span className="font-bold uppercase">{selectedEmployee?.oficinaDireccion || '--SIN OFICINA.--'}</span>.
                                            </p>
                                        </div>

                                        <div className="mb-12">
                                            <p>
                                                Sin otro en particular, me suscribo de usted, no sin antes reiterar mi especial consideración y estima personal.
                                            </p>
                                        </div>

                                        <div className="mt-16 flex flex-col items-start">
                                            <p>Atentamente,</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border p-3 flex flex-col sm:flex-row-reverse gap-3">
                    {step === 'form' ? (
                        <>
                            <button
                                type="submit"
                                form="rotation-form"
                                disabled={loading}
                                className="inline-flex w-full sm:w-auto justify-center rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all uppercase tracking-wide"
                            >
                                {loading ? (isEditing ? 'Guardando...' : 'Registrando...') : (isEditing ? 'Guardar Cambios' : 'Registrar y Emitir')}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex w-full sm:w-auto justify-center rounded-lg bg-white px-8 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all uppercase tracking-wide"
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex w-full sm:w-auto justify-center rounded-lg bg-white px-8 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all uppercase tracking-wide"
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
