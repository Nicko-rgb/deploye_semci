import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../../core';
import { licenciaService } from '../services/licenciaService';
import { employeeService } from '../services/employeeService';
import type { Licencia, TipoLicencia, VacationBalance } from '../types/licencia.types';
import type { EmployeeSummary } from '../types';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import { useAccessLevel } from '../../../core/hooks/useAccessLevel';
import type { HierarchySelection } from '../../../core/components/RedLevelAccess';

interface LicenciaResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

/**
 * Hook para centralizar la lógica del módulo de Licencias
 */
export const useLicencias = () => {
    const { user } = useAuth();
    const breadcrumb = useAppBreadcrumb(['Licencias']);
    const { codigoUnico, isMicroredLevel, isEstablishmentLevel, isRedLevel, isMicroredHead, isEstablishmentHead } = useAccessLevel();

    // Estados de datos
    const [licencias, setLicencias] = useState<Licencia[]>([]);
    const [tipos, setTipos] = useState<TipoLicencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        EMITIDO_JEFE: 0,
        APROBADO_MICRORED: 0,
        RECHAZADO_MICRORED: 0,
        OBSERVADO_MICRORED: 0,
        APROBADO_RRHH: 0,
        RECHAZADO_RRHH: 0,
        OBSERVADO: 0
    });

    // Unified hierarchy state for RedLevelAccess component
    const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchySelection>({
        codigoRed: null,
        nomRed: null,
        codigoMicrored: null,
        nomMicrored: null,
        codigoUnico: null,
        nombreEstablecimiento: null,
    });


    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('TODOS');

    // UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'search' | 'form'>('search');

    // Search States
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<EmployeeSummary[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummary | null>(null);

    // History & Vacations
    const [employeeHistory, setEmployeeHistory] = useState<Licencia[]>([]);
    const [vacationBalance, setVacationBalance] = useState<VacationBalance | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        employeeId: '',
        tipoLicenciaId: '',
        startDate: '',
        endDate: '',
        totalDays: 0,
        reason: '',
    });

    // Perfil (legado, se mantiene por compatibilidad con el formulario de creación)
    const profile = (user as any)?.userData;
    const isRRHH = !isEstablishmentLevel;
    const isJefeEst = isEstablishmentLevel;
    const currentEstablishmentId = codigoUnico ?? undefined;

    // Modales Adicionales — targetStatus define qué estado enviar al backend según el nivel del actor
    const [observationModal, setObservationModal] = useState({ isOpen: false, licenciaId: 0, targetStatus: 'OBSERVADO' });
    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, licenciaId: 0, targetStatus: 'RECHAZADO_RRHH' });

    /**
     * Carga los tipos de licencia disponibles
     */
    const fetchTipos = useCallback(async () => {
        try {
            const response = await licenciaService.getTipos() as LicenciaResponse<TipoLicencia[]>;
            if (response.success) {
                setTipos(response.data);
            }
        } catch (err) {
            console.error('Error al cargar tipos de licencia:', err);
        }
    }, []);

    /**
     * Carga las licencias según el rol, filtros y paginación
     */
    const fetchLicencias = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {
                status: statusFilter,
                search: searchTerm,
                page,
                limit: 20,
                codigoRed: selectedHierarchy.codigoRed || undefined,
                codigoMicrored: selectedHierarchy.codigoMicrored || undefined,
                codigoUnico: selectedHierarchy.codigoUnico || undefined,
                isRedLevel: isRedLevel ? 'true' : undefined,
            };

            const statsFilters = {
                codigoRed: selectedHierarchy.codigoRed || undefined,
                codigoMicrored: selectedHierarchy.codigoMicrored || undefined,
                codigoUnico: selectedHierarchy.codigoUnico || undefined,
                isRedLevel: isRedLevel ? 'true' : undefined,
            };

            const [listRes, statsRes] = await Promise.all([
                licenciaService.list(filters) as Promise<LicenciaResponse<any>>,
                licenciaService.getStats(statsFilters) as Promise<LicenciaResponse<any>>
            ]);

            if (listRes.success) {
                setLicencias(listRes.data.rows);
                setTotalPages(listRes.data.totalPages);
            }

            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (err) {
            setError('Error al cargar las solicitudes de licencias');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedHierarchy, statusFilter, searchTerm, page, isRedLevel]);

    /**
     * Búsqueda de empleados para el formulario
     * Respeta el nivel de acceso (red / microred / establecimiento)
     */
    const handleEmployeeSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!employeeSearchTerm.trim()) return;

        setSearching(true);
        setSearchError(null);
        try {
            const params: any = {
                search: employeeSearchTerm,
                limit: 5,
                page: 1,
                isEnabled: true,
            };

            // Aplicar filtros de jerarquía según la selección actual del componente RedLevelAccess
            if (selectedHierarchy.codigoUnico && selectedHierarchy.codigoUnico !== 'TODOS') {
                params.codigoUnico = selectedHierarchy.codigoUnico;
            } else if (selectedHierarchy.codigoMicrored && selectedHierarchy.codigoMicrored !== 'TODOS') {
                params.codigoMicrored = selectedHierarchy.codigoMicrored;
            } else if (selectedHierarchy.codigoRed) {
                params.codigoRed = selectedHierarchy.codigoRed;
            }

            const response = await employeeService.getEmployees(params);

            if (response.success) {
                setSearchResults(response.data);
                if (response.data.length === 0) {
                    setSearchError(`No se encontraron resultados para "${employeeSearchTerm}"`);
                }
            }
        } catch (err) {
            console.error('Error searching employees:', err);
            setSearchError('Error al realizar la búsqueda de personal');
        } finally {
            setSearching(false);
        }
    };

    const fetchEmployeeInfo = async (employeeId: number) => {
        setLoadingInfo(true);
        try {
            const [historyRes, vacationsRes] = await Promise.all([
                licenciaService.getHistory(employeeId) as Promise<LicenciaResponse<Licencia[]>>,
                licenciaService.getVacations(employeeId) as Promise<LicenciaResponse<VacationBalance>>
            ]);

            if (historyRes.success) setEmployeeHistory(historyRes.data);
            if (vacationsRes.success) setVacationBalance(vacationsRes.data);
        } catch (err) {
            console.error('Error fetching employee license info:', err);
        } finally {
            setLoadingInfo(false);
        }
    };

    const selectEmployee = (employee: EmployeeSummary) => {
        setSelectedEmployee(employee);
        setFormData(prev => ({ ...prev, employeeId: String(employee.employee_id) }));
        setStep('form');
        fetchEmployeeInfo(employee.employee_id);
    };

    const calculateDays = (start: string, end: string) => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        const diff = e.getTime() - s.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            newData.totalDays = calculateDays(newData.startDate, newData.endDate);
            return newData;
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Valida el formulario client-side antes de enviar al backend.
     * Retorna null si es válido, o un string con el error.
     */
    const validateLicenciaForm = (data: typeof formData): string | null => {
        if (!data.employeeId) return 'Debe seleccionar un empleado';
        if (!data.tipoLicenciaId) return 'Debe seleccionar un tipo de licencia';
        if (!data.startDate) return 'Debe ingresar la fecha de inicio';
        if (!data.endDate) return 'Debe ingresar la fecha de fin';

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (start > end) return 'La fecha de inicio no puede ser mayor a la fecha de fin';
        if (data.totalDays <= 0) return 'El rango de fechas no es válido';

        // Validar reglas del tipo seleccionado
        const tipo = tipos.find(t => String(t.tipo_licencia_id) === String(data.tipoLicenciaId));
        if (tipo) {
            const rules = tipo.rules || {};

            // Días máximos (no aplica a acumulable)
            if (rules.max_days && !rules.is_accumulable && data.totalDays > rules.max_days) {
                return `"${tipo.name}" permite un máximo de ${rules.max_days} días por solicitud`;
            }

            // Días mínimos
            if (rules.min_days && data.totalDays < rules.min_days) {
                return `"${tipo.name}" requiere un mínimo de ${rules.min_days} días`;
            }

            // Antelación mínima
            if (rules.min_advance_days) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < rules.min_advance_days) {
                    return `"${tipo.name}" debe solicitarse con al menos ${rules.min_advance_days} días de anticipación`;
                }
            }

            // Saldo vacaciones (verifica contra el balance ya cargado)
            if (tipo.name === 'VACACIONES' && rules.is_accumulable && vacationBalance) {
                if (data.totalDays > vacationBalance.remaining_days) {
                    return `Sin saldo suficiente de vacaciones. Disponible: ${vacationBalance.remaining_days} días`;
                }
            }

            // Verificar solapamiento con historial del empleado
            if (employeeHistory.length > 0) {
                const sDate = data.startDate;
                const eDate = data.endDate;
                const conflicto = employeeHistory.find(h => {
                    if (h.status === 'RECHAZADO_RRHH' || h.status === 'BORRADOR') return false;
                    const hStart = h.startDate;
                    const hEnd = h.endDate;
                    return !(eDate < hStart || sDate > hEnd);
                });
                if (conflicto) {
                    return `Fechas en conflicto con "${conflicto.tipo?.name || 'licencia'}" del ${conflicto.startDate} al ${conflicto.endDate}`;
                }
            }

            // Documento adjunto (validación frontend informativa)
            if (tipo.requiresAttachment) {
                // Solo informamos; el adjunto real se maneja con upload posterior
                // No bloqueamos por UI (el backend valida)
            }
        }

        return null;
    };

    /**
     * Crea una nueva solicitud de licencia
     */
    const createLicencia = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación client-side
        const validationError = validateLicenciaForm(formData);
        if (validationError) {
            return { success: false, message: validationError };
        }

        setIsSubmitting(true);
        try {
            const response = await licenciaService.create({
                ...formData,
                codigoUnico: currentEstablishmentId,
                userId: (user as any)?.userId // Enviar userId desde el front como respaldo
            }) as LicenciaResponse<Licencia>;

            if (response.success) {
                setIsModalOpen(false);
                await fetchLicencias();
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error al crear la licencia' };
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Actualiza el estado de una licencia (Aprobar/Rechazar/Observar)
     */
    const updateLicenciaStatus = async (id: number, status: string, comments?: string, file?: File) => {
        setIsSubmitting(true);
        try {
            // En un escenario real aquí subiríamos el archivo y obtendríamos el nombre
            const responseAttachmentUrl = file ? file.name : undefined;

            const response = await licenciaService.updateStatus(id, status, (user as any)?.userId, {
                comments,
                responseAttachmentUrl
            }) as LicenciaResponse<any>;

            if (response.success) {
                setObservationModal({ isOpen: false, licenciaId: 0, targetStatus: 'OBSERVADO' });
                setRejectionModal({ isOpen: false, licenciaId: 0, targetStatus: 'RECHAZADO_RRHH' });
                await fetchLicencias();
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error al actualizar la licencia' };
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Actualiza las reglas de un tipo de licencia
     */
    const updateRules = async (tipoId: number, rules: any) => {
        setIsSubmitting(true);
        try {
            const response = await licenciaService.updateTipoRules(tipoId, rules) as LicenciaResponse<any>;
            if (response.success) {
                await fetchTipos();
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err: any) {
            return { success: false, message: err.message || 'Error al actualizar las reglas' };
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetModal = () => {
        setIsModalOpen(false);
        setStep('search');
        setEmployeeSearchTerm('');
        setSearchResults([]);
        setSelectedEmployee(null);
        setSearchError(null);
        setEmployeeHistory([]);
        setVacationBalance(null);
        setFormData({
            employeeId: '',
            tipoLicenciaId: '',
            startDate: '',
            endDate: '',
            totalDays: 0,
            reason: '',
        });
    };

    const openModal = () => {
        resetModal();
        setIsModalOpen(true);
    };

    const tipoOptions = useMemo(() => {
        return tipos.map(t => ({
            value: String(t.tipo_licencia_id),
            label: t.name
        }));
    }, [tipos]);


    // Carga inicial: tipos
    useEffect(() => {
        fetchTipos();
    }, [fetchTipos]);

    useEffect(() => {
        fetchLicencias();
    }, [fetchLicencias]);

    return {
        // States
        licencias,
        tipos,
        loading,
        error,
        stats,
        breadcrumb,
        isRRHH,
        isJefeEst,
        profile,
        searchTerm,
        setSearchTerm,

        // Pagination & Filters
        page,
        setPage,
        totalPages,
        statusFilter,
        setStatusFilter,
        selectedHierarchy,
        setSelectedHierarchy,
        isMicroredLevel,
        isEstablishmentLevel,
        isRedLevel,
        isMicroredHead,
        isEstablishmentHead,

        // Modal & Form States
        isModalOpen,
        isConfigModalOpen,
        setIsConfigModalOpen,
        observationModal,
        setObservationModal,
        rejectionModal,
        setRejectionModal,
        step,
        employeeSearchTerm,
        setEmployeeSearchTerm,
        searching,
        searchError,
        searchResults,
        selectedEmployee,
        employeeHistory,
        vacationBalance,
        loadingInfo,
        formData,
        isSubmitting,
        tipoOptions,

        // Actions
        actions: {
            openModal,
            closeModal: resetModal,
            openConfigModal: () => setIsConfigModalOpen(true),
            closeConfigModal: () => setIsConfigModalOpen(false),
            handleEmployeeSearch,
            selectEmployee,
            handleDateChange,
            handleFormChange,
            createLicencia,
            updateLicenciaStatus,
            updateRules,
            refresh: fetchLicencias,
            refreshTipos: fetchTipos,
            setStep,
            validateLicenciaForm
        }
    };
};
