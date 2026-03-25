import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
//import { redes } from '../../../../core/utils/accesories';
import { accessoriesService } from '../../../../settings/services/accessoriesService';
import type { microredes, establecimientos } from '../../../../settings/services/accessoriesService';

// ===== Helpers deterministas para SPR =====
type DosisKey = 'primera' | 'segunda' | 'sin_dosis';
type Nivel = 'bajo' | 'medio' | 'alto';

interface SprResumen {
    totalNiños: number;
    primera: number;
    segunda: number;
    sinDosis: number;
    cobertura1: number;
    cobertura2: number;
    pctSinDosis: number;
}

interface brechas {
    brecha1: number;
    brecha2: number;
}

interface SprMicroredRow {
    nro: number;
    microred: string;
    totalNiños: number;
    primera: number;
    pctPrimera: number;
    segunda: number;
    pctSegunda: number;
    sinDosis: number;
    pctSinDosis: number;
    estado: 'crítico' | 'alerta' | 'ok';
}

interface SprDataset {
    red: string;
    year: number;
    month: number;
    resumen: SprResumen;
    brech: brechas;
    microredes: SprMicroredRow[];
    dona: Record<DosisKey, number>;
    barras: { microred: string; primera: number; segunda: number; sinDosis: number }[];
}

const seedFrom = (red: string, year: number, month: number) =>
    [...red.toUpperCase()].reduce((a, c) => a + c.charCodeAt(0), 0) + (parseInt(String(year)) || 0) * 31 + (month || 0) * 97;

const rng = (seed: number) => {
    let s = seed >>> 0;
    return () => {
        s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
        return ((s >>> 0) % 10000) / 10000;
    };
};

const MICROREDES_POR_RED: Record<string, string[]> = {
    'CORONEL PORTILLO': ['SAN ALEJANDRO', 'AGUAYTIA'],
    'AGUAYTIA': ['AGUAYTIA', 'SAN ALEJANDRO'],
    'ATALAYA': ['ATALAYA NORTE', 'ATALAYA SUR'],
    'FEDERICO BASADRE': ['NESHUYA', 'CURIMANA'],
    'NO PERTENECE A NINGUNA RED': ['GENERAL'],
    '--': ['GENERAL']
};

const nivelFromMonth = (m: number): Nivel =>
    m === 1 || m === 2 ? 'bajo' : m <= 6 ? 'medio' : 'alto';

const range = (min: number, max: number, r: () => number) =>
    Math.round(min + (max - min) * r());

function generarSprDataset(red: string, year: number, month: number): SprDataset {
    const seed = seedFrom(red, year, month);
    const rand = rng(seed);
    const microreds = MICROREDES_POR_RED[red] ?? ['SAN ALEJANDRO', 'AGUAYTIA'];

    const nivel = nivelFromMonth(month);
    const baseVol = nivel === 'bajo' ? [250, 380] : nivel === 'medio' ? [350, 520] : [450, 700];

    const totales = microreds.map(() => range(baseVol[0], baseVol[1], rand));
    const totalNiños = totales.reduce((a, b) => a + b, 0);

    const perfiles = microreds.map(name => {
        if (name.includes('SAN ALEJ')) return { c1: 0.69 + rand() * 0.04, c2: 0.14 + rand() * 0.03 };
        if (name.includes('AGUAY')) return { c1: 0.58 + rand() * 0.04, c2: 0.08 + rand() * 0.03 };
        return { c1: 0.62 + rand() * 0.06, c2: 0.10 + rand() * 0.04 };
    });

    const filas: SprMicroredRow[] = microreds.map((mr, i) => {
        const total = totales[i];
        const { c1, c2 } = perfiles[i];
        const primera = Math.min(total, Math.round(total * c1));
        const segunda = Math.min(primera, Math.round(total * c2));
        const sinDosis = Math.max(0, total - primera);
        const pct1 = total ? Math.round((primera / total) * 1000) / 10 : 0;
        const pct2 = total ? Math.round((segunda / total) * 1000) / 10 : 0;
        const pctSin = total ? Math.round((sinDosis / total) * 1000) / 10 : 0;
        const estado: SprMicroredRow['estado'] =
            pctSin >= 35 ? 'crítico' : pctSin >= 20 ? 'alerta' : 'ok';
        return { nro: i + 1, microred: mr, totalNiños: total, primera, pctPrimera: pct1, segunda, pctSegunda: pct2, sinDosis, pctSinDosis: pctSin, estado };
    });

    const primeraTotal = filas.reduce((a, f) => a + f.primera, 0);
    const segundaTotal = filas.reduce((a, f) => a + f.segunda, 0);
    const sinDosisTotal = filas.reduce((a, f) => a + f.sinDosis, 0);

    const resumen: SprResumen = {
        totalNiños,
        primera: primeraTotal,
        segunda: segundaTotal,
        sinDosis: sinDosisTotal,
        cobertura1: totalNiños ? Math.round((primeraTotal / totalNiños) * 1000) / 10 : 0,
        cobertura2: totalNiños ? Math.round((segundaTotal / totalNiños) * 1000) / 10 : 0,
        pctSinDosis: totalNiños ? Math.round((sinDosisTotal / totalNiños) * 1000) / 10 : 0,
    };
    const brech: brechas = {
        brecha1: (totalNiños - primeraTotal),
        brecha2: (primeraTotal - segundaTotal)
    };

    const barras = filas.map(f => ({ microred: f.microred, primera: f.primera, segunda: f.segunda, sinDosis: f.sinDosis }));
    const dona: Record<DosisKey, number> = { primera: primeraTotal, segunda: segundaTotal, sin_dosis: sinDosisTotal };

    return { red, year, month, resumen, microredes: filas, dona, barras, brech };
}

