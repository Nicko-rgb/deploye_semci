import React, { useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
//import { redes, anios } from '../../../../core/utils/accesories';
import { Link } from 'react-router-dom';

interface IndicadorData {
    codigo: string;
    nombre: string;
    porcentaje: number;
    avance: number;
    meta: number;
}

const MenuIndicadoresSIS: React.FC = () => {
    const [filtros, setFiltros] = useState({
        red: '01', // CORONEL PORTILLO por defecto
        año: '2025'
    });

    const indicadores: IndicadorData[] = [
        {
            codigo: 'IP04',
            nombre: 'Hipertensión Arterial',
            porcentaje: 50,
            avance: 54.74,
            meta: 100
        }
    ];

    // Configuración del gráfico circular (donut)
    const getOpcionesGraficoCircular = (avance: number): Highcharts.Options => ({
        chart: {
            type: 'pie',
            height: 260,
            backgroundColor: 'transparent'
        },
        title: { text: '' },
        tooltip: { pointFormat: '<b>{point.percentage:.1f}%</b>' },
        accessibility: { point: { valueSuffix: '%' } },
        plotOptions: {
            pie: {
                allowPointSelect: false,
                dataLabels: { enabled: false },
                innerSize: '65%',
                colors: ['#10B981', '#E5E7EB']
            }
        },
        series: [
            {
                type: 'pie',
                name: 'Avance',
                data: [
                    { name: 'Avance', y: avance, color: '#10B981' },
                    { name: 'Restante', y: 100 - avance, color: '#E5E7EB' }
                ]
            }
        ],
        credits: { enabled: false }
    });

    const handleFiltroChange = (campo: string, valor: string) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const handleVerDetalle = (indicador: IndicadorData) => {
        console.log('Ver detalle de:', indicador);
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        INDICADORES SIS
                    </h1>
                    <span className="text-sm text-red-500 font-medium">
                        Actualizado al 01/08/2025 08:12:27
                    </span>

                </div>
                <Link to="/home/sis" className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
                    <div className="flex items-center justify-between p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-red-600">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                </Link>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Filtro RED */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            RED
                        </label>
                        <select
                            value={filtros.red}
                            onChange={(e) => handleFiltroChange('red', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            {/* {redes.map((red) => (
                                <option key={red.codigo_red} value={red.codigo_red}>
                                    {red.nombre_red}
                                </option>
                            ))} */}
                        </select>
                    </div>

                    {/* Filtro AÑO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            AÑO
                        </label>
                        <select
                            value={filtros.año}
                            onChange={(e) => handleFiltroChange('año', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            {/* {anios().map((año) => (
                                <option key={año} value={año}>
                                    {año}
                                </option>
                            ))} */}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Indicadores */}
            {indicadores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {indicadores.map((indicador, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-shadow"
                        >
                            <div className="p-5">
                                {/* Header tarjeta */}
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                                            {indicador.codigo}
                                        </span>
                                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-md text-xs font-medium">
                                            {indicador.porcentaje}%
                                        </span>
                                    </div>
                                </div>

                                {/* Nombre indicador */}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {indicador.nombre}
                                </p>

                                {/* Donut chart */}
                                <div className="relative">
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={getOpcionesGraficoCircular(indicador.avance)}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Avance
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {indicador.avance}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botón */}
                            <div className="p-5 pt-0">
                                <button
                                    onClick={() => handleVerDetalle(indicador)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
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
};

export default MenuIndicadoresSIS;
