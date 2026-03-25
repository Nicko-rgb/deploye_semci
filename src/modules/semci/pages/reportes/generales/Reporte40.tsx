import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//import { redes } from '../../../../core/utils/accesories';
import { accessoriesService } from '../../../../settings/services/accessoriesService';
import type { microredes, establecimientos } from '../../../../settings/services/accessoriesService';

type Tab = 'reporte' | 'exportar' | 'grupo';

const years = ['--', '2025', '2024', '2023', '2022', '2021'];
const etareo = ['--', '< de 1 Año', '1 Año', '2 Año', '3 Año', '4 Año'];
const years2 = ['--', '2021', '2022', '2023', '2024', '2025', '2026'];
const months = [
    '--', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];
const tipoprofe = ['--', 'Si', 'No'];
const etnias = ['--', 'Si', 'No'];
const ups = ['--', 'Si', 'No'];

type Row = {
    red: string;
    y2020: number;
    y2021: number;
    y2022: number;
    y2023: number;
    y2024: number;
};

type MonthRow = {
    mes: string;
    lt1: number;  // < 1 Año
    y1: number;   // 1 Año
    y2: number;
    y3: number;
    y4: number;
    y5_11: number;
    y12_17: number;
    y18_29: number;
    y30_59: number;
    y60p: number; // 60+ Años
    total: number;
};

