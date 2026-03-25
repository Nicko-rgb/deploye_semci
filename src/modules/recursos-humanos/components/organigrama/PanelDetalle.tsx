import { useState } from 'react';
import { User, AlertTriangle, Building2, UserCheck, Users, Loader2, X, GraduationCap, Plus, Eye } from 'lucide-react';
import { JefeProfesion, type JefeProfesionScope } from './JefeProfesion';
import { CrearOficina } from './CrearOficina';
import { VerEmpleados } from './VerEmpleados';
import type { OrgHead, OrgOficina, OrgEstablecimientoDetalle, OrgSedeDetalle, OrgEstablecimiento, OrgRed, OrgMicrored, OrgProfesionGroup } from '../../types/organigrama.types';

// ─── HeadBadge ────────────────────────────────────────────────────────────────

function HeadBadge({ head }: { head: OrgHead }) {
    return (
        <div className="inline-flex items-center  gap-1 text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
            <User size={15} />
            <span className="text-[11px] font-medium truncate">{head.fullName}</span>
            {head.profession && <span className="text-[12px] text-blue-500 dark:text-blue-400">· {head.profession}</span>}
        </div>
    );
}

// ─── HeadActionButton — Asignar / Cambiar jefe (stub) ─────────────────────────

/** Botón de acción para asignar o cambiar jefe. */
function HeadActionButton({ head, onClick }: { head: OrgHead | null; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`text-[11px] font-semibold px-2 py-[2px] rounded-full border transition-colors shrink-0
                ${head
                    ? 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500'
                    : 'border-green-400 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
        >
            {head ? 'Cambiar jefe' : 'Asignar jefe'}
        </button>
    );
}

// ─── TabBar ───────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }: {
    tabs: { key: string; label: string; badge?: number; badgeColor?: string }[];
    active: string;
    onChange: (key: string) => void;
}) {
    return (
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold border-b-[3px] transition-colors
                        ${active === tab.key
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    {tab.label}
                    {tab.badge !== undefined && tab.badge > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab.badgeColor ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            {tab.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

// ─── OficinaNode (árbol recursivo) ────────────────────────────────────────────

const levelColors: Record<string, string> = {
    DIRECCION: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    OFICINA: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    UNIDAD: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    AREA: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    COORDINACION: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    ESTRATEGIA: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
};

function OficinaNode({ oficina, onHeadClick, onVerEmpleados }: {
    oficina: OrgOficina;
    onHeadClick: (o: OrgOficina) => void;
    onVerEmpleados: (o: OrgOficina) => void;
}) {
    return (
        <div className="py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${levelColors[oficina.orgLevel] ?? 'bg-gray-100 text-gray-500'}`}>
                        {oficina.orgLevel}
                    </span>
                    <div className="min-w-0">
                        <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">{oficina.name}</span>
                        <span className="text-[10px] text-gray-400 ml-1.5">({oficina.code})</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Botón ver empleados de la oficina */}
                    {oficina.totalEmpleados > 0 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onVerEmpleados(oficina); }}
                            className="flex items-center gap-0.5 border rounded-full border-purple-500 text-[11px] px-2 py-[2px] font-semibold text-purple-500"
                            title="Ver empleados"
                        >
                            <Eye className="w-3 h-3" />{oficina.totalEmpleados} emp.
                        </button>
                    )}
                    {oficina.totalEmpleados === 0 && (
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">0 emp.</span>
                    )}
                    {/* Botón asignar / cambiar jefe de oficina */}
                    <HeadActionButton head={oficina.head} onClick={() => onHeadClick(oficina)} />
                </div>
            </div>
            {oficina.head && (
                <div className="mt-0.5 ml-1">
                    <HeadBadge head={oficina.head} />
                </div>
            )}
            {oficina.children.length > 0 && (
                <div className="ml-4 mt-1 border-l-2 border-gray-100 dark:border-gray-700 pl-3 space-y-0">
                    {oficina.children.map(child => (
                        <OficinaNode key={child.id} oficina={child} onHeadClick={onHeadClick} onVerEmpleados={onVerEmpleados} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── GroupRow — Profesión / Servicio ──────────────────────────────────────────

function GroupRow({ name, count, head, color, onAssignClick, onVerEmpleados, onToggle }: {
    name: string; count: number; head: OrgHead | null; color: string;
    onAssignClick: () => void;
    onVerEmpleados?: () => void;
    onToggle?: () => void;
}) {
    return (
        <div className="flex flex-col py-1.5 gap-1">
            <div className="flex items-center justify-between gap-2">
                {onToggle
                    ? <button type="button" onClick={onToggle} className="flex items-center gap-1 text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                        <GraduationCap className="w-4 h-4" />{name}
                      </button>
                    : <label className="flex items-center gap-1 text-[12px] font-medium text-gray-800 dark:text-gray-200">
                        <GraduationCap className="w-4 h-4" />{name}
                      </label>
                }
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <HeadActionButton head={head} onClick={onAssignClick} />
                    {/* Botón ver empleados del grupo — clicable si hay empleados */}
                    {onVerEmpleados && count > 0
                        ? <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onVerEmpleados(); }}
                            className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-[2px] rounded-full ${color} hover:opacity-80 transition-opacity`}
                            title="Ver empleados"
                          >
                            <Eye className="w-4 h-4" />{count} emp.
                          </button>
                        : <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
                            {count} emp.
                          </span>
                    }
                </div>
            </div>
            {head
                ? <HeadBadge head={head} />
                : <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 dark:text-amber-400 font-semibold">
                    <AlertTriangle className="w-3 h-3" />Sin jefe de profesión asignado
                </span>
            }
        </div>
    );
}

// ─── EstDetalle — contenido del panel para establecimiento ────────────────────

function EstDetalle({ detalle, onProfessionClick, onHeadClick, onOfficeClick, onAddOficina, onVerOficinaEmpleados, onVerGrupoEmpleados }: {
    detalle: OrgEstablecimientoDetalle | null;
    onProfessionClick: (g: { groupName: string; head: OrgHead | null }) => void;
    onHeadClick: () => void;
    onOfficeClick: (o: OrgOficina) => void;
    onAddOficina: () => void;
    /** Ver empleados asignados a una oficina */
    onVerOficinaEmpleados: (o: OrgOficina) => void;
    /** Ver empleados de un grupo de profesión */
    onVerGrupoEmpleados: (grupo: string) => void;
}) {
    const [tab, setTab] = useState<'oficinas' | 'profesiones' | 'servicios'>('oficinas');
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    if (!detalle) return null;

    const tabs = [
        { key: 'oficinas', label: 'Oficinas', badge: detalle.oficinas.length, badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
        { key: 'profesiones', label: 'Profesiones', badge: detalle.profesiones.length, badgeColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
        { key: 'servicios', label: 'Servicios', badge: detalle.servicios.length, badgeColor: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
    ];

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Jefe del establecimiento — fijo, no scrollea */}
            <div className="shrink-0 px-4 pt-1 pb-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Jefe del establecimiento</p>
                    {/* Botón asignar / cambiar jefe del establecimiento */}
                    <HeadActionButton head={detalle.head} onClick={onHeadClick} />
                </div>
                {detalle.head
                    ? <div><HeadBadge head={detalle.head} /></div>
                    : <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400 font-semibold mt-1">
                        <AlertTriangle className="w-4 h-4" />Sin jefe asignado
                    </span>
                }
            </div>

            {/* TabBar — fijo, no scrollea */}
            <div className="shrink-0 px-2">
                <TabBar tabs={tabs} active={tab} onChange={k => setTab(k as typeof tab)} />
            </div>

            {/* Contenido del tab — único área con scroll */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {tab === 'oficinas' && (
                    <div>
                        {/* Botón agregar oficina a empleado */}
                        <div className="flex justify-end mb-2">
                            <button
                                type="button"
                                onClick={onAddOficina}
                                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-purple-300 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                            >
                                <Plus className="w-3 h-3" />Agregar oficina
                            </button>
                        </div>
                        {detalle.oficinas.length > 0
                            ? <>
                                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                                    {detalle.oficinas.map(o => (
                                        <OficinaNode
                                            key={o.id}
                                            oficina={o}
                                            onHeadClick={onOfficeClick}
                                            onVerEmpleados={onVerOficinaEmpleados}
                                        />
                                    ))}
                                </div>
                                {detalle.sinOficina > 0 && (
                                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />{detalle.sinOficina} sin oficina asignada
                                    </p>
                                )}
                            </>
                            : <p className="text-[12px] text-gray-400 text-center py-6">Sin oficinas registradas.</p>
                        }
                    </div>
                )}

                {tab === 'profesiones' && (
                    <div>
                        {detalle.sinProfesion > 0 && (
                            <p className="text-[11px] text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1 font-semibold">
                                <AlertTriangle className="w-3 h-3" />{detalle.sinProfesion} empleados sin profesión registrada
                            </p>
                        )}
                        {detalle.profesiones.length > 0
                            ? <div className="divide-y divide-gray-300 dark:divide-gray-700">
                                {detalle.profesiones.map((g: OrgProfesionGroup) => (
                                    <div key={g.grupo}>
                                        <GroupRow
                                            name={g.grupo}
                                            count={g.count}
                                            head={g.head}
                                            onAssignClick={() => onProfessionClick({ groupName: g.grupo, head: g.head })}
                                            onVerEmpleados={() => onVerGrupoEmpleados(g.grupo)}
                                            onToggle={() => setExpandedGroup(prev => prev === g.grupo ? null : g.grupo)}
                                            color="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                                        />
                                        {expandedGroup === g.grupo && g.items.length > 0 && (
                                            <div className="ml-4">
                                                {g.items.map(item => (
                                                    <div key={item.professionId} className="flex items-center justify-between py-1.5">
                                                        <span className="text-[12px] text-gray-700 dark:text-gray-300">{item.name}</span>
                                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                            {item.count} emp.
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            : <p className="text-[12px] text-gray-400 text-center py-6">Sin profesiones registradas.</p>
                        }
                    </div>
                )}

                {tab === 'servicios' && (
                    <div>
                        {detalle.servicios.length > 0
                            ? <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {detalle.servicios.map(s => (
                                    <GroupRow key={s.serviceId} name={s.name} count={s.count} head={s.head}
                                        onAssignClick={() => { }}
                                        color="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300" />
                                ))}
                            </div>
                            : <p className="text-[12px] text-gray-400 text-center py-6">Sin servicios registrados.</p>
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── SedeDetalle — contenido del panel para sede red/microred ─────────────────

function SedeDetalle({ sede, head, onProfessionClick, onHeadClick, onOfficeClick, onAddOficina, onVerOficinaEmpleados, onVerGrupoEmpleados }: {
    sede: OrgSedeDetalle;
    head: OrgHead | null;
    onProfessionClick: (g: { groupName: string; head: OrgHead | null }) => void;
    onHeadClick: () => void;
    onOfficeClick: (o: OrgOficina) => void;
    onAddOficina: () => void;
    /** Ver empleados asignados a una oficina */
    onVerOficinaEmpleados: (o: OrgOficina) => void;
    /** Ver empleados de un grupo de profesión */
    onVerGrupoEmpleados: (grupo: string) => void;
}) {
    const [tab, setTab] = useState<'oficinas' | 'profesiones'>('oficinas');
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const tabs = [
        { key: 'oficinas', label: 'Oficinas', badge: sede.oficinas.length, badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
        { key: 'profesiones', label: 'Profesiones', badge: sede.profesiones.length, badgeColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
    ];

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Jefe de sede — fijo, no scrollea */}
            <div className="shrink-0 px-4 pt-1 pb-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase text-gray-400">
                        Jefe de {sede.codigoMicrored ? 'microred' : 'red'}
                    </p>
                    {/* Botón asignar / cambiar jefe de sede */}
                    <HeadActionButton head={head} onClick={onHeadClick} />
                </div>
                {head
                    ? <div className="mt-1"><HeadBadge head={head} /></div>
                    : <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 dark:text-amber-400 font-semibold mt-1">
                        <AlertTriangle className="w-3 h-3" />Sin jefe asignado
                    </span>
                }
            </div>

            {/* TabBar — fijo, no scrollea */}
            <div className="shrink-0 px-4 pt-2">
                <TabBar tabs={tabs} active={tab} onChange={k => setTab(k as typeof tab)} />
            </div>

            {/* Contenido del tab — único área con scroll */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {tab === 'oficinas' && (
                    <div>
                        {/* Botón agregar oficina a empleado */}
                        <div className="flex justify-end mb-2">
                            <button
                                type="button"
                                onClick={onAddOficina}
                                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-purple-300 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                            >
                                <Plus className="w-3 h-3" />Agregar oficina
                            </button>
                        </div>
                        {sede.oficinas.length > 0
                            ? <>
                                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                                    {sede.oficinas.map(o => (
                                        <OficinaNode
                                            key={o.id}
                                            oficina={o}
                                            onHeadClick={onOfficeClick}
                                            onVerEmpleados={onVerOficinaEmpleados}
                                        />
                                    ))}
                                </div>
                                {sede.sinOficina > 0 && (
                                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />{sede.sinOficina} sin oficina asignada
                                    </p>
                                )}
                            </>
                            : <p className="text-[12px] text-gray-400 text-center py-6">Sin oficinas registradas en sede.</p>
                        }
                    </div>
                )}

                {tab === 'profesiones' && (
                    <div>
                        {sede.sinProfesion > 0 && (
                            <p className="text-[11px] text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1 font-semibold">
                                <AlertTriangle className="w-3 h-3" />{sede.sinProfesion} empleados sin profesión registrada
                            </p>
                        )}
                        {sede.profesiones.length > 0
                            ? <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {sede.profesiones.map((g: OrgProfesionGroup) => (
                                    <div key={g.grupo}>
                                        <GroupRow
                                            name={g.grupo}
                                            count={g.count}
                                            head={g.head}
                                            onAssignClick={() => onProfessionClick({ groupName: g.grupo, head: g.head })}
                                            onVerEmpleados={() => onVerGrupoEmpleados(g.grupo)}
                                            onToggle={() => setExpandedGroup(prev => prev === g.grupo ? null : g.grupo)}
                                            color="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                                        />
                                        {expandedGroup === g.grupo && g.items.length > 0 && (
                                            <div className="ml-4">
                                                {g.items.map(item => (
                                                    <div key={item.professionId} className="flex items-center justify-between py-1.5">
                                                        <span className="text-[12px] text-gray-700 dark:text-gray-300">{item.name}</span>
                                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                            {item.count} emp.
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            : <p className="text-[12px] text-gray-400 text-center py-6">Sin profesiones registradas en sede.</p>
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── PanelDetalle — contenedor principal del panel derecho ────────────────────

export interface PanelDetalleProps {
    kind: 'establecimiento' | 'sede' | null;
    estDetalle: OrgEstablecimientoDetalle | null;
    sedeDetalle: OrgSedeDetalle | null;
    selectedEst: OrgEstablecimiento | null;
    selectedRed: OrgRed | null;
    selectedMicrored: OrgMicrored | null;
    loading: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

export function PanelDetalle({
    kind, estDetalle, sedeDetalle,
    selectedEst, selectedRed, selectedMicrored,
    loading, onClose, onRefresh,
}: PanelDetalleProps) {
    const isEst = kind === 'establecimiento';
    const isSede = kind === 'sede';

    // Estado del modal de asignar oficina a empleado
    const [crearOficinaScope, setCrearOficinaScope] = useState<JefeProfesionScope | null>(null);

    // Estado del modal de ver empleados (por oficina o por grupo de profesión)
    const [verEmpleadosModal, setVerEmpleadosModal] = useState<{
        title: string;
        oficinaDireccionId?: number;
        grupo?: string;
    } | null>(null);

    const [professionModal, setProfessionModal] = useState<
        | { mode: 'group'; groupName: string; currentHead: OrgHead | null; scope: JefeProfesionScope }
        | { mode?: 'profession'; professionId: number; professionName: string; currentHead: OrgHead | null; scope: JefeProfesionScope }
        | null
    >(null);

    const title = isEst
        ? `Establecimiento — ${selectedEst?.nombre ?? ''}`
        : isSede
            ? selectedMicrored
                ? `Sede Microred — ${selectedMicrored.nombre}`
                : `Sede Red — ${selectedRed?.nombre ?? ''}`
            : '';

    const headerColor = isEst
        ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800'
        : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800';

    const iconColor = isEst ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400';
    const TitleIcon = isEst ? Building2 : UserCheck;

    // Scope común del panel (usado tanto en profesión como en oficina)
    const panelScope: JefeProfesionScope = {
        codigoDisa:     selectedRed?.codigoDisa ?? undefined,
        codigoRed:      selectedRed?.codigoRed,
        codigoMicrored: selectedMicrored?.codigoMicrored,
        codigoUnico:    isEst ? selectedEst?.codigoUnico : undefined,
    };

    // Handlers para abrir el modal de jefe por grupo
    const handleProfessionClick = (g: { groupName: string; head: OrgHead | null }) => {
        setProfessionModal({
            mode: 'group',
            groupName: g.groupName,
            currentHead: g.head ?? null,
            scope: panelScope,
        });
    };

    return (
        <div className="h-full flex flex-col absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden max-w-[700px] w-full">
            <div className={`px-4 py-3 border-b flex items-center gap-2 justify-between ${headerColor}`}>
                <div className="flex items-center gap-1 min-w-0">
                    <TitleIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                    <p className={`text-[12px] font-bold uppercase leading-tight ${iconColor}`}>{title}
                        {isEst && selectedEst?.categoria && (
                            <span className="text-[12px] bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                {selectedEst.categoria}
                            </span>)}
                    </p>
                    {/* Badge total empleados */}
                    {isEst && estDetalle && (
                        <span className="text-[12px] bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold shrink-0 flex items-center gap-0.5 ml-2">
                            <Users size={14} />{estDetalle.totalEmpleados} emp.
                        </span>
                    )}
                    {isSede && sedeDetalle && (
                        <span className="text-[12px] bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold shrink-0 flex items-center gap-0.5">
                            <Users size={14} />{sedeDetalle.totalEmpleados} emp.
                        </span>
                    )}
                </div>
                <button onClick={onClose} className="text-[11px] text-red-600 p-2 bg-red-100 rounded dark:bg-red-900/20 hover:text-red-800 hover:bg-red-200 dark:hover:text-red-200">
                    <X className="w-4 h-4" strokeWidth={3} />
                </button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                {loading && (
                    <div className="flex items-center justify-center h-32 gap-2 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Cargando...</span>
                    </div>
                )}
                {!loading && isEst && selectedEst && (
                    <EstDetalle
                        detalle={estDetalle}
                        onProfessionClick={handleProfessionClick}
                        onHeadClick={() => { }} // TODO: Jefe establecimiento
                        onOfficeClick={() => { }} // TODO: Jefe oficina
                        onAddOficina={() => setCrearOficinaScope(panelScope)}
                        onVerOficinaEmpleados={(o) => setVerEmpleadosModal({ title: o.name, oficinaDireccionId: o.id })}
                        onVerGrupoEmpleados={(grupo) => setVerEmpleadosModal({ title: grupo, grupo })}
                    />
                )}
                {!loading && isSede && sedeDetalle && (
                    // El jefe de sede viene de selectedMicrored (sede microred) o selectedRed (sede red)
                    <SedeDetalle
                        sede={sedeDetalle}
                        // Si es sede de microred, usar el jefe de microred (sin fallback a red)
                        // Si es sede de red, usar el jefe de red
                        head={sedeDetalle.codigoMicrored
                            ? (selectedMicrored?.head ?? null)
                            : (selectedRed?.head ?? null)
                        }
                        onProfessionClick={handleProfessionClick}
                        onHeadClick={() => { }} // TODO: Jefe sede
                        onOfficeClick={() => { }} // TODO: Jefe oficina
                        onAddOficina={() => setCrearOficinaScope(panelScope)}
                        onVerOficinaEmpleados={(o) => setVerEmpleadosModal({ title: o.name, oficinaDireccionId: o.id })}
                        onVerGrupoEmpleados={(grupo) => setVerEmpleadosModal({ title: grupo, grupo })}
                    />
                )}
            </div>

            {/* Modal de ver empleados por oficina o grupo de profesión */}
            {verEmpleadosModal && (
                <VerEmpleados
                    title={verEmpleadosModal.title}
                    scope={panelScope}
                    oficinaDireccionId={verEmpleadosModal.oficinaDireccionId}
                    grupo={verEmpleadosModal.grupo}
                    onClose={() => setVerEmpleadosModal(null)}
                />
            )}

            {/* Modal de asignación de oficina a empleado */}
            {crearOficinaScope && (
                <CrearOficina
                    scope={crearOficinaScope}
                    onClose={() => setCrearOficinaScope(null)}
                    onSuccess={() => {
                        onRefresh();
                        setCrearOficinaScope(null);
                    }}
                />
            )}

            {/* Modal de asignación de jefe de profesión */}
            {professionModal && (
                <JefeProfesion
                    {...(professionModal as any)}
                    onClose={() => setProfessionModal(null)}
                    onSuccess={() => {
                        onRefresh();
                        setProfessionModal(null);
                    }}
                />
            )}
        </div>
    );
}
