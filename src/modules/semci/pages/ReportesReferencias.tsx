import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//import { redes } from '../../../core/utils/accesories';
import { accessoriesService } from '../../settings/services/accessoriesService';
import type { microredes } from '../../settings/services/accessoriesService';
import { useBackToApp } from '../../../core/hooks/useBackToApp';

type Filtros = {
    año: string;
    mes: string;
    red: string;
    microred: string;
};

type OrigenRow = {
    ipressOrigen: string;
    consultaExterna: number;
    diagnosticoImagenes: number;
    emergencia: number;
};
type DestinoRow = {
    ipressDestino: string;
    consultaExterna: number;
    diagnosticoImagenes: number;
    emergencia: number;
};
type CondicionRow = {
    ipressOrigen: string;
    aceptado: number;
    anulado: number;
    contrarreferido: number;
    observado: number;
    pacienteCitado: number;
    pacienteRecibido: number;
    pendiente: number;
    rechazado: number;
    registrado: number;
};
type EspecialidadRow = {
    especialidad: string;
    consultaExterna: number;
    diagnosticoImagenes: number;
    emergencia: number;
};

export default function ReportesReferencias() {
    const backLink = useBackToApp();
    // Filtros controlados
    const [selectedYear, setSelectedYear] = useState('-- Seleccionar Año --');
    const [selectedMonth, setSelectedMonth] = useState('-- Seleccionar Mes --');
    const [selectedRed, setSelectedRed] = useState('');
    const [selectedMicroRed, setSelectedMicroRed] = useState('');

    // Estado de generación y pestañas
    const [isGenerating, setIsGenerating] = useState(false);
    const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros | null>(null);
    const [tab, setTab] = useState<'origenDestino' | 'condicion' | 'especialidades'>('origenDestino');

    // Estados para opciones dinámicas
    //const [redesOptions, setRedesOptions] = useState<string[]>([]);
    const [microredesOptions, setMicroredesOptions] = useState<microredes[]>([]);

    // Catálogos estáticos
    const years = ['-- Seleccionar Año --', '2021', '2022', '2023', '2024', '2025', '2026'];
    const months = [
        '-- Seleccionar Mes --',
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE',
    ];

    // Cargar redes al montar el componente
    /*useEffect(() => {
        const loadRedes = () => {
            const redesList = redes.map(r => r.nombre_red);
            setRedesOptions(redesList);
        };
        loadRedes();
    }, []);*/

    // Cargar microredes cuando cambia la red seleccionada
    useEffect(() => {
        const loadMicroredes = async () => {
            if (selectedRed) {
                try {
                    const microredesData = await accessoriesService.getMicroredesByNombreRed(selectedRed);
                    setMicroredesOptions(microredesData);
                    setSelectedMicroRed(''); // Reset microred
                } catch (error) {
                    console.error('Error cargando microredes:', error);
                }
            } else {
                setMicroredesOptions([]);
                setSelectedMicroRed('');
            }
        };
        loadMicroredes();
    }, [selectedRed]);

    // Handler principal
    const handleGenerateReport = async () => {
        setIsGenerating(true);

        // Aquí se puede agregar para llamar a tu API con los filtros:
        await new Promise((r) => setTimeout(r, 900)); // simulación

        const año = selectedYear;
        const mes = selectedMonth;
        const red = selectedRed;
        const microred = selectedMicroRed;

        setFiltrosAplicados({ año, mes, red, microred });
        setIsGenerating(false);
    };

    // Datos mock: reemplaza estos selectores por los datos de tu API usando filtrosAplicados
    const datosOrigen = useMemo<OrigenRow[]>(() => {
        // Ejemplo: puedes condicionar por filtrosAplicados para variar mock
        return [
            { ipressOrigen: 'SAN FERNANDO', consultaExterna: 143, diagnosticoImagenes: 17, emergencia: 21 },
            { ipressOrigen: '7 DE JUNIO', consultaExterna: 142, diagnosticoImagenes: 2, emergencia: 1 },
            { ipressOrigen: 'MANANTAY', consultaExterna: 87, diagnosticoImagenes: 4, emergencia: 3 },
            { ipressOrigen: 'LUZ Y PAZ', consultaExterna: 53, diagnosticoImagenes: 0, emergencia: 0 },
            { ipressOrigen: 'NUEVO SAN JUAN', consultaExterna: 8, diagnosticoImagenes: 0, emergencia: 0 },
            { ipressOrigen: 'PUCALLPILLO', consultaExterna: 2, diagnosticoImagenes: 0, emergencia: 0 },
        ];
    }, [filtrosAplicados]);

    const datosDestino = useMemo<DestinoRow[]>(() => {
        return [
            { ipressDestino: 'HOSPITAL REGIONAL DE PUCALLPA', consultaExterna: 358, diagnosticoImagenes: 16, emergencia: 25 },
            { ipressDestino: 'HOSPITAL AMAZONICO - YARINACOCHA', consultaExterna: 73, diagnosticoImagenes: 7, emergencia: 0 },
            { ipressDestino: '9 DE OCTUBRE', consultaExterna: 2, diagnosticoImagenes: 0, emergencia: 0 },
            { ipressDestino: 'CENTRO DE SALUD MENTAL COMUNITARIO UNIVERSITARIO MAYUSHIN', consultaExterna: 1, diagnosticoImagenes: 0, emergencia: 0 },
            { ipressDestino: 'HOSPITAL REGIONAL DOCENTE LAS MERCEDES', consultaExterna: 1, diagnosticoImagenes: 0, emergencia: 0 },
        ];
    }, [filtrosAplicados]);

    const datosCondicion = useMemo<CondicionRow[]>(() => {
        return [
            { ipressOrigen: 'SAN FERNANDO', aceptado: 4, anulado: 28, contrarreferido: 75, observado: 2, pacienteCitado: 0, pacienteRecibido: 0, pendiente: 0, rechazado: 14, registrado: 0 },
            { ipressOrigen: '7 DE JUNIO', aceptado: 0, anulado: 8, contrarreferido: 49, observado: 0, pacienteCitado: 2, pacienteRecibido: 0, pendiente: 0, rechazado: 7, registrado: 0 },
            { ipressOrigen: 'MANANTAY', aceptado: 0, anulado: 4, contrarreferido: 47, observado: 0, pacienteCitado: 0, pacienteRecibido: 0, pendiente: 0, rechazado: 3, registrado: 0 },
            { ipressOrigen: 'LUZ Y PAZ', aceptado: 0, anulado: 4, contrarreferido: 22, observado: 1, pacienteCitado: 0, pacienteRecibido: 0, pendiente: 0, rechazado: 2, registrado: 0 },
            { ipressOrigen: 'NUEVO SAN JUAN', aceptado: 0, anulado: 1, contrarreferido: 1, observado: 1, pacienteCitado: 0, pacienteRecibido: 0, pendiente: 0, rechazado: 1, registrado: 0 },
            { ipressOrigen: 'PUCALLPILLO', aceptado: 0, anulado: 0, contrarreferido: 1, observado: 0, pacienteCitado: 0, pacienteRecibido: 0, pendiente: 0, rechazado: 1, registrado: 0 },
        ];
    }, [filtrosAplicados]);

    const datosEspecialidades = useMemo<EspecialidadRow[]>(() => {
        return [
            { especialidad: 'GINECOLOGÍA Y OBSTETRICIA', consultaExterna: 83, diagnosticoImagenes: 0, emergencia: 16 },
            { especialidad: 'CIRUGÍA GENERAL', consultaExterna: 42, diagnosticoImagenes: 0, emergencia: 1 },
            { especialidad: 'NEUROLOGÍA', consultaExterna: 30, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'CARDIOLOGÍA', consultaExterna: 29, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'PEDIATRÍA', consultaExterna: 25, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'ORTOPEDIA Y TRAUMATOLOGÍA', consultaExterna: 25, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'OFTALMOLOGÍA', consultaExterna: 24, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'GASTROENTEROLOGÍA', consultaExterna: 22, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'MEDICINA INTERNA', consultaExterna: 22, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'UROLOGÍA', consultaExterna: 22, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'RADIODIAGNÓSTICO', consultaExterna: 1, diagnosticoImagenes: 13, emergencia: 0 },
            { especialidad: 'NEUMOLOGÍA', consultaExterna: 13, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'ENFERMEDADES INFECCIOSAS Y TROPICALES', consultaExterna: 13, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'RADIOLOGÍA', consultaExterna: 2, diagnosticoImagenes: 10, emergencia: 0 },
            { especialidad: 'OTORRINOLARINGOLOGÍA', consultaExterna: 10, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'DERMATOLOGÍA', consultaExterna: 10, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'CIRUGÍA DE CABEZA Y CUELLO', consultaExterna: 8, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'REUMATOLOGÍA', consultaExterna: 7, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'MEDICINA GENERAL Y ONCOLÓGICA ', consultaExterna: 1, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'CIRUGÍA TORACCICA Y CARDIOVASCULAR', consultaExterna: 6, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'ODONTOPEDRIATÍA', consultaExterna: 6, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'ENDOCRINOLOGÍA', consultaExterna: 5, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'TERAPIA FÍSICA Y REHABILITACIÓN', consultaExterna: 5, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'LABORATORIO CLÍNICO', consultaExterna: 4, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'ODONTOLOGIA', consultaExterna: 4, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'ONCOLOGÍA MÉDICA', consultaExterna: 3, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'MEDICINA FÍSICA Y REHABILITACIÓN', consultaExterna: 3, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'NEFROLOGÍA', consultaExterna: 3, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'NEUROCIRUGÍA', consultaExterna: 3, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'NO APLICA', consultaExterna: 0, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'PSIQUIATRÍA', consultaExterna: 2, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'CIRUGÍA PEDIÁTRICA', consultaExterna: 1, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'MEDICINA LEGAL', consultaExterna: 0, diagnosticoImagenes: 0, emergencia: 0 },
            { especialidad: 'INFECTOLOGÍA PEDIÁTRICA', consultaExterna: 1, diagnosticoImagenes: 0, emergencia: 0 },
        ];
    }, [filtrosAplicados]);

    // Helpers de totales
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const totalOrigen = useMemo(() => {
        const ce = sum(datosOrigen.map(d => d.consultaExterna));
        const di = sum(datosOrigen.map(d => d.diagnosticoImagenes));
        const em = sum(datosOrigen.map(d => d.emergencia));
        return { ce, di, em, total: ce + di + em };
    }, [datosOrigen]);
    const totalDestino = useMemo(() => {
        const ce = sum(datosDestino.map(d => d.consultaExterna));
        const di = sum(datosDestino.map(d => d.diagnosticoImagenes));
        const em = sum(datosDestino.map(d => d.emergencia));
        return { ce, di, em, total: ce + di + em };
    }, [datosDestino]);
    const totalCondicion = useMemo(() => {
        const t = {
            aceptado: sum(datosCondicion.map(d => d.aceptado)),
            anulado: sum(datosCondicion.map(d => d.anulado)),
            contrarreferido: sum(datosCondicion.map(d => d.contrarreferido)),
            observado: sum(datosCondicion.map(d => d.observado)),
            pacienteCitado: sum(datosCondicion.map(d => d.pacienteCitado)),
            pacienteRecibido: sum(datosCondicion.map(d => d.pacienteRecibido)),
            pendiente: sum(datosCondicion.map(d => d.pendiente)),
            rechazado: sum(datosCondicion.map(d => d.rechazado)),
            registrado: sum(datosCondicion.map(d => d.registrado)),
        };
        const total = Object.values(t).reduce((a, b) => a + b, 0);
        return { ...t, total };
    }, [datosCondicion]);
    const totalEspecialidades = useMemo(() => {
        const ce = sum(datosEspecialidades.map(d => d.consultaExterna));
        const di = sum(datosEspecialidades.map(d => d.diagnosticoImagenes));
        const em = sum(datosEspecialidades.map(d => d.emergencia));
        return { ce, di, em, total: ce + di + em };
    }, [datosEspecialidades]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <svg className="w-10 h-10 mx-auto " fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='white'>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">REPORTE REFERENCIA</h1>
                            <p className="text-blue-100">Sistema de Referencias y Contrarreferencias</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center justify-between">
                        <Link to={backLink} className=" text-white hover:text-gray-300 transition-colors duration-200">
                            <div className="items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg mb-8">
                <h2 className="flex items-center gap-2 text-1xl font-semibold text-gray-800 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 3H2l7 9v7l6 3V12l7-9z" />
                    </svg>
                    Filtro de Referencia
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mt-4">
                    {/* Año */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            AÑO:
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mes */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            MES:
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {months.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Red - AHORA DINÁMICO */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            RED:
                        </label>
                        <select
                            value={selectedRed}
                            onChange={(e) => setSelectedRed(e.target.value)}
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

                    {/* Microred - AHORA DINÁMICO */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            MICRORED:
                        </label>
                        <select
                            value={selectedMicroRed}
                            onChange={(e) => setSelectedMicroRed(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={!selectedRed}
                        >
                            <option value="">-- Todas las Microred --</option>
                            {microredesOptions.map((microred) => (
                                <option key={microred.nom_microred} value={microred.nom_microred}>
                                    {microred.nom_microred}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-start">
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Generando...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                                </svg>
                                Generar Reporte
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Resultados del reporte */}
            {filtrosAplicados && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultados del Reporte de Referencias</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Filtros: {filtrosAplicados.año} • {filtrosAplicados.mes} • {filtrosAplicados.red} • {filtrosAplicados.microred}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() => setTab('origenDestino')}
                            className={`px-3 py-2 rounded-md text-sm ${tab === 'origenDestino' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                        >
                            Referencias por Origen y Destino
                        </button>
                        <button
                            onClick={() => setTab('condicion')}
                            className={`px-3 py-2 rounded-md text-sm ${tab === 'condicion' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                        >
                            Condición de Referencias
                        </button>
                        <button
                            onClick={() => setTab('especialidades')}
                            className={`px-3 py-2 rounded-md text-sm ${tab === 'especialidades' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                        >
                            Referencias por Especialidades
                        </button>
                    </div>

                    {/* Contenido de tabs */}
                    {tab === 'origenDestino' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Origen */}
                            <div>
                                <div className="overflow-auto rounded-lg border border-gray-400 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <caption className="text-center border border-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-2 font-semibold text-gray-900 dark:text-white">
                                            Referencias Emitidas por Punto de Origen
                                        </caption>
                                        <thead className="bg-gray-200 border border-gray-400 dark:bg-gray-700">
                                            <tr className="text-xs border border-gray-400 uppercase text-gray-600 dark:text-gray-200">
                                                <th className="px-3 py-2 border border-gray-400 text-left">N°</th>
                                                <th className="px-3 py-2 border border-gray-400 text-left">IPRESS ORIGEN</th>
                                                <th className="px-3 py-2 border border-gray-400 text-right">CONSULTA EXTERNA</th>
                                                <th className="px-3 py-2 border border-gray-400 text-right">DIAGNÓSTICO POR IMÁGENES</th>
                                                <th className="px-3 py-2 border border-gray-400 text-right">EMERGENCIA</th>
                                                <th className="px-3 py-2 border border-gray-400 text-right">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {datosOrigen.map((r, idx) => {
                                                const total = r.consultaExterna + r.diagnosticoImagenes + r.emergencia;
                                                return (
                                                    <tr key={r.ipressOrigen} className="text-sm text-gray-800 dark:text-gray-100">
                                                        <td className="px-3 py-2 border border-gray-400">{idx + 1}</td>
                                                        <td className="px-3 py-2 border border-gray-400">{r.ipressOrigen}</td>
                                                        <td className="px-3 py-2 border border-gray-400 text-right">{r.consultaExterna}</td>
                                                        <td className="px-3 py-2 border border-gray-400 text-right">{r.diagnosticoImagenes}</td>
                                                        <td className="px-3 py-2 border border-gray-400 text-right">{r.emergencia}</td>
                                                        <td className="px-3 py-2 border border-gray-400 text-right">{total}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700 text-sm font-semibold ">
                                            <tr className="text-gray-900 dark:text-white">
                                                <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700" colSpan={2}>
                                                    TOTAL
                                                </td>
                                                <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalOrigen.ce}</td>
                                                <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalOrigen.di}</td>
                                                <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalOrigen.em}</td>
                                                <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalOrigen.total}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Destino */}
                            <div>
                                <div className="overflow-auto rounded-lg border border-gray-400 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <caption className="text-center border border-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-2 font-semibold text-gray-900 dark:text-white">
                                            Referencias Emitidas al Punto de Destino
                                        </caption>
                                        <thead className="bg-gray-200 border border-gray-400 dark:bg-gray-700">
                                            <tr className="text-xs border border-gray-400 uppercase text-gray-600 dark:text-gray-200">
                                                <th className="px-3 py-2 border border-gray-400 text-left">N°</th>
                                                <th className="px-3 py-2 border border-gray-400 text-left">IPRESS DESTINO</th>
                                                <th className="px-3 py-2 border border-gray-400 text-right">CONSULTA EXTERNA</th>
                                                <th className="px-3 py-2 border border-gray-400 text-right">DIAGNÓSTICO POR IMÁGENES</th>
                                                <th className="px-3 py-2 border border-gray-400 text-right">EMERGENCIA</th>
                                                <th className="px-3 py-2 border border-gray-400 text-right">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {datosDestino.map((r, idx) => {
                                                const total = r.consultaExterna + r.diagnosticoImagenes + r.emergencia;
                                                return (
                                                    <tr key={r.ipressDestino} className="text-sm text-gray-800 dark:text-gray-100">
                                                        <td className="px-3 py-2 border border-gray-400">{idx + 1}</td>
                                                        <td className="px-3 py-2 border border-gray-400">{r.ipressDestino}</td>
                                                        <td className="px-3 py-2 border border-gray-400 text-right">{r.consultaExterna}</td>
                                                        <td className="px-3 py-2 border border-gray-400 text-right">{r.diagnosticoImagenes}</td>
                                                        <td className="px-3 py-2 border border-gray-400 text-right">{r.emergencia}</td>
                                                        <td className="px-3 py-2 border border-gray-400 text-right">{total}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700 text-sm font-semibold">
                                            <tr className="text-gray-900 dark:text-white">
                                                <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700" colSpan={2}>
                                                    TOTAL
                                                </td>
                                                <td className="px-3 py-2 text-right bg-gray-200 dark:bg-gray-700 border border-gray-400">{totalDestino.ce}</td>
                                                <td className="px-3 py-2 text-right bg-gray-200 dark:bg-gray-700 border border-gray-400">{totalDestino.di}</td>
                                                <td className="px-3 py-2 text-right bg-gray-200 dark:bg-gray-700 border border-gray-400">{totalDestino.em}</td>
                                                <td className="px-3 py-2 text-right bg-gray-200 dark:bg-gray-700 border border-gray-400">{totalDestino.total}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'condicion' && (
                        <div>
                            <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <caption className="text-center border border-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-2 font-semibold text-gray-900 dark:text-white">
                                        Condición de Referencias Emitidas por Punto de Origen
                                    </caption>
                                    <thead className="border border-gray-400 bg-gray-200 dark:bg-gray-700">
                                        <tr className="text-xs uppercase text-gray-600 dark:text-gray-200">
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-left">N°</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-left">IPRESS ORIGEN</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">ACEPTADO</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">ANULADO</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">CONTRARREFERIDO</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">OBSERVADO</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">PACIENTE CITADO</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">PACIENTE RECIBIDO</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">PENDIENTE</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">RECHAZADO</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">REGISTRADO</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {datosCondicion.map((r, idx) => {
                                            const total =
                                                r.aceptado +
                                                r.anulado +
                                                r.contrarreferido +
                                                r.observado +
                                                r.pacienteCitado +
                                                r.pacienteRecibido +
                                                r.pendiente +
                                                r.rechazado +
                                                r.registrado;
                                            return (
                                                <tr key={r.ipressOrigen} className="text-sm text-gray-800 dark:text-gray-100">
                                                    <td className="px-3 py-2 border border-gray-400">{idx + 1}</td>
                                                    <td className="px-3 py-2 border border-gray-400">{r.ipressOrigen}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.aceptado}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.anulado}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.contrarreferido}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.observado}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.pacienteCitado}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.pacienteRecibido}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.pendiente}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.rechazado}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.registrado}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{total}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700 text-sm font-semibold">
                                        <tr className="text-gray-900 dark:text-white">
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700" colSpan={2}>
                                                TOTAL
                                            </td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.aceptado}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.anulado}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.contrarreferido}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.observado}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.pacienteCitado}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.pacienteRecibido}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.pendiente}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.rechazado}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.registrado}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalCondicion.total}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {tab === 'especialidades' && (
                        <div>
                            <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <caption className="text-center border border-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-2 font-semibold text-gray-900 dark:text-white">
                                        Referencias Emitidas por Especialidades
                                    </caption>
                                    <thead className="border border-gray-400 bg-gray-200 dark:bg-gray-700">
                                        <tr className="text-xs uppercase text-gray-600 dark:text-gray-200">
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-left">N°</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-left">ESPECIALIDADES</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">CONSULTA EXTERNA</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">DIAGNÓSTICO POR IMÁGENES</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">EMERGENCIA</th>
                                            <th className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {datosEspecialidades.map((r, idx) => {
                                            const total = r.consultaExterna + r.diagnosticoImagenes + r.emergencia;
                                            return (
                                                <tr key={`${r.especialidad}-${idx}`} className="text-sm text-gray-800 dark:text-gray-100">
                                                    <td className="px-3 py-2 border border-gray-400">{idx + 1}</td>
                                                    <td className="px-3 py-2 border border-gray-400">{r.especialidad}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.consultaExterna}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.diagnosticoImagenes}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{r.emergencia}</td>
                                                    <td className="px-3 py-2 border border-gray-400 text-right">{total}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700 text-sm font-semibold">
                                        <tr className="text-gray-900 dark:text-white">
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700" colSpan={2}>
                                                TOTAL
                                            </td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalEspecialidades.ce}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalEspecialidades.di}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalEspecialidades.em}</td>
                                            <td className="px-3 py-2 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-right">{totalEspecialidades.total}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
