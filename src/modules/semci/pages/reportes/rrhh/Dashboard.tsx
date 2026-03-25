import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, UserCheck, Briefcase, Building2, FileDown } from 'lucide-react';
import { NetworkService } from '../../../services/network.service';
import type { NetworkHierarchy, EmployeeStat } from '../../../types/network.types';
import { ProfessionImages } from '../../../../../assets/semci';
import { ViewAsistencial } from './ViewEmployees';
import RedLevelAccess from '../../../../../core/components/RedLevelAccess';
import type { HierarchySelection } from '../../../../../core/components/RedLevelAccess';
import { Select } from '../../../../recursos-humanos/components/FormComponents';


export default function Dashboard() {
    const [data, setData] = useState<NetworkHierarchy | null>(null);
    // const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchySelection | null>(null);
    const selectedCodigoRed = selectedHierarchy?.codigoRed || '';
    const selectedCodigoMicrored = selectedHierarchy?.codigoMicrored;
    const selectedCodigoUnico = selectedHierarchy?.codigoUnico;
    const [selectedDistrict, setSelectedDistrict] = useState('TODOS');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [loadExport, setLoadExport] = useState(false);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalFilters, setModalFilters] = useState<{
        codigo_red: string;
        codigo_microred?: string;
        codigo_unico?: string;
        profession_name?: string;
        regime_name?: string;
        occupational_group?: string;
        personnel_type?: string;
        year?: number;
        month?: number;
        labor_condition_name?: string;
    }>({
        codigo_red: ''
    });

    const handleCardClick = (title: string, filters: Partial<typeof modalFilters>) => {
        setModalTitle(title);
        setModalFilters({
            codigo_red: selectedCodigoRed,
            codigo_microred: selectedCodigoMicrored && selectedCodigoMicrored !== 'SOLO RED' ? selectedCodigoMicrored : undefined,
            codigo_unico: selectedCodigoUnico && selectedCodigoUnico !== 'SOLO MICRORED' ? selectedCodigoUnico : undefined,
            year: selectedYear,
            month: selectedMonth,
            ...filters
        });
        setModalOpen(true);
    };

    const fetchData = async () => {
        // setLoading(true);
        setError(null);
        try {
            // Si el mes es 0 (Todos), pasamos undefined al servicio para que el backend lo interprete como "Todo el año"
            // El backend ahora maneja year + undefined month como "Buscar turnos en todo el año"
            if (!selectedCodigoRed) return; // Wait until RedLevelAccess initializes codigoRed
            const result = await NetworkService.getHierarchy(selectedCodigoRed, selectedYear, selectedMonth === 0 ? undefined : selectedMonth);
            setData(result);
        } catch (err) {
            setError('Error al cargar los datos de la red. Por favor intente nuevamente.');
            console.error(err);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCodigoRed) fetchData();
    }, [selectedCodigoRed, selectedYear, selectedMonth]);

    // Extract unique values for filters
    const { districts } = useMemo(() => {
        if (!data) return { districts: [] };

        const dists = new Set<string>();
        const micros = new Set<string>();
        const ests = new Set<string>();

        data.microredes.forEach(m => {
            micros.add(m.nom_microred);
            m.establecimientos.forEach(e => {
                if (e.distrito) dists.add(e.distrito);

                // Filter establishments based on selected District and Microred
                const matchMicrored = !selectedHierarchy?.codigoMicrored || selectedHierarchy.codigoMicrored === 'SOLO RED' || m.codigo_microred === selectedHierarchy.codigoMicrored;
                const matchDistrict = selectedDistrict === 'TODOS' || e.distrito === selectedDistrict;

                if (matchMicrored && matchDistrict) {
                    ests.add(e.nombre_establecimiento);
                }
            });
        });

        return {
            districts: Array.from(dists).sort()
        };
    }, [data, selectedDistrict, selectedHierarchy?.codigoMicrored]);

    // Filter Stats
    const filteredStats = useMemo(() => {
        if (!data) return [];
        let stats: EmployeeStat[] = [];

        data.microredes.forEach(microred => {
            if (selectedCodigoMicrored && selectedCodigoMicrored !== 'SOLO RED' && microred.codigo_microred !== selectedCodigoMicrored) return;

            microred.establecimientos.forEach(est => {
                if (selectedDistrict !== 'TODOS' && est.distrito !== selectedDistrict) return;
                if (selectedCodigoUnico && selectedCodigoUnico !== 'SOLO MICRORED' && est.codigo_unico !== selectedCodigoUnico) return;

                if (est.stats) {
                    stats = [...stats, ...est.stats];
                }
            });
        });

        return stats;
    }, [data, selectedDistrict, selectedCodigoMicrored, selectedCodigoUnico]);

    // Calculate Aggregates
    const aggregates = useMemo(() => {
        // Helper to get stats breakdown
        const getStats = (filterFn?: (s: EmployeeStat) => boolean) => {
            const stats = filterFn ? filteredStats.filter(filterFn) : filteredStats;
            const count = stats.reduce((acc, s) => acc + s.count, 0);

            // Calculate regimes for this group
            const regimes = { r1057: 0, r276: 0, r728: 0 };
            stats.forEach(s => {
                const r = s.regime?.toUpperCase() || '';
                if (r.includes('1057')) regimes.r1057 += s.count;
                else if (r.includes('276')) regimes.r276 += s.count;
                else if (r.includes('728')) regimes.r728 += s.count;
            });
            return { count, stats, regimes };
        };

        // 1. Total RHUS (General)
        const totalRhus = getStats().count;

        // 2. Regime Breakdown
        const regimeMap = { r1057: 0, r276: 0, r728: 0 };
        filteredStats.forEach(s => {
            const r = s.regime?.toUpperCase() || '';
            if (r.includes('1057')) regimeMap.r1057 += s.count;
            else if (r.includes('276')) regimeMap.r276 += s.count;
            else if (r.includes('728')) regimeMap.r728 += s.count;
        });

        // 3. All Professions (Occupational Group = PROFESIONAL && Type = ASISTENCIAL)
        const professionMap = new Map<string, { total: number, regimes: { r1057: number, r276: number, r728: number } }>();

        filteredStats.forEach(s => {
            // Filter: Only include ASISTENCIAL personnel in the detailed list
            if (s.personnel_type !== 'ASISTENCIAL') return;

            const grupo = s.profession_grupo;

            // Remove SIN PROFESION / SIN GRUPO from this list
            if (!grupo || grupo === 'SIN PROFESION' || grupo === 'SIN GRUPO') return;

            if (!professionMap.has(grupo)) {
                professionMap.set(grupo, { total: 0, regimes: { r1057: 0, r276: 0, r728: 0 } });
            }
            const p = professionMap.get(grupo)!;
            p.total += s.count;

            // Regimes breakdown for this profession (1057, 276, 728/TERCERO)
            const r = s.regime?.toUpperCase() || '';
            if (r.includes('1057')) {
                p.regimes.r1057 += s.count;
            } else if (r.includes('276')) {
                p.regimes.r276 += s.count;
            } else if (r.includes('728')) {
                p.regimes.r728 += s.count;
            }
        });

        const customOrder = [
            'MEDICO',
            'ENFERMERA(O)',
            'OBSTETRA',
            'CIRUJANO DENTISTA',
            'PSICOLOGO',
            'NUTRICIONISTA',
            'QUIMICO FARMACEUTICO',
            'BIOLOGO',
            'TECNICO EN ENFERMERIA',
            'TECNICO DE FARMACIA',
            'TECNICO LABORATORIO',
            'TECNOLOGO MEDICO',
            'TRABAJADOR SOCIAL',
        ];

        const allProfessions = Array.from(professionMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => {
                const indexA = customOrder.indexOf(a.name);
                const indexB = customOrder.indexOf(b.name);

                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;

                return b.total - a.total; // Default to count descending
            });

        // 4. Groups (Summary)
        // Card 1: Total Asistenciales (Including Professionals, Techs, Aux)
        const totalAsistenciales = getStats(s => s.personnel_type === 'ASISTENCIAL' && !!s.profession && s.profession !== 'SIN PROFESION');

        // Card 2: Techs and Auxiliaries (Asistencial)
        const tecAux = getStats(s => ['TECNICO', 'AUXILIAR'].includes(s.occupational_group) && s.personnel_type === 'ASISTENCIAL');

        // Card 3: Administrative
        const admin = getStats(s => s.personnel_type === 'ADMINISTRATIVO' && !!s.profession && s.profession !== 'SIN PROFESION');

        // Card 4: Terceros (Condition TERCERO)
        const tercerosStats = filteredStats.filter(s => s.labor_condition?.includes('TERCERO'));
        const tercerosTotal = tercerosStats.reduce((acc, s) => acc + s.count, 0);
        const tercerosAsist = tercerosStats.filter(s => s.personnel_type === 'ASISTENCIAL').reduce((acc, s) => acc + s.count, 0);
        const tercerosAdmin = tercerosStats.filter(s => s.personnel_type === 'ADMINISTRATIVO').reduce((acc, s) => acc + s.count, 0);

        // Card 5: Sin Profesion
        const sinProfesionStats = filteredStats.filter(s => !s.profession || s.profession === 'SIN PROFESION');
        const sinProfesionTotal = sinProfesionStats.reduce((acc, s) => acc + s.count, 0);
        const sinProfesionAsist = sinProfesionStats.filter(s => s.personnel_type === 'ASISTENCIAL').reduce((acc, s) => acc + s.count, 0);
        const sinProfesionAdmin = sinProfesionStats.filter(s => s.personnel_type === 'ADMINISTRATIVO').reduce((acc, s) => acc + s.count, 0);

        return {
            totalRhus,
            regimeMap,
            allProfessions,
            summary: {
                totalAsistenciales,
                tecAux,
                admin,
                terceros: { total: tercerosTotal, asist: tercerosAsist, admin: tercerosAdmin },
                sinProfesion: { total: sinProfesionTotal, asist: sinProfesionAsist, admin: sinProfesionAdmin }
            }
        };
    }, [filteredStats]);

    // Predefined color palette for cards
    const cardColors = [
        { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-900', subText: 'text-blue-800' },
        { border: 'border-cyan-400', bg: 'bg-cyan-100', text: 'text-cyan-900', subText: 'text-cyan-800' },
        { border: 'border-red-400', bg: 'bg-red-100', text: 'text-red-900', subText: 'text-red-800' },
        { border: 'border-sky-500', bg: 'bg-sky-100', text: 'text-sky-900', subText: 'text-sky-800' },
        { border: 'border-orange-400', bg: 'bg-orange-100', text: 'text-orange-900', subText: 'text-orange-800' },
        { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-900', subText: 'text-amber-800' },
        { border: 'border-purple-300', bg: 'bg-purple-100', text: 'text-purple-900', subText: 'text-purple-800' },
        { border: 'border-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-900', subText: 'text-emerald-800' },
        { border: 'border-indigo-400', bg: 'bg-indigo-100', text: 'text-indigo-900', subText: 'text-indigo-800' },
        { border: 'border-rose-300', bg: 'bg-rose-100', text: 'text-rose-900', subText: 'text-rose-800' }
    ];

    // Helper to get consistent color by string
    const getColorStyle = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return cardColors[Math.abs(hash) % cardColors.length];
    };

    // Helper to get profession image
    const getProfessionImage = (name: string) => {
        const normalized = name.toUpperCase().trim();
        if (normalized === 'MEDICO') return ProfessionImages.medico;
        if (normalized === 'ENFERMERA(O)') return ProfessionImages.enfermera;
        if (normalized === 'TECNICO EN ENFERMERIA') return ProfessionImages.tec_enfermera;
        if (normalized === 'CIRUJANO DENTISTA') return ProfessionImages.dentista;
        if (normalized === 'PSICOLOGO') return ProfessionImages.psicologo;
        if (normalized === 'NUTRICIONISTA') return ProfessionImages.nutricionista;
        if (normalized === 'BIOLOGO') return ProfessionImages.biologo;
        if (normalized === 'OBSTETRA') return ProfessionImages.obstetra;

        return ProfessionImages.enfermera;
    };

    // Reusable Stat Card Component matching the design
    const StatCard = ({
        title,
        total,
        colorStyle,
        items,
        icon,
        onClick,
        onItemClick
    }: {
        title: string,
        total: number,
        colorStyle: { border: string, bg: string, text: string, subText: string },
        items: { label: string, value: number, regime?: string }[],
        icon?: string,
        onClick?: () => void,
        onItemClick?: (regime: string) => void
    }) => (
        <article className={`rounded-xl border-2 ${colorStyle.border} overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer group`}>
            {/* Header */}
            <div
                className={` flex items-center h-full justify-center ${colorStyle.bg} relative transition-colors group-hover:bg-opacity-90`}
                onClick={onClick}
            >
                <div className='flex flex-col items-center justify-center'>
                    <h3 className={`${colorStyle.text} font-bold text-center text-sm leading-tight px-2`}>{title}</h3>
                    <div className={`text-4xl font-extrabold ${colorStyle.text}`}>{total.toLocaleString()}</div>
                </div>
                {icon && <img src={icon} alt="icon" className="h-24 right-2" />}
            </div>

            {/* Footer */}
            <div className={`flex border-t-2 ${colorStyle.border} ${colorStyle.bg}`}>
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className={`p-2 w-full flex flex-col items-center justify-center border-r-2 ${colorStyle.border} last:border-r-0 hover:bg-white/20 transition-colors`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (item.regime && onItemClick) onItemClick(item.regime);
                        }}
                    >
                        <span className={`text-[10px] font-bold ${colorStyle.subText} uppercase`}>{item.label}</span>
                        <span className={`text-lg font-bold ${colorStyle.text}`}>{item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </article>
    );

    // Handle Export
    const handleExport = async () => {
        setLoadExport(true);
        try {
            const blob = await NetworkService.exportEmployees(
                selectedCodigoRed,
                selectedCodigoMicrored && selectedCodigoMicrored !== 'SOLO RED' ? selectedCodigoMicrored : undefined,
                selectedCodigoUnico && selectedCodigoUnico !== 'SOLO MICRORED' ? selectedCodigoUnico : undefined,
                undefined, // profession_name
                undefined, // regime_name
                undefined, // occupational_group
                undefined, // personnel_type
                selectedYear,
                selectedMonth === 0 ? undefined : selectedMonth
            );

            // Dynamic Filename Generation
            const monthNames = [
                'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
            ];

            let filename = 'PERSONAL ASISTENCIAL';

            if (selectedCodigoUnico && selectedCodigoUnico !== 'SOLO MICRORED') {
                filename += ` - ${selectedHierarchy?.nombreEstablecimiento ?? selectedCodigoUnico}`;
            } else if (selectedCodigoMicrored && selectedCodigoMicrored !== 'SOLO RED') {
                filename += ` - ${selectedHierarchy?.nomMicrored ?? selectedCodigoMicrored}`;
            }

            if (selectedMonth !== 0) {
                filename += ` - ${monthNames[selectedMonth - 1]}`;
            }

            filename += ` - ${selectedYear}.xlsx`;

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting:', error);
        } finally {
            setLoadExport(false);
        }
    };

    // Handle Export Sede
    const handleExportSede = async (title: string, customFilters: { codigo_microred?: string, codigo_unico?: string }) => {
        try {
            const blob = await NetworkService.exportEmployees(
                selectedCodigoRed,
                customFilters.codigo_microred,
                customFilters.codigo_unico === 'TODOS' ? undefined : customFilters.codigo_unico
            );

            let filename = `REPORTE ${title.toUpperCase()} - ${selectedHierarchy?.nomRed ?? selectedCodigoRed} - ${new Date().getFullYear()}.xlsx`;

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting sede:', error);
        }
    };

    return (
        <>
            <div className="space-y-2 pb-60">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <LayoutDashboard className="w-6 h-6 text-blue-600" />
                            Dashboard de Recursos Humanos
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Visualización estadística de personal por red, microred y establecimiento</p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Filters */}
                <div className=" bg-white dark:bg-gray-800 p-2 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-row gap-4 items-end">
                    {/* Año */}
                    <div className='flex flex-[1]'>
                        <Select
                            label="Año"
                            name="year"
                            value={String(selectedYear)}
                            options={Array.from({ length: 2029 - new Date().getFullYear() + 1 }, (_, i) => new Date().getFullYear() + i).map(y => ({ value: String(y), label: String(y) }))}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        />
                    </div>
                    {/* Mes */}
                    <div className='flex flex-[1]'>
                        <Select
                            label="Mes"
                            name="month"
                            value={String(selectedMonth)}
                            options={[
                                { value: '0', label: 'TODOS' },
                                { value: '1', label: 'ENERO' },
                                { value: '2', label: 'FEBRERO' },
                                { value: '3', label: 'MARZO' },
                                { value: '4', label: 'ABRIL' },
                                { value: '5', label: 'MAYO' },
                                { value: '6', label: 'JUNIO' },
                                { value: '7', label: 'JULIO' },
                                { value: '8', label: 'AGOSTO' },
                                { value: '9', label: 'SEPTIEMBRE' },
                                { value: '10', label: 'OCTUBRE' },
                                { value: '11', label: 'NOVIEMBRE' },
                                { value: '12', label: 'DICIEMBRE' },
                            ]}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        />
                    </div>

                    {/* Distrito */}
                    <div className='flex flex-[2]'>
                        <Select
                            label="Distrito"
                            name="district"
                            value={selectedDistrict}
                            options={[{ value: 'TODOS', label: 'TODOS' }, ...districts.map(d => ({ value: d, label: d }))]}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                        />
                    </div>
                    {/* RedLevelAccess manages Red, Microred, Establecimiento */}
                    <div className='flex flex-[7]'>
                        <RedLevelAccess
                            onChange={setSelectedHierarchy}
                            labels={{ red: 'Red', microred: 'Microred', establecimiento: 'Establecimiento' }}
                        />
                    </div>

                    {/* Exportar */}
                    <button
                        onClick={handleExport}
                        className={`bg-blue-600 text-white text-sm font-medium p-[2px] px-4 rounded-sm ${loadExport ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={loadExport}
                    >
                        {loadExport ? 'Exportando...' : 'Exportar'}
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="flex items-center gap-4">

                    {/* Left Column: Totals & Regimes Custom Layout */}
                    <div className="relative overflow-hidden shadow-lg h-[300px] max-h-[300px] min-w-[300px]">
                        {/* Background Container for Curved Effect */}
                        <div className="inset-0 flex flex-col h-full">
                            {/* Top: Orange Section (Regimen 276) */}
                            <div className="flex-1 bg-orange-400 relative pr-5 flex flex-col items-end justify-center">
                                <h3 className="text-white text-lg font-bold">Régimen 276</h3>
                                <span className="text-white text-3xl font-extrabold">{aggregates.regimeMap.r276.toLocaleString()}</span>
                            </div>

                            {/* Middle: Green Section (Regimen 1057) */}
                            <div className="flex-1 bg-lime-500 relative pr-5 flex flex-col items-end justify-center">
                                {/* Regimen 1057 */}
                                <h3 className="text-white text-lg font-bold">Régimen 1057</h3>
                                <span className="text-white text-3xl font-extrabold">{aggregates.regimeMap.r1057.toLocaleString()}</span>
                            </div>

                            {/* Bottom: Blue Section (Regimen 728) */}
                            <div className="flex-1 bg-sky-400 relative pr-5 flex flex-col items-end justify-center">
                                <h3 className="text-white text-lg font-bold">Régimen 728</h3>
                                <span className="text-white text-3xl font-extrabold">{aggregates.regimeMap.r728.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Curved White Overlay with Total */}
                        <div className="absolute top-0 left-0 bottom-0 w-[50%] bg-white dark:bg-gray-800 rounded-r-[100%] shadow-[4px_0_24px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center z-2">
                            <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-2">Total RRHH</h2>
                            <span className="text-gray-900 dark:text-white text-3xl font-extrabold">{aggregates.totalRhus.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Right Column: Professions & Summary */}
                    <div className="w-full space-y-3">

                        {/* Section 1: All Professions */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-500" />Profesionales Asistenciales</h2>
                            {aggregates.allProfessions.length !== 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {aggregates.allProfessions.map((p) => {
                                        const colorStyle = getColorStyle(p.name);
                                        return (
                                            <StatCard
                                                key={p.name}
                                                title={p.name}
                                                total={p.total}
                                                colorStyle={colorStyle}
                                                icon={getProfessionImage(p.name)}
                                                items={[
                                                    { label: 'REG. 1057', value: p.regimes.r1057, regime: '1057' },
                                                    { label: 'REG. 276', value: p.regimes.r276, regime: '276' },
                                                    { label: 'REG. 728', value: p.regimes.r728, regime: '728' }
                                                ]}
                                                onClick={() => handleCardClick(p.name, { profession_name: p.name, personnel_type: 'ASISTENCIAL' })}
                                                onItemClick={(regime) => handleCardClick(`${p.name} - ${regime}`, { profession_name: p.name, regime_name: regime, personnel_type: 'ASISTENCIAL' })}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>No hay datos...</p>
                            )}
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-green-500" />Resumen General</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative">
                            {/* Card 1: Total Asistenciales */}
                            <StatCard
                                title="TOTAL ASISTENCIALES"
                                total={aggregates.summary.totalAsistenciales.count}
                                colorStyle={cardColors[2]} // Red
                                items={[
                                    { label: 'REG. 1057', value: aggregates.summary.totalAsistenciales.regimes.r1057, regime: '1057' },
                                    { label: 'REG. 276', value: aggregates.summary.totalAsistenciales.regimes.r276, regime: '276' },
                                    { label: 'REG. 728', value: aggregates.summary.totalAsistenciales.regimes.r728, regime: '728' }
                                ]}
                                onClick={() => handleCardClick('TOTAL ASISTENCIALES', { personnel_type: 'ASISTENCIAL', profession_name: 'CON PROFESION' })}
                                onItemClick={(regime) => handleCardClick(`TOTAL ASISTENCIALES - ${regime}`, { personnel_type: 'ASISTENCIAL', regime_name: regime, profession_name: 'CON PROFESION' })}
                            />

                            {/* Card 2: Administrativos */}
                            <StatCard
                                title="ADMINISTRATIVOS"
                                total={aggregates.summary.admin.count}
                                colorStyle={cardColors[7]} // Emerald
                                icon={ProfessionImages.administrativo}
                                items={[
                                    { label: 'REG. 1057', value: aggregates.summary.admin.regimes.r1057, regime: '1057' },
                                    { label: 'REG. 276', value: aggregates.summary.admin.regimes.r276, regime: '276' },
                                    { label: 'REG. 728', value: aggregates.summary.admin.regimes.r728, regime: '728' }
                                ]}
                                onClick={() => handleCardClick('ADMINISTRATIVOS', { personnel_type: 'ADMINISTRATIVO', profession_name: 'CON PROFESION' })}
                                onItemClick={(regime) => handleCardClick(`ADMINISTRATIVOS - ${regime}`, { personnel_type: 'ADMINISTRATIVO', regime_name: regime, profession_name: 'CON PROFESION' })}
                            />

                            {/* Card 3: Tecnicos y Auxiliares */}
                            <StatCard
                                title="TECNICOS Y AUXILIARES"
                                total={aggregates.summary.tecAux.count}
                                colorStyle={cardColors[4]} // Orange
                                items={[
                                    { label: 'REG. 1057', value: aggregates.summary.tecAux.regimes.r1057, regime: '1057' },
                                    { label: 'REG. 276', value: aggregates.summary.tecAux.regimes.r276, regime: '276' },
                                    { label: 'REG. 728', value: aggregates.summary.tecAux.regimes.r728, regime: '728' }
                                ]}
                                onClick={() => handleCardClick('TECNICOS Y AUXILIARES', { personnel_type: 'ASISTENCIAL', occupational_group: 'TECNICO,AUXILIAR' })}
                            />

                            {/* Card 4: Terceros (Condition TERCERO) */}
                            <StatCard
                                title="SERVICIO DE TERCEROS"
                                total={aggregates.summary.terceros.total}
                                colorStyle={cardColors[8]} // Indigo
                                icon={ProfessionImages.tercero}
                                items={[
                                    { label: 'ASIST.', value: aggregates.summary.terceros.asist },
                                    { label: 'ADMIN.', value: aggregates.summary.terceros.admin }
                                ]}
                                onClick={() => handleCardClick('SERVICIO DE TERCEROS', { labor_condition_name: 'TERCERO' })}
                            />

                            {/* Card 5: Sin Profesión */}
                            <StatCard
                                title="SIN PROFESIÓN"
                                total={aggregates.summary.sinProfesion.total}
                                colorStyle={cardColors[9]} // Rose
                                items={[
                                    { label: 'ASIST.', value: aggregates.summary.sinProfesion.asist },
                                    { label: 'ADMIN.', value: aggregates.summary.sinProfesion.admin }
                                ]}
                                onClick={() => handleCardClick('SIN PROFESIÓN', { profession_name: 'SIN PROFESION' })}
                            />

                            {/* Informacion de fuente actualizada */}
                            <div className="absolute bottom-2 right-0 text-[12px] font-[700] text-gray-500 dark:text-gray-400 border rounded-md border-gray-300 dark:border-gray-600 p-2">
                                <p>Fuente de Datos: <span>INFORHUS-AIRHSP</span></p>
                                <p>Fecha Actualizada: <span>25-02-2025</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className='border-gray-300' />
                {/* Contador de lista de empleados que apuntan a directamente a RED o MICRORED */}
                <aside className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-green-500" />
                        Resumen General en Red y Microred
                    </h2>

                    {/* Contadores Generales */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* Red Base */}
                        <div
                            onClick={() => handleCardClick('Personal Sede RED', {
                                codigo_microred: 'SOLO RED',
                                codigo_unico: undefined,
                                year: undefined,
                                month: undefined
                            })}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2 group hover:border-blue-500 transition-all cursor-pointer relative"
                        >

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-[700] text-gray-500 dark:text-gray-500 uppercase leading-none mb-1">RED</p>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{data?.nom_red || selectedHierarchy?.nomRed || 'RED'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
                                        {data?.summary_counts?.red_base?.count || 0}
                                    </p>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase">Profesionales</p>
                                </div>
                            </div>

                            {/* Regime Stats for Red */}
                            <div className="flex flex-wrap justify-between gap-1.5 dark:border-gray-700/50">
                                <div>
                                    {data?.summary_counts?.red_base?.regime_stats?.map((rs: any) => (
                                        <span key={rs.regime} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900/40 rounded text-[11px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700/50">
                                            {rs.regime}: <span className="text-blue-600 dark:text-blue-400">{rs.count}</span>
                                        </span>
                                    ))}
                                </div>
                                {/* Botón Exportar Sede RED */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportSede('Personal Sede RED', {
                                            codigo_microred: 'SOLO RED',
                                            codigo_unico: undefined
                                        });
                                    }}
                                    className="flex
                                     items-center gap-1 bg-blue-600 text-white text-sm font-medium p-[2px] px-4 rounded-sm hover:bg-blue-700 transition-all"
                                >
                                    <FileDown className="w-4 h-4" />Exportar
                                </button>
                            </div>
                        </div>

                        {/* Microredes 
                        <div className="grid grid-cols-1 gap-3">
                            {data?.summary_counts?.microredes?.map((mr: any) => (
                                <div 
                                    key={mr.codigo_microred} 
                                    onClick={() => handleCardClick(`Sede ${mr.nom_microred}`, { 
                                        nom_microred: mr.nom_microred,
                                        codigo_unico: 'SOLO MICRORED',
                                        year: undefined,
                                        month: undefined
                                    })}
                                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2 group hover:border-green-500 transition-all cursor-pointer relative"
                                >
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportSede(`Sede ${mr.nom_microred}`, { 
                                                nom_microred: mr.nom_microred,
                                                codigo_unico: 'SOLO MICRORED'
                                            });
                                        }}
                                        className="absolute top-4 right-4 p-1.5 bg-gray-50 hover:bg-green-600 hover:text-white rounded-lg text-gray-400 transition-all border border-gray-100 z-10 shadow-sm"
                                        title={`Exportar Sede ${mr.nom_microred} a Excel`}
                                    >
                                        <FileDown className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-[700] text-gray-500 dark:text-gray-500 uppercase leading-none mb-1">MICRORED</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-white">{mr.nom_microred}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-green-600 dark:text-green-400 leading-none">
                                                {mr.count}
                                            </p>
                                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Profesionales</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                                        {mr.regime_stats?.map((rs: any) => (
                                            <span key={rs.regime} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900/40 rounded text-[11px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700/50">
                                                {rs.regime}: <span className="text-green-600 dark:text-green-400">{rs.count}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div> */}
                    </div>
                </aside>

            </div>
            {/* Employee List Modal */}
            <ViewAsistencial
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                filters={modalFilters}
            />
        </>
    );
}
