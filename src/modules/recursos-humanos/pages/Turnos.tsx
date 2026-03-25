import React, { memo, useCallback, useState, useMemo, lazy, Suspense } from 'react';
import {
    Search, Building2, User, AlertCircle, AlertTriangle, ChevronLeft, ChevronRight,
    Save, FileSpreadsheet, Palette, ArrowRightLeft, Clock,
    Send, CheckCircle, XCircle, Eye, Inbox, RotateCcw, Lock
} from 'lucide-react';
import { useTurnos } from '../hooks/useTurnos';
import { InputText, Select } from '../components/FormComponents';
const ExportTurno = lazy(() => import('../components/ExportTurno'));
import ColorEdit from '../components/ColorEdit';
import type { EmployeeTurno, ShiftType, ShiftSubmission, SubmissionPackage } from '../types';
import PageHeader from '../../../core/components/PageHeader';
import RedLevelAccess from '../../../core/components/RedLevelAccess';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import { useSubmodulePermissions } from '../../../core/hooks/useSubmodulePermissions';
import './Turnos.css';

// ─── Employee Card ────────────────────────────────────────────────────────────

interface EmployeeCardProps {
    emp: EmployeeTurno;
    position: { top: number; left: number };
    onClose: () => void;
    selectedEstId: string;
}

function EstRow({ label, est, code }: { label: string; est?: { codigoUnico: string; nombre: string; categoria: string } | null; code?: string }) {
    return (
        <div className="emp-card-rotation-est-block">
            <p className="emp-card-rotation-est-label">{label}</p>
            <p className="emp-card-rotation-est-code">{est?.codigoUnico ?? code ?? '—'}</p>
            <p className="emp-card-rotation-est-name">{est?.nombre ?? '—'} <span className="emp-card-rotation-est-cat">{est?.categoria ?? '—'}</span></p>
        </div>
    );
}

