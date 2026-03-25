import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
//import { redes } from '../../../../core/utils/accesories';
import { accessoriesService } from '../../../../settings/services/accessoriesService';
import type { microredes, establecimientos } from '../../../../settings/services/accessoriesService';

type Row = {
    id: string;
    red: string;
    microred: string;
    establecimiento: string;
    dni: string;
    profesional: string;
    profesion: string;
    visita_1: number;
    visita_2: number;
    visita_3: number;
    visita_4: number;
    visita_mas_4: number;
    visita_ta: number;
    total: number;
};

const years = ['--', '2021', '2022', '2023', '2024', '2025', '2026'];
const months = [
    '--', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

export default function Profam() {
    // Filtros
    const [selectedYear, setSelectedYear] = useState('--');
    const [selectedMonth, setSelectedMonth] = useState('--');
    const [selectedRed, setSelectedRed] = useState('');
    const [selectedMicroRed, setSelectedMicroRed] = useState('');
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState('');

    // Opciones dinámicas
    //const [redesOptions, setRedesOptions] = useState<string[]>([]);
    const [microredesOptions, setMicroredesOptions] = useState<microredes[]>([]);
    const [establecimientosOptions, setEstablecimientosOptions] = useState<establecimientos[]>([]);

    // Datos
    const [data, setData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Búsqueda + paginación
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(25);
    const [page, setPage] = useState(1);

    // Mock data
    const mock: Row[] = [
        {
            id: '1',
            red: 'CORONEL PORTILLO',
            microred: 'SAN FERNANDO',
            establecimiento: 'NUEVO SAN JUAN',
            dni: '44726233',
            profesional: 'APAGUEÑO MARTINEZ ESHDID NISGREY',
            profesion: 'TECNICAS DE ENFERMERIA',
            visita_1: 0, visita_2: 0, visita_3: 0, visita_4: 8, visita_mas_4: 8, visita_ta: 8, total: 16
        },
        {
            id: '2',
            red: 'CORONEL PORTILLO',
            microred: 'SAN FERNANDO',
            establecimiento: 'NUEVO SAN JUAN',
            dni: '00123095',
            profesional: 'TUANAMA TUANAMA LLANET',
            profesion: 'TECNICAS DE ENFERMERIA',
            visita_1: 8, visita_2: 0, visita_3: 0, visita_4: 0, visita_mas_4: 0, visita_ta: 0, total: 8
        },
        {
            id: '3',
            red: 'CORONEL PORTILLO',
            microred: 'SAN FERNANDO',
            establecimiento: 'NUEVO SAN JUAN',
            dni: '45968210',
            profesional: 'IZQUIERDO MENDOZA RAUL EFRAIN',
            profesion: 'TECNICO DE LABORATORIO',
            visita_1: 8, visita_2: 0, visita_3: 0, visita_4: 0, visita_mas_4: 0, visita_ta: 0, total: 8
        }
    ];

    // ===== CARGAR REDES =====
    /*useEffect(() => {
        const loadRedes = () => {
            const redesList = redes.map(r => r.nombre_red);
            setRedesOptions(redesList);
        };
        loadRedes();
    }, []);*/

    // ===== CARGAR MICROREDES =====
    useEffect(() => {
        const loadMicroredes = async () => {
            if (selectedRed) {
                try {
                    const microredesData = await accessoriesService.getMicroredesByNombreRed(selectedRed);
                    setMicroredesOptions(microredesData);
                    setSelectedMicroRed('');
                    setEstablecimientosOptions([]);
                    setSelectedEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando microredes:', error);
                }
            } else {
                setMicroredesOptions([]);
                setSelectedMicroRed('');
                setEstablecimientosOptions([]);
                setSelectedEstablecimiento('');
            }
        };
        loadMicroredes();
    }, [selectedRed]);

    // ===== CARGAR ESTABLECIMIENTOS =====
    useEffect(() => {
        const loadEstablecimientos = async () => {
            if (selectedRed && selectedMicroRed) {
                try {
                    const establecimientosData = await accessoriesService.getEstablecimientosByNombreRedMicroRed(selectedRed, selectedMicroRed);
                    setEstablecimientosOptions(establecimientosData);
                    setSelectedEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando establecimientos:', error);
                }
            } else {
                setEstablecimientosOptions([]);
                setSelectedEstablecimiento('');
            }
        };
        loadEstablecimientos();
    }, [selectedRed, selectedMicroRed]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Aquí puedes hacer la llamada a tu API real
            // const response = await api.getProfamData({ year, month, red, microred, establecimiento });
            
            const byFilters = mock.filter(r => {
                if (selectedRed && r.red !== selectedRed) return false;
                if (selectedMicroRed && r.microred !== selectedMicroRed) return false;
                if (selectedEstablecimiento && r.establecimiento !== selectedEstablecimiento) return false;
                return true;
            });

            const bySearch = !search.trim()
                ? byFilters
                : byFilters.filter(r =>
                    r.dni.includes(search.trim()) ||
                    r.profesional.toLowerCase().includes(search.trim().toLowerCase())
                );

            setData(bySearch);
        } catch (e: any) {
            setError(e.message ?? 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = () => {
        if (!selectedRed) {
            setError('Selecciona al menos una Red.');
            setData([]);
            return;
        }
        setError(null);
        setPage(1);
        fetchData();
    };

    // Autocarga cuando cambien filtros relevantes
    useEffect(() => {
        if (selectedRed) {
            setPage(1);
            fetchData();
        } else {
            setData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRed, selectedMicroRed, selectedEstablecimiento, selectedYear, selectedMonth, search]);

    // Paginación local
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    
    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    const pagedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, page, pageSize]);

    const exportRow = (row: Row) => {
        const headers = ['RED', 'MICRORED', 'ESTABLECIMIENTO', 'DNI', 'PROFESIONAL', 'PROFESION', 'VISITA_1', 'VISITA_2', 'VISITA_3', 'VISITA_4', 'VISITA_>4', 'VISITA_TA', 'TOTAL'];
        const values = [row.red, row.microred, row.establecimiento, row.dni, row.profesional, row.profesion, row.visita_1, row.visita_2, row.visita_3, row.visita_4, row.visita_mas_4, row.visita_ta, row.total];
        const csv = [headers.join(','), values.join(',')].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profam_${row.dni}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportAll = () => {
        if (data.length === 0) return;
        
        const headers = ['RED', 'MICRORED', 'ESTABLECIMIENTO', 'DNI', 'PROFESIONAL', 'PROFESION', 'VISITA_1', 'VISITA_2', 'VISITA_3', 'VISITA_4', 'VISITA_>4', 'VISITA_TA', 'TOTAL'];
        const rows = data.map(row => [
            row.red, row.microred, row.establecimiento, row.dni, row.profesional, 
            row.profesion, row.visita_1, row.visita_2, row.visita_3, row.visita_4, 
            row.visita_mas_4, row.visita_ta, row.total
        ]);
        
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profam_completo_${new Date().getTime()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header principal */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">SALUD FAMILIAR</h1>
                        <p className="text-blue-100">Fuente: HIS MINSA - Actualizado al 19/09/2025</p>
                    </div>
                </div>

                <Link to="/home/reportes/generales" className="flex items-center justify-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg transition-colors duration-200 hover:bg-opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Reporte de Producción Profesional - Salud Familiar
                    </h2>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Año: <span className="text-red-500">(*)</span>
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mes:
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Red: <span className="text-red-500">(*)</span>
                        </label>
                        <select
                            value={selectedRed}
                            onChange={(e) => setSelectedRed(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">-- Seleccionar Red --</option>
                            {/*redesOptions.map(r => <option key={r} value={r}>{r}</option>)*/}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Microred:
                        </label>
                        <select
                            value={selectedMicroRed}
                            onChange={(e) => setSelectedMicroRed(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={!selectedRed}
                        >
                            <option value="">-- Todas las Microred --</option>
                            {microredesOptions.map(mr => (
                                <option key={mr.nom_microred} value={mr.nom_microred}>
                                    {mr.nom_microred}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Establecimiento:
                        </label>
                        <select
                            value={selectedEstablecimiento}
                            onChange={(e) => setSelectedEstablecimiento(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={!selectedMicroRed}
                        >
                            <option value="">-- Todos los Establecimientos --</option>
                            {establecimientosOptions.map(est => (
                                <option key={est.nombre_establecimiento} value={est.nombre_establecimiento}>
                                    {est.nombre_establecimiento}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Botón Buscar */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={handleBuscar}
                        disabled={loading || !selectedRed}
                        className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Buscando...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Buscar
                            </>
                        )}
                    </button>

                    <button
                        onClick={exportAll}
                        disabled={data.length === 0}
                        className="flex items-center px-6 py-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exportar Todo
                    </button>
                </div>

                {/* Controles de tabla */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Ver</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        >
                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="text-sm text-gray-600 dark:text-gray-300">filas</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="search" className="text-sm text-gray-600 dark:text-gray-300">Buscar:</label>
                        <input
                            id="search"
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="DNI o nombre"
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md w-64 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            <tr>
                                <th className="px-3 py-3 text-left font-semibold">N°</th>
                                <th className="px-3 py-3 text-left font-semibold">RED / MICRORED / ESTABLECIMIENTO</th>
                                <th className="px-3 py-3 text-left font-semibold">DNI / NOMBRE PROFESIONAL</th>
                                <th className="px-3 py-3 text-left font-semibold">PROFESIÓN</th>
                                <th className="px-3 py-3 text-center font-semibold">VISITA_1</th>
                                <th className="px-3 py-3 text-center font-semibold">VISITA_2</th>
                                <th className="px-3 py-3 text-center font-semibold">VISITA_3</th>
                                <th className="px-3 py-3 text-center font-semibold">VISITA_4</th>
                                <th className="px-3 py-3 text-center font-semibold">VISITA{'>'}4</th>
                                <th className="px-3 py-3 text-center font-semibold">VISITA_TA</th>
                                <th className="px-3 py-3 text-center font-semibold">TOTAL</th>
                                <th className="px-3 py-3 text-center font-semibold">ACCIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={12} className="px-3 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="text-gray-700 dark:text-gray-300">Cargando datos...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {error && !loading && (
                                <tr>
                                    <td colSpan={12} className="px-3 py-6 text-center">
                                        <div className="text-red-600 dark:text-red-400">{error}</div>
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && pagedData.length === 0 && (
                                <tr>
                                    <td colSpan={12} className="px-3 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-gray-500 dark:text-gray-400">Sin resultados. Ajusta los filtros e intenta de nuevo.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && pagedData.map((r, i) => (
                                <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-3 py-3 text-gray-800 dark:text-white">{(page - 1) * pageSize + i + 1}</td>
                                    <td className="px-3 py-3 text-gray-800 dark:text-white">
                                        <div className="flex flex-col text-xs">
                                            <span className="font-medium">{r.red}</span>
                                            <span className="text-gray-600 dark:text-gray-400">{r.microred}</span>
                                            <span className="text-gray-500 dark:text-gray-500">{r.establecimiento}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-gray-800 dark:text-white">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm font-medium">{r.dni}</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{r.profesional}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-gray-800 dark:text-white text-xs">{r.profesion}</td>
                                    <td className="px-3 py-3 text-center text-gray-800 dark:text-white">{r.visita_1}</td>
                                    <td className="px-3 py-3 text-center text-gray-800 dark:text-white">{r.visita_2}</td>
                                    <td className="px-3 py-3 text-center text-gray-800 dark:text-white">{r.visita_3}</td>
                                    <td className="px-3 py-3 text-center text-gray-800 dark:text-white">{r.visita_4}</td>
                                    <td className="px-3 py-3 text-center text-gray-800 dark:text-white">{r.visita_mas_4}</td>
                                    <td className="px-3 py-3 text-center text-gray-800 dark:text-white">{r.visita_ta}</td>
                                    <td className="px-3 py-3 text-center font-semibold text-gray-800 dark:text-white">{r.total}</td>
                                    <td className="px-3 py-3 text-center">
                                        <button
                                            onClick={() => exportRow(r)}
                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                                            title="Exportar fila"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Exportar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Info y paginación */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Mostrando <span className="font-semibold">{pagedData.length > 0 ? ((page - 1) * pageSize + 1) : 0}</span> hasta <span className="font-semibold">{Math.min(page * pageSize, data.length)}</span> de <span className="font-semibold">{data.length}</span> registros
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                        >
                            Primero
                        </button>
                        <button
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            &lt;&lt;
                        </button>
                        <span className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-blue-600 text-white font-medium">
                            {page}
                        </span>
                        <button
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            &gt;&gt;
                        </button>
                        <button
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                        >
                            Último
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
