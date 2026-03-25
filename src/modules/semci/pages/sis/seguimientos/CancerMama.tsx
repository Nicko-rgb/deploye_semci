import * as React from 'react';
//import { anios, meses, redes } from '../../../../core/utils/accesories';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as XLSX from 'xlsx';
import { seguimientosService } from '../../../services/sis/seguimientosService';
import { Link } from 'react-router-dom';

interface FiltrosSeguimiento {
    anio: string;
    nombre_red: string;
    mes: string;
}

interface DatosMicrored {
    microred: string;
    enero: number;
    febrero: number;
    marzo: number;
    abril: number;
    mayo: number;
    junio: number;
    julio: number;
    agosto: number;
    septiembre: number;
    octubre: number;
    noviembre: number;
    diciembre: number;
    total: number;
}

interface DatosEstablecimiento {
    nom_establecimiento: string;
    enero: number;
    febrero: number;
    marzo: number;
    abril: number;
    mayo: number;
    junio: number;
    julio: number;
    agosto: number;
    septiembre: number;
    octubre: number;
    noviembre: number;
    diciembre: number;
    total: number;
}

/*interface DatosRed {
    nom_red: string;
    mes: number;
    cantidad: number;
}*/

interface DatosMicroredAPI {
    nom_microred: string;
    mes: number;
    cantidad: number;
}

