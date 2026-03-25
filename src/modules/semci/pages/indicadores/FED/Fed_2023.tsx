import { useState } from 'react';
import { Link } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
//import { redes } from '../../../../core/utils/accesories';

interface IndicadorData {
    codigo: string;
    nombre: string;
    porcentaje: number;
    avance: number;
    meta: number;
    estado: 'verde' | 'rojo';
    tipoPersona: string;
}

const years = ['--', '2025', '2024', '2023', '2022', '2021'];
const months = [
    '--', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

export default function Fed_2023() {
    const [selectedRed, setSelectedRed] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState('--');
    const [selectedMonth, setSelectedMonth] = useState('--');
    //const [redesOptions, setRedesOptions] = useState<string[]>([]);

    /*useEffect(() => {
        const loadRedes = () => {
            const redesList = redes.map(r => r.nombre_red);
            setRedesOptions(redesList);
        };
        loadRedes();
    }, []);*/

    const handleSearch = () => {
        // Implementar lógica de búsqueda
    };

    const indicadores: IndicadorData[] = [
        {
            codigo: 'GESTANTE - FED SI-01.01',
            nombre: 'Gestantes con anemia que recibieron doble de control y segundo tratamiento',
            porcentaje: 31.4,
            avance: 8.33,
            meta: 100,
            estado: 'verde',
            tipoPersona: 'GESTANTE'
        },
        {
            codigo: 'NIÑO - FED SI-02.01',
            nombre: 'Prematuro y/o bajo peso al nacer sin diagnóstico de anemia',
            porcentaje: 70.8,
            avance: 60.54,
            meta: 100,
            estado: 'rojo',
            tipoPersona: 'NIÑO'
        },
        {
            codigo: 'NIÑO - FED SI-02.02',
            nombre: 'Diagnóstico de anemia que culminan el tratamiento de hierro',
            porcentaje: 48,
            avance: 23.73,
            meta: 100,
            estado: 'rojo',
            tipoPersona: 'NIÑO'
        },
        {
            codigo: 'NIÑO - FED SI-02.03',
            nombre: 'Sin Diagnóstico de anemia que culminan la suplementación preventiva con hierro',
            porcentaje: 15,
            avance: 17.58,
            meta: 100,
            estado: 'verde',
            tipoPersona: 'NIÑO'
        },
        {
            codigo: 'NIÑO - FED SI-03.01',
            nombre: 'Niños menor de 12 meses con control CRED',
            porcentaje: 41.9,
            avance: 34.96,
            meta: 100,
            estado: 'rojo',
            tipoPersona: 'NIÑO'
        },
        {
            codigo: 'ADOLESC. - FED SI-04.01',
            nombre: 'Adolescentes con dosaje de hemoglobina.',
            porcentaje: 73.6,
            avance: 26.42,
            meta: 100,
            estado: 'rojo',
            tipoPersona: 'ADOLESC.'
        },
        {
            codigo: 'GESTANTE - FED VI-01.01',
            nombre: 'Gestantes con test de violencia',
            porcentaje: 97,
            avance: 86.67,
            meta: 100,
            estado: 'rojo',
            tipoPersona: 'GESTANTE'
        },
        {
            codigo: 'GESTANTE - FED VI-01.02',
            nombre: 'Gestantes con detección Positiva',
            porcentaje: 12.6,
            avance: 10.61,
            meta: 100,
            estado: 'rojo',
            tipoPersona: 'GESTANTE'
        },
        {
            codigo: 'GESTANTE - FED VII-01.01',
            nombre: 'Gestantes con Paquete Mínimo',
            porcentaje: 15,
            avance: 50,
            meta: 100,
            estado: 'verde',
            tipoPersona: 'GESTANTE'
        },
        {
            codigo: 'NIÑO - FED MC-02.01',
            nombre: 'Paquete integral de Niños menores de 12 meses (sin intervalo de entrega de años)',
            porcentaje: 5,
            avance: 0,
            meta: 100,
            estado: 'rojo',
            tipoPersona: 'NIÑO'
        },
        {
            codigo: 'NIÑO - FED MC-03.01',
            nombre: 'Paquete integral Recien Nacido',
            porcentaje: 32,
            avance: 12.65,
            meta: 100,
            estado: 'rojo',
            tipoPersona: 'NIÑO'
        }
    ];

    const getOpcionesGraficoCircular = (avance: number, estado: 'verde' | 'rojo'): Highcharts.Options => ({
        chart: {
            type: 'pie',
            height: 200,
            backgroundColor: 'transparent'
        },
        title: { text: '' },
        tooltip: { enabled: false },
        plotOptions: {
            pie: {
                allowPointSelect: false,
                dataLabels: { enabled: false },
                innerSize: '70%',
                borderWidth: 0,
                states: {
                    hover: { enabled: false }
                }
            }
        },
        series: [
            {
                type: 'pie',
                name: 'Avance',
                data: [
                    { 
                        name: 'Avance', 
                        y: avance, 
                        color: estado === 'verde' ? '#10B981' : '#EF4444' 
                    },
                    { 
                        name: 'Restante', 
                        y: 100 - avance, 
                        color: '#E5E7EB' 
                    }
                ]
            }
        ],
        credits: { enabled: false }
    });

    const handleVerDetalle = (indicador: IndicadorData) => {
        console.log('Ver detalle de:', indicador);
    };

    return (
        <div className="p-4 max-w-full mx-auto">
            {/*HEADER  */}
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <svg className="w-10 h-10 mx-auto " fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='white'>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">FED 2022 - 2023</h1>
                            <p className="text-blue-100">Actualizado al 10/11/2025 10:48:42</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center justify-between">
                        <Link to="/home/indicadores/fed" className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
                            <div className="flex items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Red
                        </label>
                        <select
                            value={selectedRed}
                            onChange={(e) => setSelectedRed(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">---</option>
                            {/*redesOptions.map((red) => (
                                <option key={red} value={red}>
                                    {red}
                                </option>
                            ))*/}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            AÑO
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

                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            MES
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {months.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            &nbsp;
                        </label>
                        <button
                            onClick={handleSearch}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Indicadores*/}
            {indicadores.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {indicadores.map((indicador, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="p-4">
                                {/* Header tarjeta */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-start gap-2 flex-1">
                                        <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                                            indicador.estado === 'verde' ? 'bg-green-500' : 'bg-red-500'
                                        }`}></span>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                                            {indicador.codigo}
                                        </span>
                                    </div>
                                    <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs font-medium ml-2 flex-shrink-0">
                                        {indicador.porcentaje}%
                                    </span>
                                </div>

                                {/* Nombre indicador */}
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">
                                    {indicador.nombre}
                                </p>

                                {/* Ícono de menú */}
                                <div className="flex justify-end mb-2">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                    </button>
                                </div>

                                {/* Donut chart */}
                                <div className="relative mb-3">
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={getOpcionesGraficoCircular(indicador.avance, indicador.estado)}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Avance
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                {indicador.avance.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botón */}
                            <div className="px-4 pb-4">
                                <button
                                    onClick={() => handleVerDetalle(indicador)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                                >
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">📊</div>
                    <p className="text-gray-500 dark:text-gray-400">
                        No hay indicadores disponibles para los filtros seleccionados
                    </p>
                </div>
            )}
        </div>
    );
}