export default function Reporte40() {
    const [selectedTab, setSelectedTab] = useState<Tab>('reporte');

    // ===== ESTADO COMPARTIDO =====
    //const [redesOptions, setRedesOptions] = useState<string[]>([]);

    // ===== ESTADOS PARA PESTAÑA "REPORTE" (solo año y grupo etáreo) =====
    const [reporteYear, setReporteYear] = useState('--');
    const [reporteEtareo, setReporteEtareo] = useState('--');
    const [reporteLoading, setReporteLoading] = useState(false);
    const [reporteError, setReporteError] = useState('');
    const [reporteTblAtendidos, setReporteTblAtendidos] = useState<Row[]>([]);
    const [reporteTblAtenciones, setReporteTblAtenciones] = useState<Row[]>([]);

    // ===== ESTADOS PARA PESTAÑA "EXPORTAR" (tiene red, microred, establecimiento) =====
    const [exportarYear, setExportarYear] = useState('--');
    const [exportarMonth, setExportarMonth] = useState('--');
    const [exportarRed, setExportarRed] = useState('');
    const [exportarMicroRed, setExportarMicroRed] = useState('');
    const [exportarEstablecimiento, setExportarEstablecimiento] = useState('');
    const [exportarProfeciones, setExportarProfeciones] = useState('No');
    const [exportarEtnias, setExportarEtnias] = useState('No');
    const [exportarUps, setExportarUps] = useState('No');
    const [exportarMicroredesOptions, setExportarMicroredesOptions] = useState<microredes[]>([]);
    const [exportarEstablecimientosOptions, setExportarEstablecimientosOptions] = useState<establecimientos[]>([]);

    // ===== ESTADOS PARA PESTAÑA "GRUPO" (tiene red, microred, establecimiento) =====
    const [grupoYear, setGrupoYear] = useState('--');
    const [grupoMonth, setGrupoMonth] = useState('--');
    const [grupoRed, setGrupoRed] = useState('');
    const [grupoMicroRed, setGrupoMicroRed] = useState('');
    const [grupoEstablecimiento, setGrupoEstablecimiento] = useState('');
    const [grupoMicroredesOptions, setGrupoMicroredesOptions] = useState<microredes[]>([]);
    const [grupoEstablecimientosOptions, setGrupoEstablecimientosOptions] = useState<establecimientos[]>([]);
    const [grupoLoading, setGrupoLoading] = useState(false);
    const [grupoError, setGrupoError] = useState('');
    const [grupoRows, setGrupoRows] = useState<MonthRow[]>([]);

    // util: headers fijos (últimos 5 años como en maqueta)
    const headers = ['2020', '2021', '2022', '2023', '2024'];

    const redesBase = [
        'AGUAYTIA',
        'ATALAYA',
        'CORONEL PORTILLO',
        'FEDERICO BASADRE - YARINACOCHA',
        'NO PERTENECE A NINGUNA RED',
    ];

    // ===== CARGAR REDES (COMPARTIDO) =====
    /*useEffect(() => {
        const loadRedes = () => {
            const redesList = redes.map(r => r.nombre_red);
            setRedesOptions(redesList);
        };
        loadRedes();
    }, []);*/

    // ===== EFECTOS PARA PESTAÑA "EXPORTAR" =====
    useEffect(() => {
        const loadMicroredes = async () => {
            if (exportarRed) {
                try {
                    const microredesData = await accessoriesService.getMicroredesByNombreRed(exportarRed);
                    setExportarMicroredesOptions(microredesData);
                    setExportarMicroRed('');
                    setExportarEstablecimientosOptions([]);
                    setExportarEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando microredes (exportar):', error);
                }
            } else {
                setExportarMicroredesOptions([]);
                setExportarMicroRed('');
                setExportarEstablecimientosOptions([]);
                setExportarEstablecimiento('');
            }
        };
        loadMicroredes();
    }, [exportarRed]);

    useEffect(() => {
        const loadEstablecimientos = async () => {
            if (exportarRed && exportarMicroRed) {
                try {
                    const establecimientosData = await accessoriesService.getEstablecimientosByNombreRedMicroRed(exportarRed, exportarMicroRed);
                    setExportarEstablecimientosOptions(establecimientosData);
                    setExportarEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando establecimientos (exportar):', error);
                }
            } else {
                setExportarEstablecimientosOptions([]);
                setExportarEstablecimiento('');
            }
        };
        loadEstablecimientos();
    }, [exportarRed, exportarMicroRed]);

    // ===== EFECTOS PARA PESTAÑA "GRUPO" =====
    useEffect(() => {
        const loadMicroredes = async () => {
            if (grupoRed) {
                try {
                    const microredesData = await accessoriesService.getMicroredesByNombreRed(grupoRed);
                    setGrupoMicroredesOptions(microredesData);
                    setGrupoMicroRed('');
                    setGrupoEstablecimientosOptions([]);
                    setGrupoEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando microredes (grupo):', error);
                }
            } else {
                setGrupoMicroredesOptions([]);
                setGrupoMicroRed('');
                setGrupoEstablecimientosOptions([]);
                setGrupoEstablecimiento('');
            }
        };
        loadMicroredes();
    }, [grupoRed]);

    useEffect(() => {
        const loadEstablecimientos = async () => {
            if (grupoRed && grupoMicroRed) {
                try {
                    const establecimientosData = await accessoriesService.getEstablecimientosByNombreRedMicroRed(grupoRed, grupoMicroRed);
                    setGrupoEstablecimientosOptions(establecimientosData);
                    setGrupoEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando establecimientos (grupo):', error);
                }
            } else {
                setGrupoEstablecimientosOptions([]);
                setGrupoEstablecimiento('');
            }
        };
        loadEstablecimientos();
    }, [grupoRed, grupoMicroRed]);

    // ===== FUNCIONES =====
    // generador demo (puedes reemplazar con fetch a tu API)
    const mockFetch = async (anio: string, grupo: string) => {
        await new Promise((r) => setTimeout(r, 800));

        const seed = (s: number) => (mul: number) =>
            Math.max(0, Math.round((s * 9301 + 49297) % 100000 * mul));

        const s1 = seed(Number(anio.replace('--', '2024').slice(-1)) + grupo.length);

        const makeRow = (red: string, base: number): Row => ({
            red,
            y2020: 0,
            y2021: 0,
            y2022: Math.round(base * 0.22),
            y2023: Math.round(base * 0.27),
            y2024: Math.round(base * 0.33),
        });

        const atendidos = redesBase.map((r, i) => makeRow(r, Math.round((i + 1) * 1200 + (s1(0.015) % 800))));
        atendidos[2].y2024 = 7513;
        atendidos[3].y2024 = 6414;

        const atenciones: Row[] = redesBase.map((r, i) => {
            const base = Math.round((i + 1) * 15000 + (s1(0.2) % 9000));
            return {
                red: r,
                y2020: 0,
                y2021: 0,
                y2022: Math.round(base * 1.05),
                y2023: Math.round(base * 1.22),
                y2024: Math.round(base * 1.35),
            };
        });
        atenciones[2].y2024 = 73781;
        atenciones[3].y2024 = 66988;
        atenciones[4].y2024 = 580;

        return { atendidos, atenciones };
    };

    const handleBuscar = async () => {
        setReporteError('');
        if (reporteYear === '--' || reporteEtareo === '--') {
            setReporteError('Selecciona Año y Grupo Etáreo.');
            return;
        }
        try {
            setReporteLoading(true);
            const { atendidos, atenciones } = await mockFetch(reporteYear, reporteEtareo);
            setReporteTblAtendidos(atendidos);
            setReporteTblAtenciones(atenciones);
        } catch (e) {
            setReporteError('No se pudo generar el reporte.');
        } finally {
            setReporteLoading(false);
        }
    };

    const meses = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];

    const rowSum = (r: Omit<MonthRow, 'total'>) =>
        r.lt1 + r.y1 + r.y2 + r.y3 + r.y4 + r.y5_11 + r.y12_17 + r.y18_29 + r.y30_59 + r.y60p;

    const mockGrupoEtareo = async ({
        red, anio, mes, microred, establecimiento
    }: { red: string; anio: string; mes: string; microred: string; establecimiento: string; }) => {
        await new Promise(r => setTimeout(r, 500));

        const base = (seed: number) => (k: number) =>
            Math.max(0, Math.round((((seed * 9301 + 49297) % 100000) / 1000) * k));

        const s = base(
            (anio === '--' ? 2025 : Number(anio)) +
            (meses.indexOf(mes) + 1) * 7 +
            red.length + microred.length + establecimiento.length
        );

        const rows: MonthRow[] = meses.map((m, idx) => {
            const r = {
                mes: m,
                lt1: 5 + s(0.7) + idx % 4,
                y1: 6 + s(0.6),
                y2: 4 + s(0.5),
                y3: 3 + s(0.5),
                y4: 2 + s(0.4),
                y5_11: 15 + s(0.9),
                y12_17: 12 + s(0.8),
                y18_29: 10 + s(0.7),
                y30_59: 25 + s(1.2),
                y60p: 6 + s(0.45)
            };
            return { ...r, total: rowSum(r) };
        });

        rows[6].y5_11 += 90; rows[6].y12_17 += 40; rows[6].y30_59 += 40;
        rows[6].total = rowSum(rows[6]);

        return rows;
    };

    const GrupoEtareoTable = ({ data }: { data: MonthRow[] }) => {
        const totals = data.reduce((acc, r) => {
            acc.lt1 += r.lt1; acc.y1 += r.y1; acc.y2 += r.y2; acc.y3 += r.y3; acc.y4 += r.y4;
            acc.y5_11 += r.y5_11; acc.y12_17 += r.y12_17; acc.y18_29 += r.y18_29; acc.y30_59 += r.y30_59; acc.y60p += r.y60p;
            acc.total += r.total;
            return acc;
        }, { lt1: 0, y1: 0, y2: 0, y3: 0, y4: 0, y5_11: 0, y12_17: 0, y18_29: 0, y30_59: 0, y60p: 0, total: 0 });

        const TH = (p: string) => <th className="px-3 py-2 text-center text-xs md:text-sm border-r border-gray-200 last:border-r-0 text-gray-800 dark:text-white bg-[#1698AC] dark:bg-[#196F7C]">{p}</th>;
        const TD = (n: number) => <td className="px-3 py-2 text-center tabular-nums border-r border-gray-200 last:border-r-0 text-gray-800 dark:text-white">{n.toLocaleString('es-PE')}</td>;
        const TH1 = (p: string) => <td className="px-3 py-2 text-center text-xs md:text-sm border-r border-gray-200 last:border-r-0 text-white dark:text-gray-800 dark:bg-white bg-gray-800">{p}</td>

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 font-semibold bg-[#1698AC] text-center text-gray-900 dark:text-white dark:bg-[#196F7C]">Reporte de Atenciones por Grupo Etáreo</div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-[#1698AC] dark:bg-gray-700/40 ">
                            <tr>
                                {TH('Mes')}
                                {TH('< 1 Año')}
                                {TH('1 Año')}
                                {TH('2 Años')}
                                {TH('3 Años')}
                                {TH('4 Años')}
                                {TH('5-11 Años')}
                                {TH('12-17 Años')}
                                {TH('18-29 Años')}
                                {TH('30-59 Años')}
                                {TH('60+ Años')}
                                {TH1('Total')}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(r => (
                                <tr key={r.mes} className="border border-gray-400 dark:border-gray-700 text-gray-800 dark:text-white">
                                    <td className="px-3 py-2 border-r border-gray-200 last:border-r-0 text-gray-800 dark:text-white">{r.mes}</td>
                                    {TD(r.lt1)}{TD(r.y1)}{TD(r.y2)}{TD(r.y3)}{TD(r.y4)}
                                    {TD(r.y5_11)}{TD(r.y12_17)}{TD(r.y18_29)}{TD(r.y30_59)}{TD(r.y60p)}{TD(r.total)}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={12} className="px-3 py-6 text-center text-gray-500 dark:text-gray-300">
                                        No hay datos. Genera el reporte.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {data.length > 0 && (
                            <tfoot className="bg-yellow-100 dark:bg-yellow-700/20 font-semibold border border-gray-400 dark:border-gray-700">
                                <tr className='text-center'>
                                    <td className="px-3 py-2 text-gray-800 dark:text-white border-r border-gray-400 dark:border-gray-200">TOTAL</td>
                                    {TD(totals.lt1)}{TD(totals.y1)}{TD(totals.y2)}{TD(totals.y3)}{TD(totals.y4)}
                                    {TD(totals.y5_11)}{TD(totals.y12_17)}{TD(totals.y18_29)}{TD(totals.y30_59)}{TD(totals.y60p)}{TD(totals.total)}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        );
    };

    const generarReporte = async () => {
        setGrupoError('');
        if (!grupoRed || grupoRed === '--' || grupoYear === '--') {
            setGrupoError('Selecciona Red y Año.');
            return;
        }
        try {
            setGrupoLoading(true);
            const rows = await mockGrupoEtareo({
                red: grupoRed,
                anio: grupoYear,
                mes: grupoMonth,
                microred: grupoMicroRed,
                establecimiento: grupoEstablecimiento
            });
            setGrupoRows(rows);
        } catch (e) {
            setGrupoError('No se pudo generar el reporte por grupo etáreo.');
        } finally {
            setGrupoLoading(false);
        }
    };

    const handleExportar = () => {
        console.log("Exportando datos...");
    };

    const Cell = ({ v }: { v: number }) => (
        <td className="px-3 py-2 text-right tabular-nums text-gray-800 dark:text-white">{v.toLocaleString('es-PE')}</td>
    );

    const Table = ({
        title,
        data,
    }: {
        title: string;
        data: Row[];
    }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                {title}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-100">
                        <tr>
                            <th className="px-3 py-2 text-left w-64">RED</th>
                            {headers.map((h) => (
                                <th key={h} className="px-3 py-2 text-right">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.red} className="border-t border-gray-100 dark:border-gray-700">
                                <td className="px-3 py-2 text-blue-700 dark:text-blue-300 hover:underline cursor-pointer">
                                    {row.red}
                                </td>
                                <Cell v={row.y2020} />
                                <Cell v={row.y2021} />
                                <Cell v={row.y2022} />
                                <Cell v={row.y2023} />
                                <Cell v={row.y2024} />
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                                    No hay datos. Realiza una búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // A partir de aquí va el return...


    return (
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header principal */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">REPORTE 40</h1>
                        <p className="text-blue-100">Reporte de Atendidos y Atenciones por Grupo Etáreo</p>
                    </div>
                </div>
                <Link to="/home/reportes/generales" className="flex items-center justify-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg transition-colors duration-200 hover:bg-opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            {/* Contenedor principal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex space-x-0 rounded-lg" aria-label="Tabs">
                        {[
                            { id: 'reporte', name: '📊 Reporte Atendido y Atenciones', active: selectedTab === 'reporte' },
                            { id: 'exportar', name: '📥 Exportar Reporte 40', active: selectedTab === 'exportar' },
                            { id: 'grupo', name: '👥 Reporte por Grupo Etáreo', active: selectedTab === 'grupo' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as Tab)}
                                className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 ${tab.active
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ========================================= */}
                {/* PESTAÑA: REPORTE ATENDIDO Y ATENCIONES   */}
                {/* ========================================= */}
                {selectedTab === 'reporte' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Reporte de Atendidos y Atenciones por Año y Grupo Etáreo
                            </h2>
                        </div>

                        {/* Formulario de búsqueda */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Año: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={reporteYear}
                                    onChange={(e) => setReporteYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Grupo Etáreo: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={reporteEtareo}
                                    onChange={(e) => setReporteEtareo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {etareo.map((e) => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[200px] flex items-end">
                                <button
                                    onClick={handleBuscar}
                                    disabled={reporteLoading}
                                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    {reporteLoading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Buscando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <span>Buscar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mensaje de error */}
                        {reporteError && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-600 dark:text-red-400 text-sm">{reporteError}</p>
                            </div>
                        )}

                        {/* Loading overlay */}
                        {reporteLoading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300">Generando reporte...</span>
                                </div>
                            </div>
                        )}

                        {/* Tablas de resultados */}
                        {!reporteLoading && reporteTblAtendidos.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Tabla Atendidos */}
                                <Table title="Atendidos" data={reporteTblAtendidos} />

                                {/* Tabla Atenciones */}
                                <Table title="Atenciones" data={reporteTblAtenciones} />
                            </div>
                        )}

                        {/* Mensaje inicial */}
                        {!reporteLoading && reporteTblAtendidos.length === 0 && !reporteError && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Selecciona los filtros para generar el reporte
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Elige un año y grupo etáreo para ver los datos de atendidos y atenciones.
                                </p>
                            </div>
                        )}
                    </div>
                )}


                {/* ========================================= */}
                {/* PESTAÑA: EXPORTAR REPORTE 40             */}
                {/* ========================================= */}
                {selectedTab === 'exportar' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Exportar Reporte 40 con Filtros Detallados
                            </h2>
                        </div>

                        {/* Formulario de exportación */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Año */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Año: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={exportarYear}
                                    onChange={(e) => setExportarYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {years2.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mes:
                                </label>
                                <select
                                    value={exportarMonth}
                                    onChange={(e) => setExportarMonth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {months.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Red */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Red: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={exportarRed}
                                    onChange={(e) => setExportarRed(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">-- Seleccionar Red --</option>
                                    {/*redesOptions.map((red) => (
                                        <option key={red} value={red}>
                                            {red}
                                        </option>
                                    ))*/}
                                </select>
                            </div>

                            {/* Microred */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Microred:
                                </label>
                                <select
                                    value={exportarMicroRed}
                                    onChange={(e) => setExportarMicroRed(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    disabled={!exportarRed}
                                >
                                    <option value="">-- Todas las Microred --</option>
                                    {exportarMicroredesOptions.map((microred) => (
                                        <option key={microred.nom_microred} value={microred.nom_microred}>
                                            {microred.nom_microred}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Establecimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Establecimiento:
                                </label>
                                <select
                                    value={exportarEstablecimiento}
                                    onChange={(e) => setExportarEstablecimiento(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    disabled={!exportarMicroRed}
                                >
                                    <option value="">-- Todos los Establecimientos --</option>
                                    {exportarEstablecimientosOptions.map((establecimiento) => (
                                        <option key={establecimiento.nombre_establecimiento} value={establecimiento.nombre_establecimiento}>
                                            {establecimiento.nombre_establecimiento}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tipos de Profesión */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipos de Profesión:
                                </label>
                                <select
                                    value={exportarProfeciones}
                                    onChange={(e) => setExportarProfeciones(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {tipoprofe.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Etnias */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Etnias:
                                </label>
                                <select
                                    value={exportarEtnias}
                                    onChange={(e) => setExportarEtnias(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {etnias.map((et) => (
                                        <option key={et} value={et}>{et}</option>
                                    ))}
                                </select>
                            </div>

                            {/* UPS */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    UPS:
                                </label>
                                <select
                                    value={exportarUps}
                                    onChange={(e) => setExportarUps(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {ups.map((u) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Botón de exportar */}
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={handleExportar}
                                disabled={!exportarRed || exportarYear === '--'}
                                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar Reporte
                            </button>
                        </div>

                        {/* Información de filtros seleccionados */}
                        {exportarRed && exportarYear !== '--' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                    Filtros seleccionados:
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-blue-200">
                                    <div><span className="font-medium">Año:</span> {exportarYear}</div>
                                    <div><span className="font-medium">Mes:</span> {exportarMonth || 'Todos'}</div>
                                    <div><span className="font-medium">Red:</span> {exportarRed}</div>
                                    <div><span className="font-medium">Microred:</span> {exportarMicroRed || 'Todas'}</div>
                                    <div><span className="font-medium">Establecimiento:</span> {exportarEstablecimiento || 'Todos'}</div>
                                    <div><span className="font-medium">Profesión:</span> {exportarProfeciones}</div>
                                    <div><span className="font-medium">Etnias:</span> {exportarEtnias}</div>
                                    <div><span className="font-medium">UPS:</span> {exportarUps}</div>
                                </div>
                            </div>
                        )}

                        {/* Mensaje inicial */}
                        {(!exportarRed || exportarYear === '--') && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Configura los filtros para exportar
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Selecciona al menos el año y la red para exportar el reporte.
                                </p>
                            </div>
                        )}
                    </div>
                )}
                {/* ========================================= */}
                {/* PESTAÑA: REPORTE POR GRUPO ETÁREO        */}
                {/* ========================================= */}
                {selectedTab === 'grupo' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Reporte de Atenciones por Grupo Etáreo y Mes
                            </h2>
                        </div>

                        {/* Formulario de búsqueda */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Año */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Año: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={grupoYear}
                                    onChange={(e) => setGrupoYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {years2.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mes:
                                </label>
                                <select
                                    value={grupoMonth}
                                    onChange={(e) => setGrupoMonth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {months.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Red */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Red: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={grupoRed}
                                    onChange={(e) => setGrupoRed(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">-- Seleccionar Red --</option>
                                    {/*redesOptions.map((red) => (
                                        <option key={red} value={red}>
                                            {red}
                                        </option>
                                    ))*/}
                                </select>
                            </div>

                            {/* Microred */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Microred:
                                </label>
                                <select
                                    value={grupoMicroRed}
                                    onChange={(e) => setGrupoMicroRed(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    disabled={!grupoRed}
                                >
                                    <option value="">-- Todas las Microred --</option>
                                    {grupoMicroredesOptions.map((microred) => (
                                        <option key={microred.nom_microred} value={microred.nom_microred}>
                                            {microred.nom_microred}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Establecimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Establecimiento:
                                </label>
                                <select
                                    value={grupoEstablecimiento}
                                    onChange={(e) => setGrupoEstablecimiento(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    disabled={!grupoMicroRed}
                                >
                                    <option value="">-- Todos los Establecimientos --</option>
                                    {grupoEstablecimientosOptions.map((establecimiento) => (
                                        <option key={establecimiento.nombre_establecimiento} value={establecimiento.nombre_establecimiento}>
                                            {establecimiento.nombre_establecimiento}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={generarReporte}
                                disabled={grupoLoading || !grupoRed || grupoYear === '--'}
                                className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {grupoLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Generar Reporte
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleExportar}
                                disabled={grupoRows.length === 0}
                                className="flex items-center px-6 py-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar
                            </button>
                        </div>

                        {/* Mensaje de error */}
                        {grupoError && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-600 dark:text-red-400 text-sm">{grupoError}</p>
                            </div>
                        )}

                        {/* Loading */}
                        {grupoLoading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-300">Generando reporte...</span>
                                </div>
                            </div>
                        )}

                        {/* Información de filtros seleccionados */}
                        {grupoRed && grupoYear !== '--' && grupoRows.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                    Filtros aplicados:
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-blue-200">
                                    <div><span className="font-medium">Año:</span> {grupoYear}</div>
                                    <div><span className="font-medium">Mes:</span> {grupoMonth || 'Todos'}</div>
                                    <div><span className="font-medium">Red:</span> {grupoRed}</div>
                                    {grupoMicroRed && <div><span className="font-medium">Microred:</span> {grupoMicroRed}</div>}
                                    {grupoEstablecimiento && <div><span className="font-medium">Establecimiento:</span> {grupoEstablecimiento}</div>}
                                </div>
                            </div>
                        )}

                        {/* Tabla de resultados */}
                        {!grupoLoading && grupoRows.length > 0 && (
                            <GrupoEtareoTable data={grupoRows} />
                        )}

                        {/* Mensaje inicial */}
                        {!grupoLoading && grupoRows.length === 0 && !grupoError && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Selecciona los filtros para generar el reporte
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Elige al menos el año y la red para ver las atenciones por grupo etáreo.
                                </p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