function EmployeeCard({ emp, position, onClose, selectedEstId }: EmployeeCardProps) {

    const fmtDate = (d?: string) => {
        if (!d) return null;
        const [y, m, day] = d.split('T')[0].split('-');
        return `${day}/${m}/${y}`;
    };

    const rot = emp.rotations?.[0];
    const isRotatedHere = rot && rot.targetCodigoUnico === selectedEstId;

    return (
        <>
            <div className="emp-card-overlay" onClick={onClose} />
            <div className={`emp-card${rot ? ' emp-card--wide' : ''}`}
                style={{ top: position.top, left: position.left }}
                onClick={e => e.stopPropagation()}>
                {/* Cabecera centrada */}
                <div className="emp-card-header">
                    <div className="emp-card-name">{emp.fullName}</div>
                    <div className="emp-card-dni">DNI: {emp.documentNumber}</div>
                </div>
                <hr className="emp-card-divider" />
                <div className={`emp-card-body${rot ? ' emp-card-body--two-col' : ''}`}>
                    {/* Info laboral */}
                    <div className="emp-card-col">
                        <div className="emp-card-col-title">Info Laboral</div>
                        <InfoRow label="Profesión" value={emp.profession || '—'} highlight />
                        <InfoRow label="Grupo" value={emp.professionGrupo || '—'} />
                        <InfoRow label="Cond. Laboral" value={emp.laborCondition || '—'} />
                        <InfoRow label="Servicio" value={emp.service || '—'} />
                    </div>
                    {/* Rotación (solo si existe) */}
                    {rot && (
                        <div className="emp-card-col">
                            <div className="emp-card-col-title emp-card-col-title--rotation">
                                <ArrowRightLeft size={11} />
                                <span>{isRotatedHere ? 'Rotado desde' : 'Rotado hacia'}</span>
                            </div>
                            <EstRow label="Origen" est={emp.originEstablishment} code={emp.codigoUnico} />
                            <EstRow label="Destino" est={rot.targetEstablishment} code={rot.targetCodigoUnico} />
                            <div className="emp-card-rotation-dates">
                                <InfoRow label="Inicio" value={fmtDate(rot.startDate) ?? '—'} />
                                {rot.endDate
                                    ? <InfoRow label="Fin" value={fmtDate(rot.endDate) ?? '—'} />
                                    : <div className="emp-card-rotation-active">Activo</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="emp-card-row">
            <span className="emp-card-row-label">{label}</span>
            <span className={`emp-card-row-value${highlight ? ' highlight' : ''}`}>{value}</span>
        </div>
    );
}

// ─── Employee Row ─────────────────────────────────────────────────────────────

interface EmployeeRowProps {
    emp: EmployeeTurno;
    idx: number;
    monthDays: { dayNumber: number; dayName: string }[];
    allowedShiftTypes: ShiftType[];
    shiftTypeOptions: React.ReactNode[];
    selectedEstId: string;
    selectedMonth: number;
    selectedYear: number;
    establishments: { codigoUnico: string; nombreEstablecimiento: string }[];
    canWorkSundays: boolean;
    totalHours: number;
    isReadOnly: boolean;
    handleShiftChange: (employeeId: number, day: number, shiftTypeId: string, emp: EmployeeTurno) => void;
    onNameClick: (emp: EmployeeTurno, rect: DOMRect) => void;
}

const EmployeeRow = memo(function EmployeeRow({
    emp, idx, monthDays, allowedShiftTypes, shiftTypeOptions, selectedEstId,
    selectedMonth, selectedYear, establishments, canWorkSundays, totalHours,
    isReadOnly, handleShiftChange, onNameClick,
}: EmployeeRowProps) {
    return (
        <tr key={emp.employee_id} className="employee-row">
            <td className="col-num">{idx + 1}</td>
            <td className="col-name" style={{ cursor: 'pointer' }}
                onClick={e => onNameClick(emp, (e.currentTarget as HTMLElement).getBoundingClientRect())}>
                <div className="flex items-center gap-1">
                    <span>{emp.fullName}</span>
                    {emp.isProfessionHead && (
                        // Círculo celeste que indica que este empleado es jefe de su profesión
                        <span title="Jefe de profesión"
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white shrink-0 ml-1"
                            style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1 }}>
                            JP
                        </span>
                    )}
                    {emp.isServiceHead && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 leading-none whitespace-nowrap ml-1">
                            Jefe Serv.
                        </span>
                    )}
                    {emp.rotations && emp.rotations.length > 0 && (
                        <div className="group relative inline-flex items-center ml-1">
                            <ArrowRightLeft size={14} className="text-orange-500 cursor-help" />
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-max whitespace-nowrap px-2.5 py-2 bg-gray-800 text-white text-[11px] font-normal normal-case rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                {(() => {
                                    const rot = emp.rotations![0];
                                    if (!rot) return "Rotación activa";
                                    const startParts = rot.startDate ? rot.startDate.split('T')[0].split('-') : [];
                                    const dateStr = startParts.length === 3 ? `${startParts[2]}/${startParts[1]}/${startParts[0]}` : '';
                                    if (rot.targetCodigoUnico === selectedEstId) {
                                        const originEst = establishments.find(e => e.codigoUnico === emp.codigoUnico);
                                        return `Personal rotado DESDE ${originEst?.nombreEstablecimiento ?? "otro establecimiento"} (Inicio: ${dateStr})`;
                                    } else {
                                        const targetEst = establishments.find(e => e.codigoUnico === rot.targetCodigoUnico);
                                        return `Personal rotado HACIA ${targetEst?.nombreEstablecimiento ?? "otro establecimiento"} (Inicio: ${dateStr})`;
                                    }
                                })()}
                                <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                            </div>
                        </div>
                    )}
                </div>
            </td>
            {(() => {
                const cells: React.ReactNode[] = [];
                let i = 0;
                while (i < monthDays.length) {
                    const day = monthDays[i];
                    const dayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day.dayNumber).padStart(2, '0')}`;

                    const activeLicencia = emp.licencias?.find(l => dayStr >= l.startDate && dayStr <= l.endDate);
                    if (activeLicencia) {
                        let colSpan = 0;
                        for (let j = i; j < monthDays.length; j++) {
                            const nd = monthDays[j];
                            const ndStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(nd.dayNumber).padStart(2, '0')}`;
                            if (ndStr >= activeLicencia.startDate && ndStr <= activeLicencia.endDate) colSpan++;
                            else break;
                        }
                        cells.push(
                            <td key={`lic-${day.dayNumber}`} colSpan={colSpan} className="col-day has-licencia">
                                <span className="licencia-cell" title={`${activeLicencia.tipo?.name}: ${activeLicencia.reason || 'Sin motivo'}`}>
                                    {activeLicencia.tipo?.name.toUpperCase()}
                                </span>
                            </td>
                        );
                        i += colSpan;
                        continue;
                    }

                    const dayShift = emp.shifts?.find(s => s.day === day.dayNumber);
                    const currentShiftTypeId = dayShift?.shift_type_id?.toString() || '';
                    const currentShiftType = allowedShiftTypes.find(t => t.shift_type_id.toString() === currentShiftTypeId);
                    const isSunday = day.dayName === 'D';
                    const hideSelect = isSunday && !canWorkSundays;

                    cells.push(
                        <td key={`day-${day.dayNumber}`} className={`col-day ${isSunday ? 'is-sunday' : ''}`}>
                            {!hideSelect && (
                                <select
                                    className="shift-select-cell"
                                    value={currentShiftTypeId}
                                    disabled={isReadOnly}
                                    onChange={e => handleShiftChange(emp.employee_id!, day.dayNumber, e.target.value, emp)}
                                    style={{ backgroundColor: currentShiftType?.color || 'transparent', color: currentShiftType ? 'black' : 'inherit' }}
                                    title={currentShiftType?.name || 'Sin turno'}
                                >
                                    {shiftTypeOptions}
                                </select>
                            )}
                        </td>
                    );
                    i++;
                }
                return cells;
            })()}
            <td className={`col-hrs ${emp.personnelType === 'ASISTENCIAL' && totalHours > 150 ? 'exceeded' : ''}`}>
                {totalHours}
            </td>
        </tr>
    );
});

