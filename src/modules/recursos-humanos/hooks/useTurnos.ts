import { useState, useCallback, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { turnosService } from '../services/turnosService';
import hierarchyService from '../../../core/services/hierarchyService';
import { organigramaService } from '../services/organigramaService';
import { SHIFT_CATEGORY_RULES, SHIFT_SEQUENCE_RULES } from '../utils/shiftRules';
import type { EstablishmentItem, EmployeeTurno, ShiftType, ICreateShiftDto, ShiftSubmission, SubmissionPackage } from '../types';
import { useAuth } from '../../../core';
import { useAccessLevel } from '../../../core/hooks/useAccessLevel';

export function useTurnos() {
    const { user } = useAuth();
    const {
        isRedLevel, codigoUnico: userCodigoUnico,
        codigoRed: userCodigoRed, codigoDisa: userCodigoDisa,
        isProfessionHead, professionId, professionGroup,
        isEstablishmentHead, isMicroredHead,
        isRrhhEst, isRrhhRed,
    } = useAccessLevel();

    // Puede aprobar/rechazar en algún nivel del flujo (no es quien programa)
    const isApprover = isRrhhEst || isEstablishmentHead || isMicroredHead || isRrhhRed;

    /**
     * Conjunto de estados en los que este actor puede aprobar/rechazar.
     * Un mismo empleado puede tener múltiples roles (ej: RRHH + Jefe Est),
     * por lo que acumulamos todos sus niveles en lugar de retornar solo uno.
     */
    const approverStatuses = useMemo(() => {
        const statuses: string[] = [];
        if (isRrhhEst)           statuses.push('ENVIADO');
        if (isEstablishmentHead) statuses.push('APR_RRHH_EST');
        if (isMicroredHead)      statuses.push('APR_JEFE_EST');
        if (isRrhhRed)           statuses.push('APR_JEFE_MR');
        return statuses;
    }, [isRrhhEst, isEstablishmentHead, isMicroredHead, isRrhhRed]);
    // ─── Establecimientos ────────────────────────────────────────────────────────
    const [establishments, setEstablishments] = useState<EstablishmentItem[]>([]);
    const [selectedEstId, setSelectedEstId] = useState<string>('');
    const [loadingEsts, setLoadingEsts] = useState<boolean>(true);

    // ─── Filtros y búsqueda ──────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [groupBy, setGroupBy] = useState<'service' | 'profession' | 'condicionLaboral'>('profession');
    const [tipoPersonal, setTipoPersonal] = useState<string>('ASISTENCIAL');

    // ─── Fecha ───────────────────────────────────────────────────────────────────
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // ─── Empleados y turnos ───────────────────────────────────────────────────────
    const [employees, setEmployees] = useState<EmployeeTurno[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ─── Tipos de turno ──────────────────────────────────────────────────────────
    const [allowedShiftTypes, setAllowedShiftTypes] = useState<ShiftType[]>([]);

    // ─── Cambios pendientes ───────────────────────────────────────────────────────
    const [pendingChanges, setPendingChanges] = useState<Record<string, ICreateShiftDto>>({});
    const [saving, setSaving] = useState<boolean>(false);

    // ─── Submission del mes actual ────────────────────────────────────────────────
    const [submission, setSubmission] = useState<ShiftSubmission | null>(null);
    const [submissionLoading, setSubmissionLoading] = useState<boolean>(false);

    // ─── Visibilidad de turnos ────────────────────────────────────────────────────
    const [shiftVisibility, setShiftVisibility] = useState<{ allowed: boolean; status: string | null } | null>(null);

    // ─── Bandeja RRHH (agrupada por paquete: establecimiento + mes) ───────────────
    const [submissions, setSubmissions] = useState<SubmissionPackage[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);

    // ─── Grupos ASISTENCIALES del establecimiento (solo para RRHH_EST) ───────────
    // Necesario para validar que todos enviaron antes de permitir aprobar
    const [asistencialGroups, setAsistencialGroups] = useState<string[]>([]);

    // ─── Modal de rechazo (ahora opera sobre paquetes, no submission individual) ──
    const [rejectModal, setRejectModal] = useState<{
        isOpen: boolean;
        /** codigoUnico del paquete a rechazar */
        codigoUnico: string;
        /** Mes del paquete a rechazar (YYYY-MM) */
        yearMonth: string;
        message: string;
    }>({ isOpen: false, codigoUnico: '', yearMonth: '', message: 'TURNOS MAL CREADOS, CORREGIR' });

    // ─── UI ───────────────────────────────────────────────────────────────────────
    const [showExportModal, setShowExportModal] = useState(false);
    const [showColorModal, setShowColorModal] = useState(false);

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (t) => { t.onmouseenter = Swal.stopTimer; t.onmouseleave = Swal.resumeTimer; }
    });

    const showToast = useCallback((message: string, type: 'success' | 'error', duration = 4000) => {
        Toast.fire({ icon: type, title: message, timer: duration });
    }, []);

    const months = useMemo(() => [
        { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' },
        { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' },
        { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' },
        { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' }
    ], []);

    // Bloquea edición cuando el mes ya fue enviado o está en revisión/aprobado
    const isSubmissionLocked = useMemo(
        () => ['ENVIADO', 'APR_RRHH_EST', 'APR_JEFE_EST', 'APR_JEFE_MR', 'APROBADO'].includes(submission?.status ?? ''),
        [submission]
    );

    // ─── Cargar establecimientos ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchAllEsts = async () => {
            try {
                // Cargamos todos los establecimientos de la red 01 para metadata/tooltips
                const data = await hierarchyService.getEstablecimientosByRed('01');
                const mapped: EstablishmentItem[] = data.map(e => ({
                    establecimiento_id: 0,
                    nombreEstablecimiento: e.nombre_establecimiento,
                    ubigeo: '',
                    nombreRed: e.nom_red,
                    nombreMicrored: e.nom_microred,
                    descripcionSector: '',
                    codigoUnico: e.codigo_unico,
                    departamento: '',
                    provincia: '',
                    distrito: '',
                    categoriaEstablecimiento: e.categoria_establecimiento,
                    codigoMicrored: e.codigo_microred,
                    codigoRed: e.codigo_red,
                }));
                setEstablishments(mapped);
            } catch (err) {
                console.error('Error al cargar metadata de establecimientos:', err);
            } finally {
                setLoadingEsts(false);
            }
        };
        fetchAllEsts();
    }, []);

    // ─── Cargar grupos ASISTENCIALES del establecimiento (solo RRHH_EST) ─────────
    useEffect(() => {
        if (!isRrhhEst || !userCodigoUnico) return;
        organigramaService
            .getEstablecimientoDetalle(
                userCodigoUnico,
                userCodigoRed ?? undefined,
                userCodigoDisa ?? undefined,
            )
            .then(res => {
                if (res.success && res.data) {
                    const grupos = res.data.profesiones
                        .filter(g => g.tipoPersonal === 'ASISTENCIAL')
                        .map(g => g.grupo);
                    setAsistencialGroups(grupos);
                }
            })
            .catch(err => console.error('Error al cargar grupos ASISTENCIALES:', err));
    }, [isRrhhEst, userCodigoUnico, userCodigoRed, userCodigoDisa]);

    // ─── Cargar bandeja de envíos (todos los niveles aprobadores) ────────────────
    const fetchSubmissions = useCallback(async () => {
        if (!isApprover || !user) return;
        setSubmissionsLoading(true);
        try {
            const res = await turnosService.getSubmissions((user as any).userId);
            if (res.success) setSubmissions(res.data.rows);
        } catch (err) {
            console.error('Error al cargar bandeja de envíos:', err);
        } finally {
            setSubmissionsLoading(false);
        }
    }, [isApprover, user]);

    useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

    /**
     * Carga todos los datos del calendario en una sola llamada HTTP.
     * Reemplaza fetchEmployeesOnly + fetchSubmissionStatus + fetchShiftsOnly (3 funciones, 2 useEffects).
     *
     * El backend resuelve en paralelo: empleados, tipos de turno, visibilidad y estado de envío.
     * Los turnos y licencias solo se retornan si el usuario tiene permiso de verlos.
     */
    const fetchCalendar = useCallback(async (codigoUnico: string, month: number, year: number) => {
        if (!codigoUnico) {
            setEmployees([]);
            setPendingChanges({});
            setShiftVisibility(null);
            setSubmission(null);
            return;
        }

        setPendingChanges({});
        setShiftVisibility(null);
        setLoading(true);
        setSubmissionLoading(true);
        setError(null);

        try {
            // Jefe de profesión filtra la submission por su grupo; otros roles no filtran
            const pg = isProfessionHead ? (professionGroup ?? null) : null;
            const res = await turnosService.getCalendar(codigoUnico, month, year, pg);

            if (!res.success) {
                setError('Error al cargar el calendario');
                return;
            }

            const { employees: emps, shiftTypes, visibility, submission: sub, shifts, licencias } = res.data;

            // Tipos de turno permitidos según categoría del establecimiento ──────
            if (shiftTypes) setAllowedShiftTypes(shiftTypes);

            // Empleados enriquecidos con sus turnos y licencias del mes ──────────
            const enriched = (emps ?? []).map(emp => ({
                ...emp,
                shifts: (shifts ?? [])
                    .filter((s: any) => s.employeeId === emp.employee_id)
                    .map((s: any) => ({ day: s.day, shift_type_id: s.shift_type_id, shiftType: s.shiftType })),
                licencias: (licencias ?? []).filter((l: any) => l.employeeId === emp.employee_id),
            }));
            setEmployees(enriched);

            // Visibilidad del calendario (si el actor puede ver los turnos) ──────
            setShiftVisibility(visibility ?? null);

            // Estado del envío mensual (BORRADOR/ENVIADO/APR.../APROBADO) ────────
            setSubmission(sub ?? null);

        } catch (err: any) {
            setError(err.message || 'Error inesperado al cargar el calendario');
        } finally {
            setLoading(false);
            setSubmissionLoading(false);
        }
    }, [isProfessionHead, professionGroup]);

    // Un único efecto reemplaza los dos anteriores (fetchEmployees + fetchShifts)
    useEffect(() => {
        if (selectedEstId) {
            fetchCalendar(selectedEstId, selectedMonth, selectedYear);
        }
    }, [selectedEstId, selectedMonth, selectedYear, fetchCalendar]);

    // ─── Navegación ───────────────────────────────────────────────────────────────
    const nextMonth = useCallback(() => {
        if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(prev => prev + 1); }
        else setSelectedMonth(prev => prev + 1);
    }, [selectedMonth]);

    const prevMonth = useCallback(() => {
        if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(prev => prev - 1); }
        else setSelectedMonth(prev => prev - 1);
    }, [selectedMonth]);

    // ─── Días del mes ─────────────────────────────────────────────────────────────
    const monthDays = useMemo(() => {
        const date = new Date(selectedYear, selectedMonth - 1, 1);
        const days = [];
        const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        while (date.getMonth() === selectedMonth - 1) {
            days.push({ dayNumber: date.getDate(), dayName: dayNames[date.getDay()], fullDate: new Date(date) });
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [selectedMonth, selectedYear]);

    // ─── Filtrado y agrupación ────────────────────────────────────────────────────
    const { filteredGroups, groupedEmployees, totalFiltered, filteredEmployees, filteredBySearch } = useMemo(() => {
        const bySearch = employees.filter(emp =>
            `${emp.fullName} ${emp.documentNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const filtered = bySearch.filter(emp => tipoPersonal === '' || emp.personnelType === tipoPersonal);
        const grouped = filtered.reduce((acc: { [key: string]: EmployeeTurno[] }, emp) => {
            let key = 'SIN ASIGNAR';
            if (groupBy === 'service') key = emp.service || 'SIN SERVICIO';
            else if (groupBy === 'profession') key = emp.professionGrupo || emp.profession || '---SIN PROFESIÓN---';
            else if (groupBy === 'condicionLaboral') key = emp.laborCondition || '--SIN CONDICIÓN--';
            if (!acc[key]) acc[key] = [];
            acc[key].push(emp);
            return acc;
        }, {});

        return {
            filteredGroups: Object.keys(grouped).sort((a, b) => {
                if (a.startsWith('---') && !b.startsWith('---')) return 1;
                if (!a.startsWith('---') && b.startsWith('---')) return -1;
                return a.localeCompare(b);
            }),
            groupedEmployees: grouped,
            totalFiltered: filtered.length,
            filteredEmployees: filtered,
            filteredBySearch: bySearch
        };
    }, [employees, searchTerm, groupBy, tipoPersonal]);

    // ─── Reglas de negocio ────────────────────────────────────────────────────────
    const selectedEstablishment = useMemo(
        () => establishments.find(e => e.codigoUnico === selectedEstId),
        [establishments, selectedEstId]
    );

    const canWorkSundays = useMemo(() => {
        const category = selectedEstablishment?.categoriaEstablecimiento?.trim();
        return category === 'I-3' || category === 'I-4';
    }, [selectedEstablishment]);

    const calculateTotalHours = useCallback((employeeId: number, employeeData?: EmployeeTurno) => {
        const employee = employeeData || employees.find(e => e.employee_id === employeeId);
        if (!employee) return 0;
        const savedHours = (employee.shifts || []).reduce((acc: number, shift) => {
            if (pendingChanges[`${employeeId}-${shift.day}`]) return acc;
            return acc + (Number(allowedShiftTypes.find(t => t.shift_type_id === shift.shift_type_id)?.totalHours) || 0);
        }, 0);
        const pendingHours = Object.values(pendingChanges)
            .filter(c => c.employeeId === employeeId && c.month === selectedMonth && c.year === selectedYear)
            .reduce((acc: number, c) => acc + (Number(allowedShiftTypes.find(t => t.shift_type_id === c.shiftTypeId)?.totalHours) || 0), 0);
        return savedHours + pendingHours;
    }, [employees, pendingChanges, allowedShiftTypes, selectedMonth, selectedYear]);

    // ─── Cambio de turno ─────────────────────────────────────────────────────────
    const updateEmployeeShift = useCallback((employeeId: number, day: number, shiftTypeId: string) => {
        const changeKey = `${employeeId}-${day}`;
        setPendingChanges(prev => {
            const next = { ...prev };
            if (shiftTypeId === '') {
                delete next[changeKey];
            } else {
                const yearMonth = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
                const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                next[changeKey] = { employeeId, codigoUnico: selectedEstId, shiftTypeId: parseInt(shiftTypeId), date: dateStr, year: selectedYear, month: selectedMonth, day, yearMonth } as any;
            }
            return next;
        });
        setEmployees(prev => prev.map(emp => {
            if (emp.employee_id !== employeeId) return emp;
            const newShifts = [...(emp.shifts || [])];
            const idx = newShifts.findIndex(s => s.day === day);
            if (shiftTypeId === '') {
                if (idx !== -1) newShifts.splice(idx, 1);
            } else {
                const typeId = parseInt(shiftTypeId);
                const st = allowedShiftTypes.find(t => t.shift_type_id === typeId);
                const entry = { day, shift_type_id: typeId, shiftType: st ? { name: st.name, abbreviation: st.abbreviation, color: st.color } : { name: '', abbreviation: '', color: '' } };
                if (idx !== -1) newShifts[idx] = entry; else newShifts.push(entry);
            }
            return { ...emp, shifts: newShifts };
        }));
    }, [allowedShiftTypes, selectedEstId, selectedMonth, selectedYear]);

    const handleShiftChange = useCallback((employeeId: number, day: number, shiftTypeId: string, emp: any) => {
        if (isSubmissionLocked) return;

        const dayInfo = monthDays.find(d => d.dayNumber === day);
        const isSunday = dayInfo?.dayName === 'D';
        const category = selectedEstablishment?.categoriaEstablecimiento?.trim() || '';
        const isNombrado = emp.condicionLaboral?.toUpperCase() === 'NOMBRADO';

        if (shiftTypeId !== '') {
            const targetDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const rotations = emp.rotations || [];
            const activeRotation = rotations
                .filter((r: any) => { const s = r.startDate.split('T')[0], e = r.endDate?.split('T')[0]; return targetDate >= s && (!e || targetDate <= e); })
                .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0] ?? null;

            const validEstId = activeRotation ? activeRotation.targetCodigoUnico : emp.codigoUnico;
            if (validEstId && validEstId !== selectedEstId) {
                const validEst = establishments.find(e => e.codigoUnico === validEstId);
                const name = validEst?.nombreEstablecimiento ?? 'otro establecimiento';
                showToast(activeRotation
                    ? `El empleado rotó al establecimiento "${name}" desde ${activeRotation.startDate.split('T')[0].split('-').reverse().join('/')}.`
                    : `El empleado pertenece al establecimiento "${name}".`, 'error', 5000);
                return;
            }

            const abbreviation = allowedShiftTypes.find(t => t.shift_type_id.toString() === shiftTypeId)?.abbreviation || '';

            if (isSunday && !canWorkSundays) { showToast('Los turnos en domingo no están permitidos para esta categoría.', 'error'); return; }

            const rule = SHIFT_CATEGORY_RULES[category];
            if (rule) {
                if (rule.requiresNombrado?.includes(abbreviation) && !isNombrado) { showToast(`El turno ${abbreviation} solo está permitido para personal NOMBRADO.`, 'error'); return; }
                if (!rule.allowedAbbreviations.includes(abbreviation) && !rule.requiresNombrado?.includes(abbreviation)) { showToast(`El turno ${abbreviation} no está permitido para la categoría ${category}.`, 'error'); return; }
            }

            if (day > 1) {
                const prevAbbr = emp.shifts?.find((s: any) => s.day === day - 1)?.shiftType?.abbreviation || '';
                const seqRule = SHIFT_SEQUENCE_RULES[prevAbbr];
                if (seqRule?.forbiddenNext.includes(abbreviation)) { showToast(seqRule.message, 'error', 5000); return; }
            }
        }

        const currentHours = calculateTotalHours(employeeId, emp);
        const newH = shiftTypeId !== '' ? Number(allowedShiftTypes.find(t => t.shift_type_id.toString() === shiftTypeId)?.totalHours) || 0 : 0;
        const oldH = Number(allowedShiftTypes.find(t => t.shift_type_id === emp.shifts?.find((s: any) => s.day === day)?.shift_type_id)?.totalHours) || 0;
        if (emp.personnelType === 'ASISTENCIAL' && currentHours - oldH + newH > 150) { showToast('El personal asistencial no puede exceder las 150 horas mensuales.', 'error', 5000); return; }

        updateEmployeeShift(employeeId, day, shiftTypeId);
    }, [isSubmissionLocked, monthDays, selectedEstablishment, canWorkSundays, allowedShiftTypes, calculateTotalHours, updateEmployeeShift, selectedYear, selectedMonth, selectedEstId, establishments, showToast]);

    const saveChanges = useCallback(async () => {
        const changes = Object.values(pendingChanges);
        if (changes.length === 0) return null;
        setSaving(true);
        try {
            const res = await turnosService.bulkCreateShifts(changes);
            if (res.success) setPendingChanges({});
            return res as { success: boolean; message?: string; error?: string };
        } catch (err: any) {
            return { success: false, error: err.message || 'Error al guardar los cambios', message: undefined };
        } finally {
            setSaving(false);
        }
    }, [pendingChanges]);

    const handleSave = useCallback(async () => {
        const res = await saveChanges();
        if (res) {
            let msg = res.success ? (res.message || 'Cambios guardados correctamente') : (res.error || 'Error al guardar los cambios');
            if (!res.success && msg.includes('|')) msg = msg.split('|')[0].trim();
            showToast(msg, res.success ? 'success' : 'error', res.success ? 3000 : 6000);
        }
    }, [saveChanges, showToast]);

    // ─── Acciones de submission ───────────────────────────────────────────────────
    const handleSubmitMonth = useCallback(async () => {
        if (!selectedEstId || !user) return;
        const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        try {
            const res = await turnosService.submitMonth(selectedEstId, yearMonth, (user as any).userId, professionGroup);
            if (res.success) { setSubmission(res.data); showToast('Turnos enviados a RRHH exitosamente', 'success'); }
        } catch (err: any) {
            // err.response?.data?.message contiene el mensaje del backend (400/500)
            // err.message es el mensaje genérico de axios ("Request failed with status code 400")
            const msg = err.response?.data?.message || err.message || 'Error al enviar los turnos';
            showToast(msg, 'error');
        }
    }, [selectedEstId, selectedMonth, selectedYear, user, professionId, showToast]);

    /** Aprueba todo el paquete (establecimiento + mes) de una sola vez */
    const handleApprovePackage = useCallback(async (codigoUnico: string, yearMonth: string) => {
        if (!user) return;
        try {
            const res = await turnosService.approvePackage(codigoUnico, yearMonth, (user as any).userId);
            if (res.success) {
                showToast(res.message || 'Paquete aprobado exitosamente', 'success');
                fetchSubmissions(); // Recargar bandeja para reflejar el nuevo estado
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Error al aprobar el paquete';
            showToast(msg, 'error');
        }
    }, [user, showToast, fetchSubmissions]);

    /** Rechaza todo el paquete (establecimiento + mes) de una sola vez */
    const handleRejectPackage = useCallback(async (codigoUnico: string, yearMonth: string, message: string) => {
        if (!user) return;
        try {
            const res = await turnosService.rejectPackage(codigoUnico, yearMonth, (user as any).userId, message);
            if (res.success) {
                setRejectModal({ isOpen: false, codigoUnico: '', yearMonth: '', message: 'TURNOS MAL CREADOS, CORREGIR' });
                showToast('Paquete rechazado. El establecimiento será notificado.', 'success');
                fetchSubmissions();
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Error al rechazar el paquete';
            showToast(msg, 'error');
        }
    }, [user, showToast, fetchSubmissions]);

    /** Navega al calendario del paquete seleccionado desde la bandeja */
    const loadSubmissionCalendar = useCallback((pkg: SubmissionPackage) => {
        const [year, month] = pkg.yearMonth.split('-').map(Number);
        setSelectedEstId(pkg.codigoUnico);
        setSelectedYear(year);
        setSelectedMonth(month);
    }, []);

    return {
        establishments, selectedEstId, setSelectedEstId, loadingEsts,
        searchTerm, setSearchTerm, groupBy, setGroupBy, tipoPersonal, setTipoPersonal,
        selectedMonth, setSelectedMonth, selectedYear, setSelectedYear,
        employees, filteredEmployees, filteredGroups, groupedEmployees, totalFiltered, filteredBySearch,
        allowedShiftTypes, loading, error, monthDays, months,
        pendingChanges, saving,
        showExportModal, setShowExportModal, showColorModal, setShowColorModal,
        canWorkSundays, isRedLevel, userCodigoUnico,
        isProfessionHead, professionId, professionGroup, isApprover, approverStatuses,
        submission, submissionLoading, isSubmissionLocked,
        shiftVisibility,
        submissions, submissionsLoading, fetchSubmissions, asistencialGroups,
        rejectModal, setRejectModal,
        nextMonth, prevMonth,
        handleShiftChange, handleSave, calculateTotalHours,
        handleSubmitMonth, handleApprovePackage, handleRejectPackage, loadSubmissionCalendar,
        handleHierarchyChange: (selection: any) => {
            // El ID principal para cargar datos es codigoUnico o el indicador de sede
            let finalId = '';
            if (selection.codigoUnico) finalId = selection.codigoUnico;
            else if (selection.codigoMicrored === 'SOLO RED') finalId = 'SOLO RED'; // Compatibilidad con backend si aplica
            
            setSelectedEstId(finalId);
        },
        refreshAllowedShiftTypes: () => fetchCalendar(selectedEstId, selectedMonth, selectedYear)
    };
}