// Datos de catálogo
const years = ['--', '2021', '2022', '2023', '2024', '2025', '2026'];
const months = [
    '--', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

export default function CoverturaVacuna() {
    const [selectedTab, setSelectedTab] = useState<'busqueda' | 'spr' | 'dengue'>('busqueda');

    // ===== ESTADOS PARA PESTAÑA "BUSQUEDA" =====
    const [busquedaYear, setBusquedaYear] = useState('--');
    const [busquedaMonth, setBusquedaMonth] = useState('--');
    const [busquedaRed, setBusquedaRed] = useState('');
    const [busquedaMicroRed, setBusquedaMicroRed] = useState('');
    const [busquedaEstablecimiento, setBusquedaEstablecimiento] = useState('');
    const [busquedaMicroredesOptions, setBusquedaMicroredesOptions] = useState<microredes[]>([]);
    const [busquedaEstablecimientosOptions, setBusquedaEstablecimientosOptions] = useState<establecimientos[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showTable, setShowTable] = useState(false);
    const [loadingBusqueda, setLoadingBusqueda] = useState(false);

    // ===== ESTADOS PARA PESTAÑA "SPR" =====
    const [sprYear, setSprYear] = useState('--');
    const [sprMonth, setSprMonth] = useState('--');
    const [sprRed, setSprRed] = useState('--');
    const [sprShowEstadist, setSprShowEstadist] = useState(false);
    const [sprShowDashboard, setSprShowDashboard] = useState(false);
    const [sprTotalNiños, setSprTotalNiños] = useState(0);
    const [sprIndicadoresPrimera, setSprIndicadoresPrimera] = useState(0);
    const [sprIndicadoresSegunda, setSprIndicadoresSegunda] = useState(0);
    const [sprIndicadoresSin, setSprIndicadoresSin] = useState(0);
    const [sprPorcentajeGeneral1, setSprPorcentajeGeneral1] = useState(0);
    const [sprPorcentajeGeneral2, setSprPorcentajeGeneral2] = useState(0);
    const [sprPorcentajeGeneral3, setSprPorcentajeGeneral3] = useState(0);
    const [sprBrecha1, setSprBrecha1] = useState(0);
    const [sprBrecha2, setSprBrecha2] = useState(0);
    const [sprDataset, setSprDataset] = useState<SprDataset | null>(null);
    const [loadingSPR, setLoadingSPR] = useState(false);

    // ===== ESTADOS PARA PESTAÑA "DENGUE" =====
    const [dengueYear, setDengueYear] = useState('--');
    const [dengueMonth, setDengueMonth] = useState('--');
    const [dengueRed, setDengueRed] = useState('--');
    const [dengueShowEstadist, setDengueShowEstadist] = useState(false);
    const [dengueShowDashboard, setDengueShowDashboard] = useState(false);
    const [dengueTotalNiños, setDengueTotalNiños] = useState(0);
    const [dengueIndicadoresPrimera, setDengueIndicadoresPrimera] = useState(0);
    const [dengueIndicadoresSegunda, setDengueIndicadoresSegunda] = useState(0);
    const [dengueIndicadoresSin, setDengueIndicadoresSin] = useState(0);
    const [denguePorcentajeGeneral1, setDenguePorcentajeGeneral1] = useState(0);
    const [denguePorcentajeGeneral2, setDenguePorcentajeGeneral2] = useState(0);
    const [denguePorcentajeGeneral3, setDenguePorcentajeGeneral3] = useState(0);
    const [dengueBrecha1, setDengueBrecha1] = useState(0);
    const [dengueBrecha2, setDengueBrecha2] = useState(0);
    const [dengueDataset, setDengueDataset] = useState<SprDataset | null>(null);
    const [loadingDengue, setLoadingDengue] = useState(false);

    // ===== ESTADO COMPARTIDO =====
    //const [redesOptions, setRedesOptions] = useState<string[]>([]);

    // ===== CARGAR REDES (COMPARTIDO) =====
    /*useEffect(() => {
        const loadRedes = () => {
            const redesList = redes.map(r => r.nombre_red);
            setRedesOptions(redesList);
        };
        loadRedes();
    }, []);*/

    // ===== EFECTOS PARA PESTAÑA "BUSQUEDA" =====
    useEffect(() => {
        const loadMicroredes = async () => {
            if (busquedaRed) {
                try {
                    const microredesData = await accessoriesService.getMicroredesByNombreRed(busquedaRed);
                    setBusquedaMicroredesOptions(microredesData);
                    setBusquedaMicroRed('');
                    setBusquedaEstablecimientosOptions([]);
                    setBusquedaEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando microredes (busqueda):', error);
                }
            } else {
                setBusquedaMicroredesOptions([]);
                setBusquedaMicroRed('');
                setBusquedaEstablecimientosOptions([]);
                setBusquedaEstablecimiento('');
            }
        };
        loadMicroredes();
    }, [busquedaRed]);

    useEffect(() => {
        const loadEstablecimientos = async () => {
            if (busquedaRed && busquedaMicroRed) {
                try {
                    const establecimientosData = await accessoriesService.getEstablecimientosByNombreRedMicroRed(busquedaRed, busquedaMicroRed);
                    setBusquedaEstablecimientosOptions(establecimientosData);
                    setBusquedaEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando establecimientos (busqueda):', error);
                }
            } else {
                setBusquedaEstablecimientosOptions([]);
                setBusquedaEstablecimiento('');
            }
        };
        loadEstablecimientos();
    }, [busquedaRed, busquedaMicroRed]);

    // ===== FUNCIONES DE BÚSQUEDA =====
    const handleBuscar = async () => {
        try {
            setLoadingBusqueda(true);
            setShowTable(false);

            const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
            const data: any[] = [];
            const isAllMicroreds = !busquedaMicroRed;
            const isAllEstablecimientos = !busquedaEstablecimiento;

            if (isAllMicroreds && isAllEstablecimientos) {
                busquedaMicroredesOptions.forEach((mr) => {
                    data.push({
                        red: busquedaRed || "--",
                        microred: mr.nom_microred,
                        establecimiento: "Todos",
                        bcg: Math.floor(Math.random() * 100),
                        hvb: Math.floor(Math.random() * 100),
                        rota2: Math.floor(Math.random() * 100),
                        ipv3: Math.floor(Math.random() * 100),
                        penta3: Math.floor(Math.random() * 100),
                        neuma3: Math.floor(Math.random() * 100),
                        spr1: Math.floor(Math.random() * 100),
                        var1: Math.floor(Math.random() * 100),
                        ama: Math.floor(Math.random() * 100),
                        spr2: Math.floor(Math.random() * 100),
                        dpt1ref: Math.floor(Math.random() * 100),
                        ipv1ref: Math.floor(Math.random() * 100),
                        infl: Math.floor(Math.random() * 100),
                        infl2: Math.floor(Math.random() * 100),
                        dpt2ref: Math.floor(Math.random() * 100),
                        apo2ref: Math.floor(Math.random() * 100),
                        vph1: Math.floor(Math.random() * 100),
                        vph2: Math.floor(Math.random() * 100),
                        dengue1: Math.floor(Math.random() * 100),
                        dengue2: Math.floor(Math.random() * 100),
                    });
                });
            } else if (!isAllMicroreds && isAllEstablecimientos) {
                busquedaEstablecimientosOptions.forEach((est) => {
                    data.push({
                        red: busquedaRed || "--",
                        microred: busquedaMicroRed,
                        establecimiento: est.nombre_establecimiento,
                        bcg: Math.floor(Math.random() * 100),
                        hvb: Math.floor(Math.random() * 100),
                        rota2: Math.floor(Math.random() * 100),
                        ipv3: Math.floor(Math.random() * 100),
                        penta3: Math.floor(Math.random() * 100),
                        neuma3: Math.floor(Math.random() * 100),
                        spr1: Math.floor(Math.random() * 100),
                        var1: Math.floor(Math.random() * 100),
                        ama: Math.floor(Math.random() * 100),
                        spr2: Math.floor(Math.random() * 100),
                        dpt1ref: Math.floor(Math.random() * 100),
                        ipv1ref: Math.floor(Math.random() * 100),
                        infl: Math.floor(Math.random() * 100),
                        infl2: Math.floor(Math.random() * 100),
                        dpt2ref: Math.floor(Math.random() * 100),
                        apo2ref: Math.floor(Math.random() * 100),
                        vph1: Math.floor(Math.random() * 100),
                        vph2: Math.floor(Math.random() * 100),
                        dengue1: Math.floor(Math.random() * 100),
                        dengue2: Math.floor(Math.random() * 100),
                    });
                });
            } else {
                data.push({
                    red: busquedaRed || "--",
                    microred: busquedaMicroRed,
                    establecimiento: busquedaEstablecimiento,
                    bcg: Math.floor(Math.random() * 100),
                    hvb: Math.floor(Math.random() * 100),
                    rota2: Math.floor(Math.random() * 100),
                    ipv3: Math.floor(Math.random() * 100),
                    penta3: Math.floor(Math.random() * 100),
                    neuma3: Math.floor(Math.random() * 100),
                    spr1: Math.floor(Math.random() * 100),
                    var1: Math.floor(Math.random() * 100),
                    ama: Math.floor(Math.random() * 100),
                    spr2: Math.floor(Math.random() * 100),
                    dpt1ref: Math.floor(Math.random() * 100),
                    ipv1ref: Math.floor(Math.random() * 100),
                    infl: Math.floor(Math.random() * 100),
                    infl2: Math.floor(Math.random() * 100),
                    dpt2ref: Math.floor(Math.random() * 100),
                    apo2ref: Math.floor(Math.random() * 100),
                    vph1: Math.floor(Math.random() * 100),
                    vph2: Math.floor(Math.random() * 100),
                    dengue1: Math.floor(Math.random() * 100),
                    dengue2: Math.floor(Math.random() * 100),
                });
            }

            await sleep(600);
            setSearchResults(data);
            setShowTable(true);
        } finally {
            setLoadingBusqueda(false);
        }
    };

    const handleExportar = () => {
        console.log("Exportando datos...", searchResults);
    };

    // ===== FUNCIÓN PARA SPR (con estados SPR) =====
    const handleBuscar2 = async () => {
        try {
            setLoadingSPR(true);
            setSprShowEstadist(false);
            setSprShowDashboard(false);

            if (!sprRed || sprRed === '--') {
                setSprTotalNiños(0);
                setSprIndicadoresPrimera(0);
                setSprIndicadoresSegunda(0);
                setSprIndicadoresSin(0);
                setSprPorcentajeGeneral1(0);
                setSprPorcentajeGeneral2(0);
                setSprPorcentajeGeneral3(0);
                setSprBrecha1(0);
                setSprBrecha2(0);
                setSprDataset(null);
                return;
            }

            const y = sprYear !== "--" ? parseInt(sprYear, 10) : 2025;
            const m = sprMonth !== "--" ? Math.max(1, months.indexOf(sprMonth)) : 9;

            const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
            await sleep(500);

            const ds = generarSprDataset(sprRed, y, m);
            setSprBrecha1(ds.brech.brecha1);
            setSprBrecha2(ds.brech.brecha2);
            setSprTotalNiños(ds.resumen.totalNiños);
            setSprIndicadoresPrimera(ds.resumen.primera);
            setSprPorcentajeGeneral1(Math.round(ds.resumen.cobertura1));
            setSprIndicadoresSegunda(ds.resumen.segunda);
            setSprPorcentajeGeneral2(Math.round(ds.resumen.cobertura2));
            setSprIndicadoresSin(ds.resumen.sinDosis);
            setSprPorcentajeGeneral3(Math.round(ds.resumen.pctSinDosis));
            setSprDataset(ds);

            setSprShowEstadist(true);
            setSprShowDashboard(true);
        } finally {
            setLoadingSPR(false);
        }
    };

    // ===== FUNCIÓN PARA DENGUE (con estados DENGUE) =====
    const generarDatos = async () => {
        try {
            setLoadingDengue(true);
            setDengueShowEstadist(false);
            setDengueShowDashboard(false);

            if (!dengueRed || dengueRed === '--') {
                setDengueTotalNiños(0);
                setDengueIndicadoresPrimera(0);
                setDengueIndicadoresSegunda(0);
                setDengueIndicadoresSin(0);
                setDenguePorcentajeGeneral1(0);
                setDenguePorcentajeGeneral2(0);
                setDenguePorcentajeGeneral3(0);
                setDengueBrecha1(0);
                setDengueBrecha2(0);
                setDengueDataset(null);
                return;
            }

            const y = dengueYear !== "--" ? parseInt(dengueYear, 10) : 2025;
            const m = dengueMonth !== "--" ? Math.max(1, months.indexOf(dengueMonth)) : 9;

            const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
            await sleep(500);

            const ds = generarSprDataset(dengueRed, y, m);
            setDengueBrecha1(ds.brech.brecha1);
            setDengueBrecha2(ds.brech.brecha2);
            setDengueTotalNiños(ds.resumen.totalNiños);
            setDengueIndicadoresPrimera(ds.resumen.primera);
            setDenguePorcentajeGeneral1(Math.round(ds.resumen.cobertura1));
            setDengueIndicadoresSegunda(ds.resumen.segunda);
            setDenguePorcentajeGeneral2(Math.round(ds.resumen.cobertura2));
            setDengueIndicadoresSin(ds.resumen.sinDosis);
            setDenguePorcentajeGeneral3(Math.round(ds.resumen.pctSinDosis));
            setDengueDataset(ds);

            setDengueShowEstadist(true);
            setDengueShowDashboard(true);
        } finally {
            setLoadingDengue(false);
        }
    };

    // Calculados para SPR (usa variables SPR)
    const sprR = 40;
    const sprC = 2 * Math.PI * sprR;
    const sprP1 = sprPorcentajeGeneral1;
    const sprP2 = sprPorcentajeGeneral2;
    const sprP3 = sprPorcentajeGeneral3;
    const sprA1 = (sprP1 / 100) * sprC;
    const sprA2 = (sprP2 / 100) * sprC;
    const sprA3 = (sprP3 / 100) * sprC;
    const sprOff1 = 0;
    const sprOff2 = sprA1;
    const sprOff3 = sprA1 + sprA2;

    // Calculados para DENGUE (usa variables DENGUE)
    const dengueR = 40;
    const dengueC = 2 * Math.PI * dengueR;
    const dengueP1 = denguePorcentajeGeneral1;
    const dengueP2 = denguePorcentajeGeneral2;
    const dengueP3 = denguePorcentajeGeneral3;
    const dengueA1 = (dengueP1 / 100) * dengueC;
    const dengueA2 = (dengueP2 / 100) * dengueC;
    const dengueA3 = (dengueP3 / 100) * dengueC;
    const dengueOff1 = 0;
    const dengueOff2 = dengueA1;
    const dengueOff3 = dengueA1 + dengueA2;


    return (
        <div className="space-y-6 bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans dark:bg-gray-800">

            {/* Header principal */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Fuente: HIS MINSA</h1>
                        <p className="text-blue-100">Actualizado al 22/09/2025 11:00:00</p>
                    </div>
                </div>
                <Link to="/home/reportes/generales" className="flex items-center justify-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg transition-colors duration-200 hover:bg-opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            {/* Contenedor principal de la aplicación */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Reporte de Cobertura de Vacuna Completa
                    </h2>
                </div>
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex space-x-0 rounded-lg" aria-label="Tabs">
                        {[
                            { id: 'busqueda', name: '🔍 Cobertura de Vacuna', active: selectedTab === 'busqueda' },
                            { id: 'spr', name: '💊 SPR', active: selectedTab === 'spr' },
                            { id: 'dengue', name: '🦠 Dengue', active: selectedTab === 'dengue' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as 'busqueda' | 'spr' | 'dengue')}
                                className={`
                                    tab-button
                                    px-6 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200
                                    ${tab.active
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }
                                `}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
                {/* ========================================= */}
                {/* PESTAÑA: COBERTURA DE VACUNA (BÚSQUEDA) */}
                {/* ========================================= */}
                {selectedTab === 'busqueda' && (
                    <div className="space-y-6 relative">
                        {/* Formulario de búsqueda */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    AÑO: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={busquedaYear}
                                    onChange={(e) => setBusquedaYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    MES:
                                </label>
                                <select
                                    value={busquedaMonth}
                                    onChange={(e) => setBusquedaMonth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    RED: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={busquedaRed}
                                    onChange={(e) => setBusquedaRed(e.target.value)}
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

                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    MICRORED:
                                </label>
                                <select
                                    value={busquedaMicroRed}
                                    onChange={(e) => setBusquedaMicroRed(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    disabled={!busquedaRed}
                                >
                                    <option value="">-- Todas las Microred --</option>
                                    {busquedaMicroredesOptions.map((microred) => (
                                        <option key={microred.nom_microred} value={microred.nom_microred}>
                                            {microred.nom_microred}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    ESTABLECIMIENTO:
                                </label>
                                <select
                                    value={busquedaEstablecimiento}
                                    onChange={(e) => setBusquedaEstablecimiento(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    disabled={!busquedaMicroRed}
                                >
                                    <option value="">-- Todos los Establecimientos --</option>
                                    {busquedaEstablecimientosOptions.map((establecimiento) => (
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
                                onClick={handleBuscar}
                                disabled={loadingBusqueda}
                                className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingBusqueda ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Buscar
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleExportar}
                                disabled={!showTable || searchResults.length === 0}
                                className="flex items-center px-6 py-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar
                            </button>
                        </div>

                        {/* Loading y tabla */}
                        <div className="relative">
                            {loadingBusqueda && (
                                <div className="absolute rounded-lg inset-0 bg-black/10 backdrop-blur-[1px] z-20 flex items-center justify-center">
                                    <div className="bg-white dark:bg-gray-800 rounded-md px-4 py-2 mt-40 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="text-1xl text-gray-700 dark:text-gray-300">Generando resultados…</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tabla de resultados */}
                            {showTable && searchResults.length > 0 && (
                                <div className="mt-8 overflow-x-auto shadow-md rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">Red</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Microred</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Establecimiento</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">BCG</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">HVB</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROTA 2</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IPV 3</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PENTA 3</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NEUMA 3</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SPR 1</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">VAR 1</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">AMA</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SPR 2</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DPT 1 REF</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IPV 1 REF</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">INFL</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">INFL 2</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DPT 2 REF</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">APO 2 REF</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">VPH 1</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">VPH 2</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DENGUE 1</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DENGUE 2</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {searchResults.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800">{row.red}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{row.microred}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{row.establecimiento}</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.bcg}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.hvb}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.rota2}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.ipv3}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.penta3}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.neuma3}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.spr1}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.var1}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.ama}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.spr2}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.dpt1ref}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.ipv1ref}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.infl}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.infl2}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.dpt2ref}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.apo2ref}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.vph1}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.vph2}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.dengue1}%</td>
                                                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-100">{row.dengue2}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Mensaje cuando no hay resultados */}
                            {showTable && searchResults.length === 0 && (
                                <div className="mt-8 text-center p-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-2 text-gray-500 dark:text-gray-300">No se encontraron resultados</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* ========================================= */}
                {/* PESTAÑA: SPR                             */}
                {/* ========================================= */}
                {selectedTab === 'spr' && (
                    <div className="space-y-6 relative">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
                            <h2 className="text-1xl font-semibold text-gray-800 dark:text-white">
                                Dashboard de Vacunación SPR (Sarampión, Paperas, Rubéola)
                            </h2>
                        </div>

                        {/* Formulario de búsqueda */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    RED: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={sprRed}
                                    onChange={(e) => setSprRed(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="--">--</option>
                                    {/*redesOptions.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))*/}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    AÑO:
                                </label>
                                <select
                                    value={sprYear}
                                    onChange={(e) => setSprYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    MES:
                                </label>
                                <select
                                    value={sprMonth}
                                    onChange={(e) => setSprMonth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={handleBuscar2}
                                disabled={loadingSPR}
                                className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingSPR ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Buscar
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleExportar}
                                disabled={!sprShowEstadist}
                                className="flex items-center px-6 py-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar
                            </button>
                        </div>

                        {/* Loading */}
                        <div className="relative">
                            {loadingSPR && (
                                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-lg">
                                    <div className="bg-white dark:bg-gray-800 rounded-md px-4 py-2 shadow">
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="text-1xl dark:text-white">Generando resultados…</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Estadísticas */}
                            {sprShowEstadist && (
                                <div>
                                    {/* Tarjetas de indicadores */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                                        {/* Total Niños */}
                                        <div className="bg-blue-600 dark:bg-blue-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-blue-600 dark:bg-blue-600 p-3 rounded-full">
                                                    <svg viewBox="0 0 24 24" color="white" className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <circle cx="7" cy="5.5" r="2.5" />
                                                        <circle cx="17" cy="5.5" r="2.5" />
                                                        <path d="M3 12l3-3h4l3 3" strokeLinecap="round" />
                                                        <path d="M21 12l-3-3h-4l-3 3" strokeLinecap="round" />
                                                        <path d="M6 12v6m2-6v6M16 12v6m2-6v6" strokeLinecap="round" />
                                                        <path d="M9 15h6" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">Total de Niños</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{sprTotalNiños}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 1ra Dosis */}
                                        <div className="bg-green-600 dark:bg-green-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-green-600 dark:bg-green-600 p-3 rounded-full">
                                                    <svg viewBox="0 0 24 24" color="white" className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <path d="M3 21l6-6" strokeLinecap="round" />
                                                        <path d="M12 12l6 6" strokeLinecap="round" />
                                                        <rect x="12.5" y="3.5" width="4" height="10" rx="1" transform="rotate(45 12.5 3.5)" />
                                                        <path d="M15.5 6.5l2-2M10 12l2 2M18 3l3 3" strokeLinecap="round" />
                                                        <path d="M7 17l2 2" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">1ra Dosis</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{sprIndicadoresPrimera}</p>
                                                    <p className="text-1xl text-white dark:text-white">{sprPorcentajeGeneral1}% sin cobertura</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2da Dosis */}
                                        <div className="bg-blue-400 dark:bg-blue-400 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-blue-400 dark:bg-blue-400 p-3 rounded-full">
                                                    <svg viewBox="0 0 24 24" color="white" className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <path d="M3 21l6-6" strokeLinecap="round" />
                                                        <path d="M12 12l6 6" strokeLinecap="round" />
                                                        <rect x="12.5" y="3.5" width="4" height="10" rx="1" transform="rotate(45 12.5 3.5)" />
                                                        <path d="M15.5 6.5l2-2M10 12l2 2M18 3l3 3" strokeLinecap="round" />
                                                        <path d="M7 17l2 2" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">2da Dosis</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{sprIndicadoresSegunda}</p>
                                                    <p className="text-1xl text-white dark:text-white">{sprPorcentajeGeneral2}% sin cobertura</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sin Dosis */}
                                        <div className="bg-red-600 dark:bg-red-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-14 h-14">
                                                    <path d="M12 2l7 3v6c0 5.25-3.5 8.81-7 11-3.5-2.19-7-5.75-7-11V5l7-3z" fill="#fefefe" />
                                                    <rect x="11" y="7" width="2" height="8" rx="1" fill="#f60c0c" />
                                                    <circle cx="12" cy="18" r="1.4" fill="#f60c0c" />
                                                </svg>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">Sin Dosis</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{sprIndicadoresSin}</p>
                                                    <p className="text-1xl text-white dark:text-white">{sprPorcentajeGeneral3}% sin vacunas</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brechas */}
                                    <div className="flex items-center justify-between gap-10 mb-4">
                                        <div className="w-full bg-blue-400 dark:bg-blue-400 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-blue-400 dark:bg-blue-400 p-3 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-14 h-14 text-white">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M12 15.75h.008v.008H12v-.008z" />
                                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">Primera Brecha de Dosis</p>
                                                    <p className="text-xl font-bold text-white dark:text-white">{sprBrecha1}</p>
                                                    <p className="text-1xl text-white dark:text-white">Niños por vacunar primera dosis</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full bg-blue-600 dark:bg-blue-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-blue-600 dark:bg-blue-600 p-3 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-14 h-14 text-white">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M12 15.75h.008v.008H12v-.008z" />
                                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">Segunda Brecha de Dosis</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{sprBrecha2}</p>
                                                    <p className="text-1xl text-white dark:text-white">Niños por vacunar segunda dosis</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard con gráficos */}
                                    {sprShowDashboard && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Gráfico de barras */}
                                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg text-gray-800 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600">
                                                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-1 mb-2">
                                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Avance de Vacunación SPR por Dosis</h2>
                                                </div>
                                                <HighchartsReact
                                                    highcharts={Highcharts}
                                                    options={{
                                                        chart: {
                                                            type: 'column',
                                                            backgroundColor: 'transparent',
                                                            spacingTop: 12,
                                                            spacingBottom: 12,
                                                        },
                                                        title: {
                                                            text: 'Vacunación SPR por Microred',
                                                            style: { color: '#5C7274', fontSize: '14px' }
                                                        },
                                                        xAxis: {
                                                            categories: sprDataset?.barras?.map(b => b.microred) ?? [],
                                                            title: null,
                                                            labels: { style: { color: '#5C7274' } },
                                                            lineColor: '#5C7274',
                                                            tickColor: '#5C7274'
                                                        },
                                                        yAxis: {
                                                            min: 0,
                                                            title: { text: undefined },
                                                            labels: { style: { color: '#5C7274' } },
                                                            gridLineColor: '#5C7274'
                                                        },
                                                        legend: {
                                                            align: 'center',
                                                            verticalAlign: 'top',
                                                            symbolRadius: 3,
                                                            itemStyle: { color: '#5C7274' }
                                                        },
                                                        tooltip: { enabled: true, shared: false },
                                                        plotOptions: {
                                                            column: {
                                                                grouping: true,
                                                                pointPadding: 0.08,
                                                                groupPadding: 0.16,
                                                                borderWidth: 0,
                                                                dataLabels: {
                                                                    enabled: true,
                                                                    style: { color: '#111827', fontSize: '10px' }
                                                                },
                                                                states: { hover: { enabled: false } }
                                                            },
                                                            series: {
                                                                states: {
                                                                    hover: { enabled: false },
                                                                    inactive: { opacity: 1 }
                                                                }
                                                            }
                                                        },
                                                        colors: ['#16a34a', '#38bdf8', '#ef4444'],
                                                        series: [
                                                            {
                                                                type: 'column',
                                                                name: '1ra Dosis',
                                                                data: sprDataset?.barras?.map(b => b.primera) ?? [],
                                                                states: { hover: { enabled: false } }
                                                            },
                                                            {
                                                                type: 'column',
                                                                name: '2da Dosis',
                                                                data: sprDataset?.barras?.map(b => b.segunda) ?? [],
                                                                states: { hover: { enabled: false } }
                                                            },
                                                            {
                                                                type: 'column',
                                                                name: 'Sin Dosis',
                                                                data: sprDataset?.barras?.map(b => b.sinDosis) ?? [],
                                                                states: { hover: { enabled: false } }
                                                            }
                                                        ],
                                                        credits: { enabled: false }
                                                    }}
                                                />
                                            </div>

                                            {/* Gráfico circular (Donut) */}
                                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                                                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-1 mb-2">
                                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Distribución de Vacunación</h2>
                                                </div>
                                                <div className="relative w-96 h-96 mx-auto mb-6">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        {/* Anillo base */}
                                                        <circle cx="50" cy="50" r={sprR} stroke="#e5e7eb" strokeWidth="20" fill="transparent" />
                                                        {/* 1ra dosis */}
                                                        <circle cx="50" cy="50" r={sprR} stroke="#16a34a" strokeWidth="20" fill="transparent" strokeDasharray={`${sprA1} ${sprC - sprA1}`} strokeDashoffset={-sprOff1} strokeLinecap="butt" />
                                                        {/* 2da dosis */}
                                                        <circle cx="50" cy="50" r={sprR} stroke="#38bdf8" strokeWidth="20" fill="transparent" strokeDasharray={`${sprA2} ${sprC - sprA2}`} strokeDashoffset={-sprOff2} strokeLinecap="butt" />
                                                        {/* Sin dosis */}
                                                        <circle cx="50" cy="50" r={sprR} stroke="#ef4444" strokeWidth="20" fill="transparent" strokeDasharray={`${sprA3} ${sprC - sprA3}`} strokeDashoffset={-sprOff3} strokeLinecap="butt" />
                                                    </svg>
                                                    {/* Centro */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{sprTotalNiños}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">Total de Niños</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Leyenda */}
                                                <div className="flex justify-center gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-3 bg-green-600 dark:bg-green-600 rounded"></div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">1ra Dosis</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-3 bg-blue-400 dark:bg-blue-400 rounded"></div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">2da Dosis</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-3 bg-red-600 rounded"></div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">Sin Dosis</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tabla de detalles por microred */}
                                    {sprDataset && (
                                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow mt-6">
                                            <div className="p-3 font-semibold text-gray-800 dark:text-white">Avance SPR por Microred</div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-800 dark:bg-white text-white dark:text-gray-800">
                                                            <th className="px-2 py-2 text-left">N°</th>
                                                            <th className="px-2 py-2 text-left">MICRORED</th>
                                                            <th className="px-2 py-2 text-center">TOTAL NIÑOS</th>
                                                            <th className="px-2 py-2 text-center">1ra DOSIS</th>
                                                            <th className="px-2 py-2 text-center">% 1ra</th>
                                                            <th className="px-2 py-2 text-center">2da DOSIS</th>
                                                            <th className="px-2 py-2 text-center">% 2da</th>
                                                            <th className="px-2 py-2 text-center">SIN DOSIS</th>
                                                            <th className="px-2 py-2 text-center">% SIN</th>
                                                            <th className="px-2 py-2 text-center">ESTADO</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sprDataset.microredes.map(r => (
                                                            <tr key={r.nro} className="border-t text-gray-800 dark:text-white">
                                                                <td className="px-2 py-2">{r.nro}</td>
                                                                <td className="px-2 py-2">{r.microred}</td>
                                                                <td className="px-2 py-2 text-center">{r.totalNiños}</td>
                                                                <td className="px-2 py-2 text-center">{r.primera}</td>
                                                                <td className="px-2 py-2 text-center">{r.pctPrimera}%</td>
                                                                <td className="px-2 py-2 text-center">{r.segunda}</td>
                                                                <td className="px-2 py-2 text-center">{r.pctSegunda}%</td>
                                                                <td className="px-2 py-2 text-center">{r.sinDosis}</td>
                                                                <td className="px-2 py-2 text-center">{r.pctSinDosis}%</td>
                                                                <td className="px-2 py-2 text-center">
                                                                    <span className={
                                                                        r.estado === 'crítico' ? 'bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs' :
                                                                            r.estado === 'alerta' ? 'bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs' :
                                                                                'bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs'
                                                                    }>
                                                                        {r.estado.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-slate-50 dark:bg-gray-700 border-t-2 border-slate-300 text-gray-800 dark:text-white">
                                                            <td className="px-2 py-2 text-center font-semibold text-slate-700 dark:text-white" colSpan={2}>TOTAL GENERAL</td>
                                                            <td className="px-2 py-2 text-center font-semibold text-slate-700 dark:text-white">{sprDataset.resumen.totalNiños.toLocaleString()}</td>
                                                            <td className="px-2 py-2 text-center text-emerald-600 font-semibold">{sprDataset.resumen.primera.toLocaleString()}</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs px-2 py-0.5 font-semibold">
                                                                    {sprDataset.resumen.cobertura1.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-sky-600 font-semibold">{sprDataset.resumen.segunda.toLocaleString()}</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-semibold ${sprDataset.resumen.cobertura2 < 60 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                                    }`}>
                                                                    {sprDataset.resumen.cobertura2.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-rose-600 font-semibold">{sprDataset.resumen.sinDosis.toLocaleString()}</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-semibold ${sprDataset.resumen.pctSinDosis >= 35 ? 'bg-rose-100 text-rose-700' :
                                                                    sprDataset.resumen.pctSinDosis >= 20 ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-emerald-100 text-emerald-700'
                                                                    }`}>
                                                                    {sprDataset.resumen.pctSinDosis.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-semibold ${sprDataset.resumen.pctSinDosis >= 35 ? 'bg-rose-600/10 text-rose-700' :
                                                                    sprDataset.resumen.pctSinDosis >= 20 ? 'bg-amber-600/10 text-amber-700' :
                                                                        'bg-emerald-600/10 text-emerald-700'
                                                                    }`}>
                                                                    {sprDataset.resumen.pctSinDosis >= 35 ? 'CRÍTICO' :
                                                                        sprDataset.resumen.pctSinDosis >= 20 ? 'ALERTA' : 'OK'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* ========================================= */}
                {/* PESTAÑA: DENGUE                          */}
                {/* ========================================= */}
                {selectedTab === 'dengue' && (
                    <div className="space-y-6 relative">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
                            <h2 className="text-1xl font-semibold text-gray-800 dark:text-white">
                                Dashboard de Vacunación Dengue
                            </h2>
                        </div>

                        {/* Formulario de búsqueda */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    RED: <span className="text-red-500">(*)</span>
                                </label>
                                <select
                                    value={dengueRed}
                                    onChange={(e) => setDengueRed(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="--">--</option>
                                    {/*redesOptions.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))*/}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    AÑO:
                                </label>
                                <select
                                    value={dengueYear}
                                    onChange={(e) => setDengueYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    MES:
                                </label>
                                <select
                                    value={dengueMonth}
                                    onChange={(e) => setDengueMonth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={generarDatos}
                                disabled={loadingDengue}
                                className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingDengue ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Buscar
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleExportar}
                                disabled={!dengueShowEstadist}
                                className="flex items-center px-6 py-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar
                            </button>
                        </div>

                        {/* Loading */}
                        <div className="relative">
                            {loadingDengue && (
                                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-lg">
                                    <div className="bg-white dark:bg-gray-800 rounded-md px-4 py-2 shadow">
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="text-1xl dark:text-white">Generando resultados…</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Estadísticas */}
                            {dengueShowEstadist && (
                                <div>
                                    {/* Tarjetas de indicadores */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                                        {/* Total Niños */}
                                        <div className="bg-purple-600 dark:bg-purple-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-purple-600 dark:bg-purple-600 p-3 rounded-full">
                                                    <svg viewBox="0 0 24 24" color="white" className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <circle cx="7" cy="5.5" r="2.5" />
                                                        <circle cx="17" cy="5.5" r="2.5" />
                                                        <path d="M3 12l3-3h4l3 3" strokeLinecap="round" />
                                                        <path d="M21 12l-3-3h-4l-3 3" strokeLinecap="round" />
                                                        <path d="M6 12v6m2-6v6M16 12v6m2-6v6" strokeLinecap="round" />
                                                        <path d="M9 15h6" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">Total de Niños</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{dengueTotalNiños}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 1ra Dosis */}
                                        <div className="bg-teal-600 dark:bg-teal-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-teal-600 dark:bg-teal-600 p-3 rounded-full">
                                                    <svg viewBox="0 0 24 24" color="white" className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <path d="M3 21l6-6" strokeLinecap="round" />
                                                        <path d="M12 12l6 6" strokeLinecap="round" />
                                                        <rect x="12.5" y="3.5" width="4" height="10" rx="1" transform="rotate(45 12.5 3.5)" />
                                                        <path d="M15.5 6.5l2-2M10 12l2 2M18 3l3 3" strokeLinecap="round" />
                                                        <path d="M7 17l2 2" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">1ra Dosis</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{dengueIndicadoresPrimera}</p>
                                                    <p className="text-1xl text-white dark:text-white">{denguePorcentajeGeneral1}% de cobertura</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2da Dosis */}
                                        <div className="bg-cyan-600 dark:bg-cyan-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-cyan-600 dark:bg-cyan-600 p-3 rounded-full">
                                                    <svg viewBox="0 0 24 24" color="white" className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                        <path d="M3 21l6-6" strokeLinecap="round" />
                                                        <path d="M12 12l6 6" strokeLinecap="round" />
                                                        <rect x="12.5" y="3.5" width="4" height="10" rx="1" transform="rotate(45 12.5 3.5)" />
                                                        <path d="M15.5 6.5l2-2M10 12l2 2M18 3l3 3" strokeLinecap="round" />
                                                        <path d="M7 17l2 2" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">2da Dosis</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{dengueIndicadoresSegunda}</p>
                                                    <p className="text-1xl text-white dark:text-white">{denguePorcentajeGeneral2}% de cobertura</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sin Dosis */}
                                        <div className="bg-orange-600 dark:bg-orange-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-14 h-14">
                                                    <path d="M12 2l7 3v6c0 5.25-3.5 8.81-7 11-3.5-2.19-7-5.75-7-11V5l7-3z" fill="#fefefe" />
                                                    <rect x="11" y="7" width="2" height="8" rx="1" fill="#f97316" />
                                                    <circle cx="12" cy="18" r="1.4" fill="#f97316" />
                                                </svg>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">Sin Dosis</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{dengueIndicadoresSin}</p>
                                                    <p className="text-1xl text-white dark:text-white">{denguePorcentajeGeneral3}% sin vacunas</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brechas */}
                                    <div className="flex items-center justify-between gap-10 mb-4">
                                        <div className="w-full bg-cyan-600 dark:bg-cyan-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-cyan-600 dark:bg-cyan-600 p-3 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-14 h-14 text-white">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M12 15.75h.008v.008H12v-.008z" />
                                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">Primera Brecha de Dosis</p>
                                                    <p className="text-xl font-bold text-white dark:text-white">{dengueBrecha1}</p>
                                                    <p className="text-1xl text-white dark:text-white">Niños por vacunar primera dosis</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full bg-purple-600 dark:bg-purple-600 rounded-xl shadow-lg p-6">
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="bg-purple-600 dark:bg-purple-600 p-3 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-14 h-14 text-white">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M12 15.75h.008v.008H12v-.008z" />
                                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-1xl text-white dark:text-white">Segunda Brecha de Dosis</p>
                                                    <p className="text-2xl font-bold text-white dark:text-white">{dengueBrecha2}</p>
                                                    <p className="text-1xl text-white dark:text-white">Niños por vacunar segunda dosis</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard con gráficos */}
                                    {dengueShowDashboard && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Gráfico de barras */}
                                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg text-gray-800 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600">
                                                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-1 mb-2">
                                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Avance de Vacunación Dengue por Dosis</h2>
                                                </div>
                                                <HighchartsReact
                                                    highcharts={Highcharts}
                                                    options={{
                                                        chart: {
                                                            type: 'column',
                                                            backgroundColor: 'transparent',
                                                            spacingTop: 12,
                                                            spacingBottom: 12,
                                                        },
                                                        title: {
                                                            text: 'Vacunación Dengue por Microred',
                                                            style: { color: '#5C7274', fontSize: '14px' }
                                                        },
                                                        xAxis: {
                                                            categories: dengueDataset?.barras?.map(b => b.microred) ?? [],
                                                            title: null,
                                                            labels: { style: { color: '#5C7274' } },
                                                            lineColor: '#5C7274',
                                                            tickColor: '#5C7274'
                                                        },
                                                        yAxis: {
                                                            min: 0,
                                                            title: { text: undefined },
                                                            labels: { style: { color: '#5C7274' } },
                                                            gridLineColor: '#5C7274'
                                                        },
                                                        legend: {
                                                            align: 'center',
                                                            verticalAlign: 'top',
                                                            symbolRadius: 3,
                                                            itemStyle: { color: '#5C7274' }
                                                        },
                                                        tooltip: { enabled: true, shared: false },
                                                        plotOptions: {
                                                            column: {
                                                                grouping: true,
                                                                pointPadding: 0.08,
                                                                groupPadding: 0.16,
                                                                borderWidth: 0,
                                                                dataLabels: {
                                                                    enabled: true,
                                                                    style: { color: '#111827', fontSize: '10px' }
                                                                },
                                                                states: { hover: { enabled: false } }
                                                            },
                                                            series: {
                                                                states: {
                                                                    hover: { enabled: false },
                                                                    inactive: { opacity: 1 }
                                                                }
                                                            }
                                                        },
                                                        colors: ['#14b8a6', '#06b6d4', '#f97316'],
                                                        series: [
                                                            {
                                                                type: 'column',
                                                                name: '1ra Dosis',
                                                                data: dengueDataset?.barras?.map(b => b.primera) ?? [],
                                                                states: { hover: { enabled: false } }
                                                            },
                                                            {
                                                                type: 'column',
                                                                name: '2da Dosis',
                                                                data: dengueDataset?.barras?.map(b => b.segunda) ?? [],
                                                                states: { hover: { enabled: false } }
                                                            },
                                                            {
                                                                type: 'column',
                                                                name: 'Sin Dosis',
                                                                data: dengueDataset?.barras?.map(b => b.sinDosis) ?? [],
                                                                states: { hover: { enabled: false } }
                                                            }
                                                        ],
                                                        credits: { enabled: false }
                                                    }}
                                                />
                                            </div>

                                            {/* Gráfico circular (Donut) */}
                                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                                                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-1 mb-2">
                                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Distribución de Vacunación Dengue</h2>
                                                </div>
                                                <div className="relative w-96 h-96 mx-auto mb-6">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        {/* Anillo base */}
                                                        <circle cx="50" cy="50" r={dengueR} stroke="#e5e7eb" strokeWidth="20" fill="transparent" />
                                                        {/* 1ra dosis */}
                                                        <circle cx="50" cy="50" r={dengueR} stroke="#14b8a6" strokeWidth="20" fill="transparent" strokeDasharray={`${dengueA1} ${dengueC - dengueA1}`} strokeDashoffset={-dengueOff1} strokeLinecap="butt" />
                                                        {/* 2da dosis */}
                                                        <circle cx="50" cy="50" r={dengueR} stroke="#06b6d4" strokeWidth="20" fill="transparent" strokeDasharray={`${dengueA2} ${dengueC - dengueA2}`} strokeDashoffset={-dengueOff2} strokeLinecap="butt" />
                                                        {/* Sin dosis */}
                                                        <circle cx="50" cy="50" r={dengueR} stroke="#f97316" strokeWidth="20" fill="transparent" strokeDasharray={`${dengueA3} ${dengueC - dengueA3}`} strokeDashoffset={-dengueOff3} strokeLinecap="butt" />
                                                    </svg>
                                                    {/* Centro */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dengueTotalNiños}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">Total de Niños</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Leyenda */}
                                                <div className="flex justify-center gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-3 bg-teal-600 dark:bg-teal-600 rounded"></div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">1ra Dosis</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-3 bg-cyan-600 dark:bg-cyan-600 rounded"></div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">2da Dosis</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-3 bg-orange-600 rounded"></div>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">Sin Dosis</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tabla de detalles por microred */}
                                    {dengueDataset && (
                                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow mt-6">
                                            <div className="p-3 font-semibold text-gray-800 dark:text-white">Avance Dengue por Microred</div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-800 dark:bg-white text-white dark:text-gray-800">
                                                            <th className="px-2 py-2 text-left">N°</th>
                                                            <th className="px-2 py-2 text-left">MICRORED</th>
                                                            <th className="px-2 py-2 text-center">TOTAL NIÑOS</th>
                                                            <th className="px-2 py-2 text-center">1ra DOSIS</th>
                                                            <th className="px-2 py-2 text-center">% 1ra</th>
                                                            <th className="px-2 py-2 text-center">2da DOSIS</th>
                                                            <th className="px-2 py-2 text-center">% 2da</th>
                                                            <th className="px-2 py-2 text-center">SIN DOSIS</th>
                                                            <th className="px-2 py-2 text-center">% SIN</th>
                                                            <th className="px-2 py-2 text-center">ESTADO</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dengueDataset.microredes.map(r => (
                                                            <tr key={r.nro} className="border-t text-gray-800 dark:text-white">
                                                                <td className="px-2 py-2">{r.nro}</td>
                                                                <td className="px-2 py-2">{r.microred}</td>
                                                                <td className="px-2 py-2 text-center">{r.totalNiños}</td>
                                                                <td className="px-2 py-2 text-center">{r.primera}</td>
                                                                <td className="px-2 py-2 text-center">{r.pctPrimera}%</td>
                                                                <td className="px-2 py-2 text-center">{r.segunda}</td>
                                                                <td className="px-2 py-2 text-center">{r.pctSegunda}%</td>
                                                                <td className="px-2 py-2 text-center">{r.sinDosis}</td>
                                                                <td className="px-2 py-2 text-center">{r.pctSinDosis}%</td>
                                                                <td className="px-2 py-2 text-center">
                                                                    <span className={
                                                                        r.estado === 'crítico' ? 'bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs' :
                                                                            r.estado === 'alerta' ? 'bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs' :
                                                                                'bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs'
                                                                    }>
                                                                        {r.estado.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-slate-50 dark:bg-gray-700 border-t-2 border-slate-300 text-gray-800 dark:text-white">
                                                            <td className="px-2 py-2 text-center font-semibold text-slate-700 dark:text-white" colSpan={2}>TOTAL GENERAL</td>
                                                            <td className="px-2 py-2 text-center font-semibold text-slate-700 dark:text-white">{dengueDataset.resumen.totalNiños.toLocaleString()}</td>
                                                            <td className="px-2 py-2 text-center text-emerald-600 font-semibold">{dengueDataset.resumen.primera.toLocaleString()}</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs px-2 py-0.5 font-semibold">
                                                                    {dengueDataset.resumen.cobertura1.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-sky-600 font-semibold">{dengueDataset.resumen.segunda.toLocaleString()}</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-semibold ${dengueDataset.resumen.cobertura2 < 60 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                                    }`}>
                                                                    {dengueDataset.resumen.cobertura2.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center text-rose-600 font-semibold">{dengueDataset.resumen.sinDosis.toLocaleString()}</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-semibold ${dengueDataset.resumen.pctSinDosis >= 35 ? 'bg-rose-100 text-rose-700' :
                                                                        dengueDataset.resumen.pctSinDosis >= 20 ? 'bg-amber-100 text-amber-700' :
                                                                            'bg-emerald-100 text-emerald-700'
                                                                    }`}>
                                                                    {dengueDataset.resumen.pctSinDosis.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-semibold ${dengueDataset.resumen.pctSinDosis >= 35 ? 'bg-rose-600/10 text-rose-700' :
                                                                        dengueDataset.resumen.pctSinDosis >= 20 ? 'bg-amber-600/10 text-amber-700' :
                                                                            'bg-emerald-600/10 text-emerald-700'
                                                                    }`}>
                                                                    {dengueDataset.resumen.pctSinDosis >= 35 ? 'CRÍTICO' :
                                                                        dengueDataset.resumen.pctSinDosis >= 20 ? 'ALERTA' : 'OK'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
