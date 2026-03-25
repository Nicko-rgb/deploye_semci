import { useMemo } from 'react';
import {
    Network, Building2, MapPin, Users,
    User, AlertCircle, AlertTriangle, Loader2, ChevronRight, ChevronLeft, UserCheck,
} from 'lucide-react';
import PageHeader from '../../../core/components/PageHeader';
import { useOrganigrama } from '../hooks/useOrganigrama';
import { PanelDetalle } from '../components/organigrama/PanelDetalle';
import type {
    OrgRed, OrgMicrored, OrgEstablecimiento, OrgHead,
} from '../types/organigrama.types';

// ─── HeadBadge ────────────────────────────────────────────────────────────────

function HeadBadge({ head }: { head: OrgHead }) {
    return (
        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
            <User size={15} />
            <span className="text-[12px] font-medium truncate">{head.fullName}</span>
            {head.profession && <span className="text-[12px] text-blue-500 dark:text-blue-400">· {head.profession}</span>}
        </span>
    );
}

// ─── Cabecera de nivel (red/microred) con botón "Ver personal sede" ───────────

function LevelHeader({ type, nombre, head, totalEst, totalEmpleados, canGoBack, onBack, onSedeClick, sedeActive, breadcrumb, showSedeButton = true }: {
    type: 'red' | 'microred';
    nombre: string;
    head: OrgHead | null;
    totalEst: number;
    totalEmpleados: number;
    canGoBack: boolean;
    onBack: () => void;
    onSedeClick: () => void;
    sedeActive: boolean;
    breadcrumb?: { label: string; onClick?: () => void }[];
    /** Ocultar el botón de personal sede cuando el usuario no tiene acceso a ese nivel */
    showSedeButton?: boolean;
}) {
    const isRed = type === 'red';
    const bg = isRed ? 'bg-blue-600 dark:bg-blue-800' : 'bg-teal-600 dark:bg-teal-800';
    const Icon = isRed ? Network : MapPin;

    return (
        <div className={`${bg} px-4 py-2`}>
            {breadcrumb && breadcrumb.length > 0 && (
                <div className="flex items-center gap-1 mb-2 text-white/60 text-[11px]">
                    {breadcrumb.map((item, i) => (
                        <span key={i} className="flex items-center gap-1">
                            {i > 0 && <ChevronRight className="w-3 h-3" />}
                            {item.onClick
                                ? <button onClick={item.onClick} className="hover:text-white text-[12px] underline underline-offset-2">{item.label}</button>
                                : <span className="text-white font-medium text-[12px]">{item.label}</span>
                            }
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {canGoBack && (
                        <button onClick={onBack} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0">
                            <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                    )}
                    <Icon className="w-5 h-5 text-white shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-bold text-white uppercase">
                                {isRed ? 'Red' : 'Microred'}
                            </span>
                            <span className="text-white text-[10px]">·</span>
                            <p className="text-[13px] font-bold text-white uppercase tracking-wide truncate">{nombre}</p>
                        </div>
                        {head
                            ? (
                                <span className="text-[12px] font-medium text-white/80 flex items-center gap-1">
                                    <User size={17} />{head.fullName}
                                    {head.profession && ` · ${head.profession}`}
                                </span>
                            ) : (
                                <span className="text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                                    <AlertTriangle className="w-3 h-3" />
                                    Sin jefe de {isRed ? 'red' : 'microred'} asignado
                                </span>
                            )
                        }
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Botón ver personal de sede — oculto para usuarios sin acceso al nivel */}
                    {showSedeButton && (
                        <button
                            onClick={onSedeClick}
                            title="Ver personal de sede"
                            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full transition-colors
                                ${sedeActive
                                    ? 'bg-white text-blue-700 font-bold'
                                    : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                        >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Personal en {isRed ? 'Red' : 'Microred'}</span>
                        </button>
                    )}
                    <span className="text-[12px] bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold">
                        {totalEst} est.
                    </span>
                    <span className="text-[12px] bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />{totalEmpleados}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Filas clickables de redes ─────────────────────────────────────────────────────────

function RedRow({ red, onClick }: { red: OrgRed; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className="w-full text-left flex items-center justify-between gap-3 px-4 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/10 border-b border-gray-100 dark:border-gray-700/50 last:border-0 group transition-colors"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate uppercase">{red.nombre}</p>
                    {red.head
                        ? <HeadBadge head={red.head} />
                        : <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            <AlertTriangle className="w-3 h-3" />Sin jefe de red asignado
                        </span>
                    }
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                    {red.totalEstablecimientos} est.
                </span>
                <span className="text-[11px] bg-indigo-100 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                    <Users className="w-3 h-3" />{red.totalEmpleados}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
        </button>
    );
}

// ─── Filas clickables de microredes ─────────────────────────────────────────────────────────
function MicroredRow({ mr, onClick }: { mr: OrgMicrored; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className="w-full text-left flex items-center justify-between gap-3 px-4 py-1 hover:bg-teal-50 dark:hover:bg-teal-900/10 border-b border-gray-100 dark:border-gray-700/50 last:border-0 group transition-colors"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate uppercase">{mr.nombre}</p>
                    {mr.head
                        ? <HeadBadge head={mr.head} />
                        : <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            <AlertTriangle className="w-3 h-3" />Sin jefe de microred asignado
                        </span>
                    }
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] bg-teal-100 dark:bg-teal-800/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-semibold">
                    {mr.totalEstablecimientos} est.
                </span>
                <span className="text-[11px] bg-indigo-100 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                    <Users className="w-3 h-3" />{mr.totalEmpleados}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
            </div>
        </button>
    );
}

function EstRow({ est, isSelected, onClick }: {
    est: OrgEstablecimiento; isSelected: boolean; onClick: () => void;
}) {
    return (
        <button onClick={onClick}
            className={`w-full text-left flex items-center justify-between gap-3 px-4 py-1 border-b border-gray-100 dark:border-gray-700/50 last:border-0 group transition-colors
                ${isSelected ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
                    ${isSelected ? 'bg-green-200 dark:bg-green-800/50' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/20'}`}>
                    <Building2 className={`w-4 h-4 transition-colors ${isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-400 group-hover:text-green-500'}`} />
                </div>
                <div className="min-w-0">
                    <p className={`flex gap-1 items-center text-[13px] font-medium truncate ${isSelected ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {est.nombre} · {est.categoria}
                    </p>
                    <div className="flex items-center gap-0">
                        {est.head
                            ? <HeadBadge head={est.head} />
                            : <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                <AlertTriangle className="w-3 h-3" />Sin jefe asignado
                            </span>
                        }
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] bg-indigo-100 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                    <Users className="w-3 h-3" />{est.totalEmpleados}
                </span>
                <ChevronRight className={`w-4 h-4 transition-all ${isSelected ? 'rotate-90 text-green-500' : 'text-gray-300 group-hover:text-gray-500'}`} />
            </div>
        </button>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Organigrama() {
    const {
        tree, loading, error, totalEstablecimientos,
        currentView, currentItems, establecimientosSinMicrored,
        selectedRed, selectedMicrored,
        enterRed, enterMicrored, goBack, goToRed, goToRoot,
        detailKind, selectedEst, estDetalle, sedeDetalle, detailLoading,
        selectEst, selectSede, refreshDetail, clearDetail,
        accessFilters, isRedLevel, isMicroredLevel, isEstablishmentLevel, isDiresaLevel,
        pageBreadcrumb,
    } = useOrganigrama();

    const hasDetail = detailKind !== null;

    const pageDescription = useMemo(() => {
        if (isDiresaLevel) {
            const disaName = tree[0]?.disa;
            return disaName ? `Estructura jerárquica de la DIRESA ${disaName}` : 'Estructura jerárquica de la Red de Salud';
        }
        const myRed = tree.find(r => r.codigoRed === accessFilters.codigoRed) ?? tree[0];
        if (isRedLevel) {
            return myRed ? `Estructura jerárquica de la Red · ${myRed.nombre}` : 'Estructura jerárquica de la Red de Salud';
        }
        if (isMicroredLevel) {
            const myMr = myRed?.microredes.find(m => m.codigoMicrored === accessFilters.codigoMicrored);
            const nombre = myMr?.nombre ?? myRed?.nombre ?? '';
            return nombre ? `Estructura jerárquica de la Microred · ${nombre}` : 'Estructura jerárquica de la Red de Salud';
        }
        if (isEstablishmentLevel) {
            const myMr = myRed?.microredes.find(m => m.codigoMicrored === accessFilters.codigoMicrored);
            const myEst = myMr?.establecimientos.find(e => e.codigoUnico === accessFilters.codigoUnico)
                ?? myRed?.establecimientos.find(e => e.codigoUnico === accessFilters.codigoUnico);
            const nombre = myEst?.nombre ?? '';
            return nombre ? `Estructura jerárquica del Establecimiento · ${nombre}` : 'Estructura jerárquica de la Red de Salud';
        }
        return 'Estructura jerárquica de la Red de Salud';
    }, [tree, accessFilters, isDiresaLevel, isRedLevel, isMicroredLevel, isEstablishmentLevel]);

    // Breadcrumb del header de nivel — visible para todos, clickeable solo según acceso
    const navBreadcrumb = useMemo(() => {
        if (!selectedRed) return [];

        const items: { label: string; onClick?: () => void }[] = [];

        if (isDiresaLevel) {
            // DIRESA: puede volver a "Todas las Redes" y navegar entre redes
            items.push({ label: 'Todas las Redes', onClick: goToRoot });
            if (selectedMicrored) {
                items.push({ label: selectedRed.nombre, onClick: goToRed });
                items.push({ label: selectedMicrored.nombre });
            } else {
                items.push({ label: selectedRed.nombre });
            }
        } else if (isRedLevel) {
            // RED: puede volver a su red desde una microred, pero no más arriba
            if (selectedMicrored) {
                items.push({ label: selectedRed.nombre, onClick: goBack });
                items.push({ label: selectedMicrored.nombre });
            }
        } else if (isMicroredLevel && selectedMicrored) {
            // MICRORED: ve su contexto pero sin navegación hacia arriba
            items.push({ label: selectedRed.nombre });
            items.push({ label: selectedMicrored.nombre });
        } else if (isEstablishmentLevel && selectedMicrored) {
            // ESTABLECIMIENTO: ve su contexto completo, sin navegación
            items.push({ label: selectedRed.nombre });
            items.push({ label: selectedMicrored.nombre });
        }

        return items;
    }, [isDiresaLevel, isRedLevel, isMicroredLevel, isEstablishmentLevel, selectedRed, selectedMicrored, goToRoot, goToRed, goBack]);

    // Cabecera del nivel actual
    const levelHeader = useMemo(() => {
        if (selectedMicrored) {
            return (
                <LevelHeader
                    type="microred"
                    nombre={selectedMicrored.nombre}
                    head={selectedMicrored.head}
                    totalEst={selectedMicrored.totalEstablecimientos}
                    totalEmpleados={selectedMicrored.totalEmpleados}
                    canGoBack={!isMicroredLevel && !isEstablishmentLevel}
                    onBack={goBack}
                    onSedeClick={selectSede}
                    sedeActive={detailKind === 'sede'}
                    breadcrumb={navBreadcrumb}
                    showSedeButton={!isEstablishmentLevel}
                />
            );
        }
        if (selectedRed) {
            return (
                <LevelHeader
                    type="red"
                    nombre={selectedRed.nombre}
                    head={selectedRed.head}
                    totalEst={selectedRed.totalEstablecimientos}
                    totalEmpleados={selectedRed.totalEmpleados}
                    canGoBack={isDiresaLevel}
                    onBack={goBack}
                    onSedeClick={selectSede}
                    sedeActive={detailKind === 'sede'}
                    breadcrumb={navBreadcrumb}
                    showSedeButton={!isEstablishmentLevel && !isMicroredLevel}
                />
            );
        }
        return null;
    }, [selectedRed, selectedMicrored, isMicroredLevel, isDiresaLevel, isEstablishmentLevel, detailKind, navBreadcrumb, goBack, selectSede]);

    return (
        <div className="space-y-2 relative h-full">
            <PageHeader
                title="Organigrama Institucional"
                description={pageDescription}
                icon={Network}
                color="#0097A7"
                breadcrumb={pageBreadcrumb}
                badge={{ label: `${totalEstablecimientos} Establecimientos` }}
            />

            <div className="relative flex gap-3 items-start">
                {/* Panel árbol — ocupa siempre el ancho completo */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {levelHeader}

                    {loading && (
                        <div className="flex items-center justify-center h-48 gap-2 text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-sm">Cargando organigrama...</span>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex items-center gap-2 m-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />{error}
                        </div>
                    )}

                    {!loading && !error && tree.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                            <Network className="w-10 h-10 opacity-30" />
                            <p className="text-sm">No se encontraron datos.</p>
                        </div>
                    )}

                    {!loading && !error && tree.length > 0 && (
                        <div className="max-h-[calc(100vh-275px)] overflow-y-auto">
                            {currentView === 'redes' &&
                                (currentItems as OrgRed[]).map(red => (
                                    <RedRow key={red.codigoRed} red={red} onClick={() => enterRed(red)} />
                                ))
                            }

                            {currentView === 'microredes' && (
                                <>
                                    {(currentItems as OrgMicrored[]).map(mr => (
                                        <MicroredRow key={mr.codigoMicrored} mr={mr} onClick={() => enterMicrored(mr)} />
                                    ))}
                                    {establecimientosSinMicrored.length > 0 && (
                                        <>
                                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/30">
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Sin microred asignada</span>
                                            </div>
                                            {establecimientosSinMicrored.map(est => (
                                                <EstRow key={est.codigoUnico} est={est}
                                                    isSelected={selectedEst?.codigoUnico === est.codigoUnico}
                                                    onClick={() => selectEst(est)} />
                                            ))}
                                        </>
                                    )}
                                </>
                            )}

                            {currentView === 'establecimientos' &&
                                (currentItems as OrgEstablecimiento[]).map(est => (
                                    <EstRow key={est.codigoUnico} est={est}
                                        isSelected={selectedEst?.codigoUnico === est.codigoUnico}
                                        onClick={() => selectEst(est)} />
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>
            {/* Panel de detalle desktop — absoluto sobre la lista */}
            {hasDetail && (
                <PanelDetalle
                    kind={detailKind}
                    estDetalle={estDetalle}
                    sedeDetalle={sedeDetalle}
                    selectedEst={selectedEst}
                    selectedRed={selectedRed}
                    selectedMicrored={selectedMicrored}
                    loading={detailLoading}
                    onClose={clearDetail}
                    onRefresh={refreshDetail}
                />
            )}
        </div>
    );
}