// ─── Submission Status Banner ─────────────────────────────────────────────────

function SubmissionBanner({ submission, onSubmit, onApprove, onReject, canSend, canApprove, isProfessionHead, isApprover, approverStatuses, submissionLoading, isOwnEstablishment }: {
    submission: ShiftSubmission | null;
    onSubmit: () => void;
    onApprove: () => void;
    onReject: () => void;
    canSend: boolean;
    canApprove: boolean;
    isProfessionHead: boolean;
    isApprover: boolean;
    /** Estados en los que este actor puede aprobar (puede tener múltiples roles) */
    approverStatuses: string[];
    submissionLoading: boolean;
    isOwnEstablishment?: boolean;
}) {
    if (submissionLoading) return null;

    const status = submission?.status ?? 'BORRADOR';

    // Si está en borrador y no es el programador de este establecimiento, no mostrar banner
    if (status === 'BORRADOR' && !isOwnEstablishment && !isProfessionHead) return null;

    const configs: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
        BORRADOR:      { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700',   icon: <Clock size={16} />,       label: 'Turnos en borrador — completa el mes y envía' },
        ENVIADO:       { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: <Send size={16} />,        label: 'Enviado — pendiente de aprobación por RRHH de Establecimiento' },
        APR_RRHH_EST:  { bg: 'bg-sky-50 border-sky-200',     text: 'text-sky-700',    icon: <CheckCircle size={16} />, label: 'Aprobado por RRHH de Establecimiento — pendiente por Jefe de Establecimiento' },
        APR_JEFE_EST:  { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', icon: <CheckCircle size={16} />, label: 'Aprobado por Jefe de Establecimiento — pendiente por Jefe de Microred' },
        APR_JEFE_MR:   { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700', icon: <CheckCircle size={16} />, label: 'Aprobado por Jefe de Microred — pendiente de aprobación final por RRHH de Red' },
        APROBADO:      { bg: 'bg-green-50 border-green-200', text: 'text-green-700',   icon: <CheckCircle size={16} />, label: 'Turnos aprobados' },
        RECHAZADO:     { bg: 'bg-red-50 border-red-200',     text: 'text-red-700',     icon: <XCircle size={16} />,     label: submission?.rejectionMessage ?? 'TURNOS MAL CREADOS, CORREGIR' },
    };

    const cfg = configs[status] ?? configs['BORRADOR'];
    // Verifica si el actor puede aprobar el estado actual (soporta múltiples roles)
    const canActorApprove = isApprover && canApprove && approverStatuses.includes(status);

    return (
        <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border ${cfg.bg}`}>
            <div className={`flex items-center gap-2 text-sm font-medium ${cfg.text}`}>
                {cfg.icon}
                <span>{cfg.label}</span>
            </div>
            <div className="flex items-center gap-2">
                {/* Jefe de Profesión: enviar / re-enviar */}
                {canSend && isProfessionHead && (status === 'BORRADOR' || status === 'RECHAZADO') && (
                    <button
                        onClick={onSubmit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                        {status === 'RECHAZADO' ? <RotateCcw size={13} /> : <Send size={13} />}
                        {status === 'RECHAZADO' ? 'Re-enviar' : 'Enviar'}
                    </button>
                )}
                {/* Nivel aprobador: aprobar / rechazar según estado requerido */}
                {canActorApprove && (
                    <>
                        <button
                            onClick={onApprove}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                        >
                            <CheckCircle size={13} />Aprobar
                        </button>
                        <button
                            onClick={onReject}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                        >
                            <XCircle size={13} />Rechazar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Submissions Tray (agrupada por paquete: establecimiento + mes) ───────────

const STATUS_STYLES: Record<string, string> = {
    BORRADOR:     'bg-blue-100 text-blue-700',
    ENVIADO:      'bg-yellow-100 text-yellow-700',
    APR_RRHH_EST: 'bg-sky-100 text-sky-700',
    APR_JEFE_EST: 'bg-indigo-100 text-indigo-700',
    APR_JEFE_MR:  'bg-violet-100 text-violet-700',
    APROBADO:     'bg-green-100 text-green-700',
    RECHAZADO:    'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
    BORRADOR: 'BORRADOR', ENVIADO: 'ENVIADO',
    APR_RRHH_EST: 'APR. RRHH EST.', APR_JEFE_EST: 'APR. JEFE EST.',
    APR_JEFE_MR: 'APR. JEFE MR', APROBADO: 'APROBADO', RECHAZADO: 'RECHAZADO',
};

function SubmissionsTray({ submissions, loading, onView, onApprove, onReject, canApprove, approverStatuses, asistencialGroups }: {
    submissions: SubmissionPackage[];
    loading: boolean;
    onView: (pkg: SubmissionPackage) => void;
    /** Callback de aprobación: recibe (codigoUnico, yearMonth) */
    onApprove: (codigoUnico: string, yearMonth: string) => void;
    onReject: (pkg: SubmissionPackage) => void;
    canApprove: boolean;
    /** Estados en los que este actor puede aprobar (soporta múltiples roles) */
    approverStatuses: string[];
    /** Grupos ASISTENCIALES esperados del establecimiento (para validar completitud antes de aprobar) */
    asistencialGroups: string[];
}) {
    /** true si este nivel corresponde a RRHH_EST (revisa submissions en estado ENVIADO) */
    const isRrhhEstLevel = approverStatuses.includes('ENVIADO');

    /**
     * Calcula qué grupos ASISTENCIALES faltan en el paquete.
     * Un grupo falta si no está en pkg.groups (no ha enviado aún).
     */
    const pendingAsistencialForPackage = useCallback((pkg: SubmissionPackage): string[] => {
        if (!isRrhhEstLevel || asistencialGroups.length === 0) return [];
        // groups puede llegar undefined si el backend no fue reiniciado; guardar con ??
        const sentGroups = (pkg.groups ?? []).map(g => g.professionGroup);
        return asistencialGroups.filter(g => !sentGroups.includes(g));
    }, [isRrhhEstLevel, asistencialGroups]);

    /** Todos los grupos ASISTENCIALES pendientes en todos los paquetes (para banner de aviso) */
    const allPendingGroups = useMemo(() => {
        if (!isRrhhEstLevel || asistencialGroups.length === 0) return [];
        const pending = new Set<string>();
        submissions.forEach(pkg => pendingAsistencialForPackage(pkg).forEach(g => pending.add(g)));
        return [...pending];
    }, [submissions, asistencialGroups, isRrhhEstLevel, pendingAsistencialForPackage]);

    return (
        <div className="table-container mt-0">
            {/* Banner de aviso cuando hay grupos ASISTENCIALES pendientes de envío */}
            {isRrhhEstLevel && allPendingGroups.length > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3 text-[13px] text-amber-800">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-500" />
                    <span>
                        <span className="font-semibold">Grupos ASISTENCIALES aún no enviaron: </span>
                        {allPendingGroups.join(', ')} — No podrá aprobar hasta que todos envíen su turno del mes.
                    </span>
                </div>
            )}

            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                {loading ? (
                    <div className="loading-state"><div className="spinner" /><p>Cargando bandeja...</p></div>
                ) : submissions.length === 0 ? (
                    <div className="empty-state"><Inbox className="icon opacity-20" /><p>No hay envíos pendientes de revisión.</p></div>
                ) : (
                    <table className="turnos-table" style={{ minWidth: 750 }}>
                        <thead>
                            <tr>
                                <th className="is-center">Establecimiento</th>
                                <th className="is-center">Mes</th>
                                <th className="is-center">Grupos enviados</th>
                                <th className="is-center">Estado</th>
                                <th className="is-center">Enviado el</th>
                                <th className="is-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map(pkg => {
                                /** Grupos ASISTENCIALES que aún faltan para este paquete */
                                const pending      = pendingAsistencialForPackage(pkg);
                                const pkgComplete  = pending.length === 0;
                                const canApproveThis = canApprove && approverStatuses.includes(pkg.status) && pkgComplete;
                                const canRejectThis  = approverStatuses.includes(pkg.status);
                                const pkgKey = `${pkg.codigoUnico}-${pkg.yearMonth}`;

                                return (
                                    <tr key={pkgKey} className="employee-row">
                                        {/* Establecimiento */}
                                        <td>
                                            <div className="font-medium text-sm leading-tight">
                                                <span>{pkg.establishment?.nombre_establecimiento || pkg.codigoUnico}</span>
                                                {pkg.establishment?.categoria_establecimiento && (
                                                    <span className="ml-1 text-gray-400 text-xs font-normal">
                                                        {pkg.establishment.categoria_establecimiento}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">{pkg.codigoUnico}</div>
                                        </td>

                                        {/* Mes */}
                                        <td className="text-center text-sm font-medium">{pkg.yearMonth}</td>

                                        {/* Grupos de profesión enviados */}
                                        <td>
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {(pkg.groups ?? []).map(g => (
                                                    <span
                                                        key={g.submissionId}
                                                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 whitespace-nowrap"
                                                    >
                                                        {g.professionGroup}
                                                    </span>
                                                ))}
                                                {/* Grupos ASISTENCIALES faltantes (solo para RRHH_EST) */}
                                                {isRrhhEstLevel && pending.map(g => (
                                                    <span
                                                        key={`missing-${g}`}
                                                        title="Pendiente de envío"
                                                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 whitespace-nowrap border border-dashed border-gray-300"
                                                    >
                                                        {g} ·
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Estado del paquete */}
                                        <td className="text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[pkg.status] ?? ''}`}>
                                                {STATUS_LABELS[pkg.status] ?? pkg.status}
                                            </span>
                                            {/* Mensaje de rechazo si aplica */}
                                            {pkg.status === 'RECHAZADO' && pkg.rejectionMessage && (
                                                <div className="text-[10px] text-red-500 mt-0.5 max-w-[120px] truncate" title={pkg.rejectionMessage}>
                                                    {pkg.rejectionMessage}
                                                </div>
                                            )}
                                        </td>

                                        {/* Fecha de envío más temprana */}
                                        <td className="text-center text-xs text-gray-500">
                                            {pkg.submittedAt ? new Date(pkg.submittedAt).toLocaleDateString('es-PE') : '—'}
                                        </td>

                                        {/* Acciones */}
                                        <td className="is-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* Ver calendario del establecimiento */}
                                                <button
                                                    title="Ver turnos del mes"
                                                    onClick={() => onView(pkg)}
                                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                </button>

                                                {/* Aprobar paquete completo */}
                                                {canApprove && approverStatuses.includes(pkg.status) && (
                                                    <button
                                                        title={canApproveThis
                                                            ? 'Aprobar todos los grupos del mes'
                                                            : `Falta envío de: ${pending.join(', ')}`}
                                                        onClick={() => canApproveThis && onApprove(pkg.codigoUnico, pkg.yearMonth)}
                                                        disabled={!canApproveThis}
                                                        className={`p-1.5 rounded-lg transition-colors ${
                                                            canApproveThis
                                                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                )}

                                                {/* Rechazar paquete completo */}
                                                {canRejectThis && (
                                                    <button
                                                        title="Rechazar todos los grupos del mes"
                                                        onClick={() => onReject(pkg)}
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({ isOpen, message, onChange, onConfirm, onClose }: {
    isOpen: boolean;
    message: string;
    onChange: (msg: string) => void;
    onConfirm: () => void;
    onClose: () => void;
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                <div className="flex items-center gap-2 mb-4">
                    <XCircle size={20} className="text-red-500" />
                    <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Rechazar Turnos del Mes</h2>
                </div>
                <p className="text-sm text-gray-500 mb-3">Ingresa el motivo del rechazo que será visible para el establecimiento.</p>
                <textarea
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-gray-700 dark:text-gray-100"
                    rows={3}
                    value={message}
                    onChange={e => onChange(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">Confirmar Rechazo</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Turnos() {
    const {
        establishments, selectedEstId,
        searchTerm, setSearchTerm, groupBy, setGroupBy, tipoPersonal, setTipoPersonal,
        selectedMonth, selectedYear,
        employees, filteredBySearch, loading, error, months, monthDays,
        allowedShiftTypes, pendingChanges, saving,
        filteredGroups, groupedEmployees, totalFiltered,
        nextMonth, prevMonth, handleShiftChange, handleSave, calculateTotalHours,
        showExportModal, setShowExportModal, showColorModal, setShowColorModal,
        canWorkSundays, userCodigoUnico,
        isProfessionHead, professionId, isApprover, approverStatuses,
        submission, submissionLoading, isSubmissionLocked,
        shiftVisibility,
        submissions, submissionsLoading, asistencialGroups,
        rejectModal, setRejectModal,
        handleSubmitMonth, handleApprovePackage, handleRejectPackage, loadSubmissionCalendar,
        refreshAllowedShiftTypes,
        handleHierarchyChange,
    } = useTurnos();

    const [empCard, setEmpCard] = useState<{ emp: EmployeeTurno; top: number; left: number } | null>(null);
    // Aprobadores ven la bandeja por defecto; programadores ven el calendario
    const [showBandeja, setShowBandeja] = useState<boolean>(isApprover);
    // State to persist submission view without mounting RedLevelAccess
    const [viewingBandejaEst, setViewingBandejaEst] = useState<{ nombre: string, categoria: string, codigoUnico: string } | null>(null);

    const breadcrumb = useAppBreadcrumb(['Turnos']);
    const { canUpdate, canExport, canApprove, canSend } = useSubmodulePermissions({
        submoduleName: 'Control de Turnos',
        applicationCode: 'RRHH',
    });

    // Solo el Jefe de Profesión puede editar celdas de turno
    // Aprobadores (RRHH est/red, Jefe est/mr): solo miran + aprueban/rechazan
    // Jefe de Profesión puede editar su propia profesión aunque también sea aprobador (jefe de est./microred).
    // isApprover solo bloquea a quienes son exclusivamente aprobadores, no a quienes además tienen rol de programación.
    const canEditEmployee = useCallback((emp: EmployeeTurno): boolean => {
        if (!canUpdate || isSubmissionLocked) return false;
        if (isProfessionHead && professionId !== null && emp.professionId === professionId) return true;
        return false;
    }, [canUpdate, isSubmissionLocked, isProfessionHead, professionId]);

    const handleNameClick = useCallback((emp: EmployeeTurno, rect: DOMRect) => {
        const cardWidth = 280, cardHeight = 220, margin = 8;
        let left = rect.right + margin;
        let top = rect.top;
        if (left + cardWidth > window.innerWidth - margin) left = rect.left - cardWidth - margin;
        if (top + cardHeight > window.innerHeight - margin) top = window.innerHeight - cardHeight - margin;
        setEmpCard(prev => prev?.emp.employee_id === emp.employee_id ? null : { emp, top, left });
    }, []);


    const shiftTypeOptions = React.useMemo(() => [
        <option key="empty" value="" style={{ backgroundColor: 'white', color: 'black' }}></option>,
        ...allowedShiftTypes.map(type => (
            <option key={type.shift_type_id} value={type.shift_type_id.toString()} style={{ backgroundColor: 'white', color: 'black' }}>
                {type.abbreviation}
            </option>
        ))
    ], [allowedShiftTypes]);

    return (
        <div className="turnos-container">
            {empCard && <EmployeeCard emp={empCard.emp} position={{ top: empCard.top, left: empCard.left }} onClose={() => setEmpCard(null)} selectedEstId={selectedEstId} />}

            {/* Modal de rechazo de paquete */}
            <RejectModal
                isOpen={rejectModal.isOpen}
                message={rejectModal.message}
                onChange={msg => setRejectModal(prev => ({ ...prev, message: msg }))}
                onConfirm={() => handleRejectPackage(rejectModal.codigoUnico, rejectModal.yearMonth, rejectModal.message)}
                onClose={() => setRejectModal({ isOpen: false, codigoUnico: '', yearMonth: '', message: 'TURNOS MAL CREADOS, CORREGIR' })}
            />

            {/* Header */}
            <PageHeader
                title="Gestión de Turnos"
                description={isApprover && showBandeja ? 'Bandeja de envíos pendientes de aprobación' : 'Selecciona un establecimiento para gestionar los turnos del personal'}
                icon={Clock}
                color="#8B5CF6"
                breadcrumb={breadcrumb}
                badge={selectedEstId && !showBandeja && employees.length > 0
                    ? [{ label: `${totalFiltered} empleados` }]
                    : undefined}
            />

            {/* Toggle bandeja/calendario para niveles aprobadores */}
            {isApprover && (
                <div className="flex gap-2 mb-1">
                    <button
                        onClick={() => setShowBandeja(true)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${showBandeja ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <Inbox size={15} />Bandeja de Envíos
                    </button>
                    <button
                        onClick={() => setShowBandeja(false)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${!showBandeja ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <Clock size={15} />Ver Calendario
                    </button>
                </div>
            )}

            {/* Bandeja de aprobación (todos los niveles aprobadores) */}
            {isApprover && showBandeja ? (
                <SubmissionsTray
                    submissions={submissions}
                    loading={submissionsLoading}
                    canApprove={canApprove}
                    approverStatuses={approverStatuses}
                    asistencialGroups={asistencialGroups}
                    onView={pkg => {
                        loadSubmissionCalendar(pkg);
                        setViewingBandejaEst({
                            nombre: pkg.establishment?.nombre_establecimiento || pkg.codigoUnico,
                            categoria: pkg.establishment?.categoria_establecimiento || '',
                            codigoUnico: pkg.codigoUnico,
                        });
                        setShowBandeja(false);
                    }}
                    onApprove={(codigoUnico, yearMonth) => handleApprovePackage(codigoUnico, yearMonth)}
                    onReject={pkg => setRejectModal({
                        isOpen: true,
                        codigoUnico: pkg.codigoUnico,
                        yearMonth: pkg.yearMonth,
                        message: pkg.rejectionMessage ?? 'TURNOS MAL CREADOS, CORREGIR',
                    })}
                />
            ) : (
                <>
                    {/* Filtros */}
                    <div className="filters-card flex flex-col gap-3">
                        {/* Filtros de acceso (Red/Microred/Establecimiento) */}
                        {viewingBandejaEst ? (
                            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                        <Building2 size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 m-0 leading-tight">{viewingBandejaEst.nombre} - {viewingBandejaEst.codigoUnico} </p>
                                        <p className="text-[11px] text-gray-500 m-0 uppercase tracking-wide">{viewingBandejaEst.categoria || 'Establecimiento'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setViewingBandejaEst(null); setShowBandeja(true); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    <ChevronLeft size={14} />Volver a la Bandeja
                                </button>
                            </div>
                        ) : (
                            <RedLevelAccess
                                onChange={handleHierarchyChange}
                                labels={{ red: 'Red de Salud', microred: 'Microred', establecimiento: 'Establecimiento' }}
                            />
                        )}

                        {/* Otros filtros */}
                        <div className="filters-grid">
                            <div className="filter-item">
                                <Select label="Tipo Personal" name="tipoPersonal" value={tipoPersonal} onChange={e => setTipoPersonal(e.target.value)} options={[{ value: '', label: 'TODOS' }, { value: 'ASISTENCIAL', label: 'ASISTENCIAL' }, { value: 'ADMINISTRATIVO', label: 'ADMINISTRATIVO' }]} variant="custom" />
                            </div>
                            <div className="filter-item">
                                <Select label="Agrupado Por" name="groupBy" value={groupBy} onChange={e => setGroupBy(e.target.value as any)} options={[{ value: 'service', label: 'Servicio' }, { value: 'profession', label: 'Profesión' }, { value: 'condicionLaboral', label: 'Condición Laboral' }]} variant="custom" />
                            </div>
                            <div className="filter-item">
                                <InputText label="Buscar Personal" name="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} Icon={Search} placeholder="Nombre o DNI..." />
                            </div>
                        </div>
                    </div>

                    {/* Banner de estado del envío mensual */}
                    {selectedEstId && (
                        <SubmissionBanner
                            submission={submission}
                            submissionLoading={submissionLoading}
                            canSend={canSend}
                            canApprove={canApprove}
                            isProfessionHead={isProfessionHead}
                            isApprover={isApprover}
                            approverStatuses={approverStatuses}
                            isOwnEstablishment={userCodigoUnico === selectedEstId}
                            onSubmit={handleSubmitMonth}
                            onApprove={() => submission && handleApprovePackage(submission.codigoUnico, submission.yearMonth)}
                            onReject={() => submission && setRejectModal({ isOpen: true, codigoUnico: submission.codigoUnico, yearMonth: submission.yearMonth, message: submission.rejectionMessage ?? 'TURNOS MAL CREADOS, CORREGIR' })}
                        />
                    )}

                    {/* Barra de resumen y acciones */}
                    {selectedEstId && (
                        <div className="summary-nav">
                            <div className="info-text">
                                <span className="grouped">AGRUPADO POR {groupBy === 'service' ? 'SERVICIO' : groupBy === 'profession' ? 'PROFESIÓN' : 'CONDICIÓN'}</span>
                                <span className="separator">|</span>
                                <span className="count">{totalFiltered} DE {employees.length}</span>
                                <span className="separator">|</span>
                                <span className="date">{months.find(m => m.id === selectedMonth)?.name} DE {selectedYear}</span>
                            </div>
                            <div className="btns_action">
                                <button onClick={() => setShowColorModal(true)}><Palette size={14} />Colores</button>
                                {canExport && <button className="export-btn" onClick={() => setShowExportModal(true)}><FileSpreadsheet size={14} />Exportar</button>}
                                <span className="separator">|</span>
                                <button onClick={prevMonth}><ChevronLeft className="icon" />Mes Anterior</button>
                                <button onClick={nextMonth}>Mes Siguiente<ChevronRight className="icon" /></button>
                                <span className="separator">|</span>
                                {canUpdate && !isApprover && (
                                    <button
                                        className={`save-changes-btn ${Object.keys(pendingChanges).length === 0 || isSubmissionLocked ? 'is-disabled' : ''}`}
                                        onClick={handleSave}
                                        disabled={saving || Object.keys(pendingChanges).length === 0 || isSubmissionLocked}
                                    >
                                        {saving ? <div className="btn-spinner"></div> : <Save className="icon" />}
                                        {saving ? 'Guardando...' : `Guardar (${Object.keys(pendingChanges).length})`}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tabla de empleados */}
                    {!selectedEstId ? (
                        <div className="empty-state">
                            <Building2 className="icon" />
                            <p>Selecciona un establecimiento para ver turnos.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            {error && <div className="error-banner"><AlertCircle className="icon" /><p>{error}</p></div>}
                            {shiftVisibility && !shiftVisibility.allowed && (
                                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
                                    <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">Turnos no disponibles aún</p>
                                        <p className="text-xs text-amber-700">
                                            {({
                                                BORRADOR:     'El establecimiento aún no ha enviado los turnos.',
                                                ENVIADO:      'Los turnos están en revisión por RRHH del establecimiento.',
                                                APR_RRHH_EST: 'Los turnos están en revisión por el Jefe de Establecimiento.',
                                                APR_JEFE_EST: 'Los turnos están en revisión por el Jefe de Microred.',
                                                APR_JEFE_MR:  'Los turnos están en revisión por RRHH de Red.',
                                                RECHAZADO:    'Los turnos fueron rechazados y están siendo corregidos.',
                                            } as Record<string, string>)[shiftVisibility.status ?? 'BORRADOR']
                                            ?? 'Los turnos no están disponibles aún.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="table-wrapper">
                                {loading ? (
                                    <div className="loading-state"><div className="spinner"></div><p>Cargando personal...</p></div>
                                ) : employees.length === 0 ? (
                                    <div className="empty-state"><User className="icon opacity-20" /><p>No se encontraron empleados para este establecimiento.</p></div>
                                ) : (
                                    <table className="turnos-table">
                                        <thead>
                                            <tr>
                                                <th className="is-center">#</th>
                                                <th className="is-auto-nowrap">Apellidos y Nombres</th>
                                                {monthDays.map(day => (
                                                    <th key={day.dayNumber} className={`is-min-w-30 is-center ${day.dayName === 'D' ? 'is-sunday' : ''}`}>
                                                        {day.dayName}{day.dayNumber}
                                                    </th>
                                                ))}
                                                <th>Hrs</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredGroups.map(groupKey => {
                                                const groupEmployees = groupedEmployees[groupKey];
                                                if (!groupEmployees?.length) return null;
                                                return (
                                                    <React.Fragment key={groupKey}>
                                                        <tr className="group-header">
                                                            <td colSpan={monthDays.length + 3}>
                                                                {groupBy === 'service' ? 'SERVICIO' : groupBy === 'profession' ? 'PROFESIÓN' : 'CONDICIÓN'}: <span className="group-name">{groupKey}</span>
                                                            </td>
                                                        </tr>
                                                        {groupEmployees.map((emp, idx) => (
                                                            <EmployeeRow
                                                                key={emp.employee_id}
                                                                emp={emp} idx={idx}
                                                                monthDays={monthDays}
                                                                allowedShiftTypes={allowedShiftTypes}
                                                                shiftTypeOptions={shiftTypeOptions}
                                                                selectedEstId={selectedEstId}
                                                                selectedMonth={selectedMonth}
                                                                selectedYear={selectedYear}
                                                                establishments={establishments}
                                                                canWorkSundays={canWorkSundays}
                                                                totalHours={calculateTotalHours(emp.employee_id!, emp)}
                                                                isReadOnly={!canEditEmployee(emp)}
                                                                handleShiftChange={handleShiftChange}
                                                                onNameClick={handleNameClick}
                                                            />
                                                        ))}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {selectedEstId && allowedShiftTypes.length > 0 && !loading && (
                                <div className="legend-container">
                                    <h3 className="legend-title">Leyenda de Turnos</h3>
                                    <div className="legend-grid">
                                        {allowedShiftTypes.map(type => (
                                            <div key={type.shift_type_id} className="legend-item">
                                                <div className="legend-color-box" style={{ backgroundColor: type.color }}>{type.abbreviation}</div>
                                                <div className="legend-info">
                                                    <span className="legend-name">{type.name}</span>
                                                    <span className="legend-time">{type.startTime.substring(0, 5)} - {type.endTime.substring(0, 5)}({parseFloat(type.totalHours.toString())}h)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <Suspense fallback={null}>
                <ExportTurno
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    employees={filteredBySearch}
                    monthName={months.find(m => m.id === selectedMonth)?.name || ''}
                    year={selectedYear}
                    monthDays={monthDays}
                    allowedShiftTypes={allowedShiftTypes}
                    establishmentName={establishments.find(e => e.codigoUnico === selectedEstId)?.nombreEstablecimiento || 'Establecimiento'}
                />
            </Suspense>
            <ColorEdit
                isOpen={showColorModal}
                onClose={() => setShowColorModal(false)}
                shiftTypes={allowedShiftTypes}
                onUpdateSuccess={refreshAllowedShiftTypes}
            />
        </div>
    );
}