const CancerMama: React.FC = () => {
    //const [datosRed, setDatosRed] = React.useState<DatosRed[]>([]);
    const [datosMicroredes, setDatosMicroredes] = React.useState<DatosMicrored[]>([]);
    const [datosEstablecimientos, setDatosEstablecimientos] = React.useState<DatosEstablecimiento[]>([]);
    const [filtros, setFiltros] = React.useState<FiltrosSeguimiento>({
        anio: new Date().getFullYear().toString(),
        nombre_red: '',
        mes: '',
    });

    const [microredSeleccionada, setMicroredSeleccionada] = React.useState<string | null>(null);

    // Función para transformar datos de la API al formato de tabla
    const transformarDatosMicroredes = (datosAPI: DatosMicroredAPI[]): DatosMicrored[] => {
        // Obtener todas las microredes únicas
        const microredesUnicas = [...new Set(datosAPI.map(item => item.nom_microred))];

        return microredesUnicas.map(microred => {
            // Crear objeto base con todos los meses en 0
            const microredData: DatosMicrored = {
                microred: microred,
                enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, junio: 0,
                julio: 0, agosto: 0, septiembre: 0, octubre: 0, noviembre: 0, diciembre: 0,
                total: 0
            };

            // Llenar los datos de cada mes
            datosAPI.forEach(item => {
                if (item.nom_microred === microred) {
                    switch (item.mes) {
                        case 1: microredData.enero = item.cantidad; break;
                        case 2: microredData.febrero = item.cantidad; break;
                        case 3: microredData.marzo = item.cantidad; break;
                        case 4: microredData.abril = item.cantidad; break;
                        case 5: microredData.mayo = item.cantidad; break;
                        case 6: microredData.junio = item.cantidad; break;
                        case 7: microredData.julio = item.cantidad; break;
                        case 8: microredData.agosto = item.cantidad; break;
                        case 9: microredData.septiembre = item.cantidad; break;
                        case 10: microredData.octubre = item.cantidad; break;
                        case 11: microredData.noviembre = item.cantidad; break;
                        case 12: microredData.diciembre = item.cantidad; break;
                    }
                }
            });

            // Calcular el total
            microredData.total = microredData.enero + microredData.febrero + microredData.marzo +
                microredData.abril + microredData.mayo + microredData.junio +
                microredData.julio + microredData.agosto + microredData.septiembre +
                microredData.octubre + microredData.noviembre + microredData.diciembre;

            return microredData;
        });
    };

    const obtenerDatosGeneral = async () => {
        const response = await seguimientosService.getCancerMamaGeneral(filtros.anio, filtros.mes !== '' ? Number(filtros.mes) : undefined, filtros.nombre_red);
        //setDatosRed(response.data.red);

        // Transformar y establecer los datos de microredes
        if (response.data.microred_mes) {
            const datosTransformados = transformarDatosMicroredes(response.data.microred_mes);
            setDatosMicroredes(datosTransformados);
        }
    };

    const obtenerDatosEstablecimientos = async (microred: string) => {
        const response = await seguimientosService.getCancerMamaByMicrored(filtros.anio, filtros.nombre_red, microred);
        setDatosEstablecimientos(response.data);
        setMicroredSeleccionada(microred);
    };

    const handleInputChange = (field: keyof FiltrosSeguimiento, value: string) => {
        setFiltros(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para exportar datos a Excel
    const exportarAExcel = (datos: DatosMicrored[] | DatosEstablecimiento[], nombreArchivo: string, nombreHoja: string) => {
        const ws = XLSX.utils.json_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
        XLSX.writeFile(wb, `${nombreArchivo}_${filtros.anio}.xlsx`);
    };

    // Función para exportar datos nominales desde el endpoint
    const exportarDatosNominales = async () => {
        try {
            if (!filtros.anio || !filtros.nombre_red) {
                alert('Por favor, seleccione el año y la red de salud antes de exportar.');
                return;
            }

            await seguimientosService.exportarNominalCancerMama(filtros.anio, filtros.mes, filtros.nombre_red, '', '');

        } catch (error) {
            console.error('Error al exportar datos nominales:', error);
            alert('Error al exportar los datos. Por favor, inténtelo de nuevo.');
        }
    };

    const exportarDatosNominalesMicrored = async (nom_microred: string) => {
        try {
            if (!filtros.anio || !filtros.nombre_red) {
                alert('Por favor, seleccione el año y la red de salud antes de exportar.');
                return;
            }

            await seguimientosService.exportarNominalCancerMama(filtros.anio, filtros.mes, filtros.nombre_red, nom_microred, '');

        } catch (error) {
            console.error('Error al exportar datos nominales:', error);
            alert('Error al exportar los datos. Por favor, inténtelo de nuevo.');
        }
    }

    const exportarDatosNominalesEstablecimiento = async (nom_microred: string, nom_establecimiento: string) => {
        try {
            if (!filtros.anio || !filtros.nombre_red) {
                alert('Por favor, seleccione el año y la red de salud antes de exportar.');
                return;
            }

            await seguimientosService.exportarNominalCancerMama(filtros.anio, filtros.mes, filtros.nombre_red, nom_microred, nom_establecimiento);

        } catch (error) {
            console.error('Error al exportar datos nominales:', error);
            alert('Error al exportar los datos. Por favor, inténtelo de nuevo.');
        }
    }

    // Configuración del gráfico de barras horizontales (general)
    const opcionesGraficoHorizontal: Highcharts.Options = {
        chart: {
            type: 'bar',
            height: 400,
            backgroundColor: 'transparent'
        },
        title: {
            text: 'Casos por Microred - General',
            style: { color: '#374151', fontSize: '18px', fontWeight: 'bold' }
        },
        xAxis: {
            categories: datosMicroredes.map(m => m.microred),
            title: { text: 'Microredes' },
            labels: { style: { color: '#6B7280' } }
        },
        yAxis: {
            min: 0,
            title: { text: 'Número de Casos', style: { color: '#6B7280' } },
            labels: { style: { color: '#6B7280' } }
        },
        plotOptions: {
            bar: {
                dataLabels: { enabled: true },
                colorByPoint: true,
                colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
            }
        },
        series: [{
            type: 'bar',
            name: 'Casos Totales',
            data: datosMicroredes.map(m => m.total)
        }],
        credits: { enabled: false },
        legend: { enabled: false }
    };

    // Función para generar datos mensuales correctamente mapeados
    /*const generarDatosMensuales = (datos: DatosRed[]) => {
        const mesesCompletos = meses();
        return mesesCompletos.map(mesInfo => {
            const datoEncontrado = datos.find(dato => dato.mes === mesInfo.mes);
            return datoEncontrado ? datoEncontrado.cantidad : 0;
        });
    };*/

    // Configuración del gráfico de barras verticales (mensualizado)
    const opcionesGraficoVertical: Highcharts.Options = {
        chart: {
            type: 'column',
            height: 400,
            backgroundColor: 'transparent'
        },
        title: {
            text: 'Casos por Red - Mensualizado',
            style: { color: '#374151', fontSize: '18px', fontWeight: 'bold' }
        },
        xAxis: {
            categories: /*meses().map(m => m.abrev)*/ [],
            title: { text: 'Meses' },
            labels: { style: { color: '#6B7280' } }
        },
        yAxis: {
            min: 0,
            title: { text: 'Número de Casos', style: { color: '#6B7280' } },
            labels: { style: { color: '#6B7280' } }
        },
        plotOptions: {
            column: {
                dataLabels: { enabled: true },
                colorByPoint: false
            }
        },
        series: [{
            type: 'column',
            name: filtros.nombre_red,
            data: /*generarDatosMensuales(datosRed)*/ [],
            color: '#3B82F6'
        }],
        credits: { enabled: false }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header con gradiente púrpura similar a la imagen */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-800 text-white flex items-center justify-between rounded-lg">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Seguimiento de Cáncer de Mama - SIS
                            </h1>
                            <p className="text-purple-100 mt-1">
                                Fecha de Actualización: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <Link to="/home/sis/seguimientos" className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
                        <div className="flex items-center justify-between bg-white/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros Globales */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Filtros de Análisis
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Año <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.anio}
                                onChange={(e) => handleInputChange('anio', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {/* {anios()?.map(anio => (
                                    <option key={anio} value={anio}>{anio}</option>
                                ))} */}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mes
                            </label>
                            <select
                                value={filtros.mes}
                                onChange={(e) => handleInputChange('mes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">---</option>
                                {/* {meses()?.map(mes => (
                                    <option key={mes.mes} value={mes.mes}>{mes.nombre}</option>
                                ))} */}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Red de Salud <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={filtros.nombre_red}
                                onChange={(e) => handleInputChange('nombre_red', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">---</option>
                                {/* {redes.map(red => (
                                    <option key={red.codigo_red} value={red.nombre_red}>{red.nombre_red}</option>
                                ))} */}
                            </select>
                        </div>

                    </div>
                    {/* Botón de búsqueda */}
                    <div className="flex justify-center mt-6 gap-8">
                        <button
                            type="button"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
                            onClick={obtenerDatosGeneral}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Buscar
                        </button>
                        <button
                            type="button"
                            className="px-6 py-2  bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
                            onClick={exportarDatosNominales}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.25 6a.75.75 0 0 0-1.5 0v4.94l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V9.75Z" clipRule="evenodd" />
                            </svg>
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Sección de Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Gráfico de Barras Verticales - Mensualizado */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Casos por Red - Mensualizado
                            </h3>

                        </div>
                        <div className="h-96">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={opcionesGraficoVertical}
                            />
                        </div>
                    </div>

                    {/* Gráfico de Barras Horizontales - General */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Casos por Microred - General
                            </h3>

                        </div>
                        <div className="h-96">
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={opcionesGraficoHorizontal}
                            />
                        </div>
                    </div>
                </div>

                {/* Sección de Tablas */}
                <div className="grid grid-cols-1 gap-8 py-4">
                    {/* Tabla de Microredes */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Datos por Microredes
                                </h3>
                                <button
                                    onClick={() => exportarAExcel(datosMicroredes, 'Tabla_Microredes', 'Microredes')}
                                    className="px-6 py-2  bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                        <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.25 6a.75.75 0 0 0-1.5 0v4.94l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V9.75Z" clipRule="evenodd" />
                                    </svg>
                                    Exportar Tabla
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                            </svg>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Microred
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ene</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Feb</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mar</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Abr</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">May</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jun</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jul</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ago</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sep</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Oct</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nov</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dic</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {datosMicroredes.map((microred, index) => (
                                        <tr
                                            key={microred.microred}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                                                }`}
                                            onClick={() => setMicroredSeleccionada(microred.microred)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-blue-300">
                                                <Link to="" onClick={() => exportarDatosNominalesMicrored(microred.microred)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                    </svg>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                                <Link to="" onClick={() => obtenerDatosEstablecimientos(microred.microred)}>{microred.microred}</Link>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.enero}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.febrero}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.marzo}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.abril}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.mayo}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.junio}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.julio}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.agosto}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.septiembre}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.octubre}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.noviembre}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{microred.diciembre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900">
                                                {microred.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-8 py-4'>
                    {/* Tabla de Establecimientos (cuando se selecciona una microred) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {microredSeleccionada
                                        ? `Establecimientos - ${microredSeleccionada}`
                                        : 'Seleccione una Microred'
                                    }
                                </h3>
                                {microredSeleccionada && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                exportarAExcel(datosEstablecimientos, `Establecimientos_${microredSeleccionada}`, 'Establecimientos');
                                            }}
                                            className="px-6 py-2  bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                            </svg>
                                            Exportar
                                        </button>
                                        <button
                                            onClick={() => setMicroredSeleccionada(null)}
                                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors duration-200"
                                        >
                                            ✕ Cerrar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-96">
                            {microredSeleccionada && datosEstablecimientos.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                                </svg>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Establecimiento
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ene</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Feb</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mar</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Abr</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">May</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jun</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jul</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ago</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sep</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Oct</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nov</th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dic</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-orange-50 dark:bg-orange-900">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {datosEstablecimientos.map((establecimiento, index) => (
                                            <tr
                                                key={establecimiento.nom_establecimiento}
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                                                    }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-blue-300">
                                                    <Link to="" onClick={() => exportarDatosNominalesEstablecimiento(microredSeleccionada, establecimiento.nom_establecimiento)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                        </svg>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {establecimiento.nom_establecimiento}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.enero}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.febrero}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.marzo}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.abril}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.mayo}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.junio}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.julio}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.agosto}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.septiembre}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.octubre}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.noviembre}</td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-gray-300">{establecimiento.diciembre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900">
                                                    {establecimiento.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Haga clic en una microred para ver los establecimientos
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancerMama;
