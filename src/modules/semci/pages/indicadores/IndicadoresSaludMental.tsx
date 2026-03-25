import { useState } from 'react';
import { Link } from 'react-router-dom';
//import { redes } from '../../utils/accesories';
import { useBackToApp } from '../../../../core/hooks/useBackToApp';

const years = ['--', '2025', '2024', '2023', '2022', '2021'];
const indicador = ['---',
                    'VIOLENCIA FAMILIAR/MALTRATOINFANTIL-TRATAMIENTO NO ESPECIALIZADO - PRIMER NIVEL NO ESPECIFICADO-17',
                    'VIOLENCIA FAMILIAR/MALTRATO INFANTIL-TRATAMIENTO ESPECIALIZADO-CSMC Y HOSPITALES-17',
                    'VIOLENCIA FAMILIAR/MALTRATO INFANTIL-ABUSO SEXUAL-17',
                    'VIOLENCIA FAMILIAR/MALTRATO INFANTI-TRATAMIENTO NO ESPECIALIZADO-PRIMER NIVEL NO ESPECIALIZADO-18',
                    'VIOLENCIA FAMILIAR/MALTRATO INFANTIL-TRATAMIENTO ESPECIALIZADO-CSMC Y HOSPITALES-18',
                    'VIOLENCIA FAMILIAR/MALTRATO INFANTIL-ABUSO SEXUAL18',
                    'PERSONAS CON TRASTORNOS MENTALES Y DEL COMPORTAMIENTO DEBIDO AL CONSUMO DEL ALCOHOL Y TABACO TRATADAS OPORTUNAMENTES-INTERVENCIONES BREVES MOTIVACIONALES PARA PERSONAS CON CONSUMO PERJUDICIAL DEL ALCOHOL Y TABACO',
                    'PERSONAS CON TRASTORNOS MENTALES Y DEL COMPORTAMIENTO DEBIDO AL CONSUMO DEL ALCOHOL Y TABACO TRATADAS OPORTUNAMENTES-INTERVENCIONES PARA PERSONAS CON DEPENDENCIA DEL ACOHOL Y TABACO',
                    'PERSONAS CON TRASTORNOS MENTALES Y DEL COMPORTAMIENTO DEBIDO AL CONSUMO DEL ALCOHOL Y TABACO TRATADAS OPORTUNAMENTE-REHABILITACIONPSICOSOCIAL DEPERSONAS CON TRASTORNOS DEL COMPORTAMIENTO DEBIDO AL CONSUMO DE ALCOHOL',
                    'PERSONAS CON TRASTRONOS Y SINDROMES PSICOTICOS TRATADAS OPOTRTUNAMENTE-TRATAMIENTOAMBULATORIO A PERSONAS CON SINDROME PSICOTICO Y TRASTORNO DEL ESPETRO DE AL ESQUIZOFRENIA-TRATAMIENTO NO ESPECIALIZADO PRIMER NIVEL DE ATENCION',
                    'PERSONAS CON TRASTORNOS Y SINDROMES PSICOTICOS TRATADAS OPORTUNAMENTE-TRATAMIENTO-AMBULATORIO A PERSONAS CON SIMDROME PSICOTICO Y TRASTORNO DEL ESPECTRO DE LA ESQUIZOFRENIA-TRATAMIENTO ESPECIALIZADO CSMCY HOSPITALES',
                    'PERSONAS CON TRASTORNOS Y SINDROMES PSICOTICOS TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO A PERSONAS CON SINDROME PSICOTICO Y TRASTORNO DEL ESPECTRO DE LA ESQUIZOFRENIA-TRATAMIENTO AMBULATORIO DE PERSONAS CON PRIMER EPISODIO PSICOTICO',
                    'PERSONAS CON TRASTORNOS Y SINDROMES PSICOTICOS TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO A PERSONAS CON SINDROME PSICOTICO Y TRASTORNO DEL ESPECTRO DE LA ESQUIZOFRENIA-TRATAMIENTO AMBULATORIO PARA LAS PERSONAS CON DETERIORO COGNITIVO',
                    'PERSONAS CON TRASTORNOS Y SINDROMES PSICOTICOS TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO A PERSONAS CON SINDROME PSICOTICO Y TRASTORNO DEL ESPECTRO DE LA ESQUIZOFRENIA-CUIDADOS DE SALUD DOMICILIARIOS A PERSONAS CON DEMENCIA SEVERA Y EN PERCARIAS CONDICIONES ECONOMICAS',
                    'PERSONAS CON TRASTORNOS Y SINDROMES PSICOTICOS TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO A PERSONAS CON SINDROME PSICOTICO Y TRASTORNO DEL ESPECTRO DE LA ESQUIZOFRENIA-CONTINUIDAD DE CUIDADOS A PERSONAS CON TRASTORNO MENTAL GRAVE ',
                    'TRATAMIENTO AMBULATORIO DE NIÑOS Y NIÑAS DE 0 A 17 AÑOS CON TRASTORNOS DEL EXPECTRO AUTISTA-TRATAMIENTO NO ESPECIALIZADO PRIMER NIVEL NO ESPECIALIZADO (I-1 AL I-4',
                    'TRATAMIENTO AMBULATORIO DE NIÑOS Y NIÑAS DE 0 A 17 AÑOS CON TRASTORNOS DEL EXPECTRO AUTISTA-TRATAMIENTO NO ESPECIALIZADOCSMC Y HOSPITALES(II-1 EN ADELANTE)',
                    'TRATAMIENTO AMBULATORIO DE NIÑAS, NIÑOS Y ADOLECENTES DE 0 A 17 POR TRASTORNOS MENTALES Y DEL COMPORTAMIENTO-TRATAMIENTO NO ESPECIALIZADO-CSMC Y HOSPITALES',
                    'TRATAMIENTO AMBULATORIO DE NIÑAS, NIÑOS Y ADOLECENTES DE 0 A 17 POR TRASTORNOS MENTALES Y DEL COMPORTAMIENTO-TRATAMIENTO ESPECIALIZADO-CSMC Y HOSPITALES',
                    'PERSONAS CON TRASTORNOS AFECTIVOS Y DE ANSIEDAD TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO DE PERSONAS CON DEPRESION-TRATAMIENTO NO ESPECIALIZADO-PRIMER NIVEL DE ATENCION',
                    'PERSONAS COO TRASTORNOS AFECTIVOS Y DE ANSIEDAD TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO DE PERSONAS CON DEPRESION-TRATAMIENTO ESPECIALIZADO-CSMC Y HOSPITALES',
                    'PERSONAS COO TRASTORNOS AFECTIVOS Y DE ANSIEDAD TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO DE PERSONAS CON CONDUCTA SUICIDA-TRATAMIENTO NO ESPECIALIZADO-PRIMER NIVEL DE ATENCION',
                    'PERSONAS COO TRASTORNOS AFECTIVOS Y DE ANSIEDAD TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO DE PERSONAS CON CONDUCTA SUICIDA-TRATAMIENTO ESPECIALIZADO-CSMC Y HOSPITALES',
                    'PERSONAS COO TRASTORNOS AFECTIVOS Y DE ANSIEDAD TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO DE PERSONAS CON ANSIEDAD-TRATAMIENTO NO ESPECIALIZADO-PRIMER NIVEL DE ATENCION',
                    'PERSONAS COO TRASTORNOS AFECTIVOS Y DE ANSIEDAD TRATADAS OPORTUNAMENTE-TRATAMIENTO AMBULATORIO DE PERSONAS CON ANSIEDAD-TRATAMIENTO ESPECIALIZADO-CSMC Y HOSPITALES'
];

const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SETIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

export default function IndicadoresSaludMental() {
    const backLink = useBackToApp();
    const [selectedRed, setSelectedRed] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState('--');
    const [selectedIndicador, setSelectedIndicador] = useState('--');

    // Estados para las opciones de los selectores dinámicos
    //const [redesOptions, setRedesOptions] = useState<string[]>([]);

    // Cargar redes al montar el componente
    /*useEffect(() => {
        const loadRedes = () => {
            const redesList = redes.map(r => r.nombre_red);
            setRedesOptions(redesList);
        };
        loadRedes();
    }, []);*/

    // Función para el botón buscar
    const handleSearch = async () => {
    };

    const handleExportar = () => {
        // Lógica de exportación, por ahora solo un log
        console.log("Exportando datos...", "searchResults");
        // Puedes agregar la lógica para generar un archivo .csv o .xlsx aquí
    };

    return (
        <div className="p-4 max-w-full mx-auto">
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <svg className="w-10 h-10 mx-auto " fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='white'>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">PP131 Prevencion y Control Salud Mental</h1>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center justify-between">
                        {/* Botón de inicio, se empuja al lado derecho */}
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                {/* Primera fila de filtros */}
                <div className='flex items-center justify-between'>
                    {/* Mes */}
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Seleccione Indicador: (*)
                        </label>
                        <select
                            value={selectedIndicador}
                            onChange={(e) => setSelectedIndicador(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {indicador.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Red: (*)
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
                            AÑO:(*)
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

                    <div className="flex-1 min-w-[180px]">
                        <button
                            onClick={handleExportar}
                            className="flex items-center mt-7  px-20 py-2 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de Avance por Mes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    Avance por Mes
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                {meses.map((mes) => (
                                    <th 
                                        key={mes} 
                                        className="px-4 py-3 text-center text-sm font-semibold border border-blue-500"
                                    >
                                        {mes}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-sm font-semibold border border-blue-500">
                                    TOTAL
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-gray-50 dark:bg-gray-700">
                                {meses.map((mes) => (
                                    <td 
                                        key={mes} 
                                        className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                    >
                                        {/* Aquí irán los datos */}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-semibold">
                                    {/* Total */}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sección de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico del Avance por Mes */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Gráfico del Avance por Mes
                    </h2>
                    <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {/* Aquí irá tu gráfico (Highcharts, Chart.js, etc.) */}
                    </div>
                </div>

                {/* Gráfico del Avance por Categoría */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Gráfico del Avance por Categoría
                    </h2>
                    <div className="w-full h-80 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {/* Aquí irá tu gráfico (Highcharts, Chart.js, etc.) */}
                    </div>
                </div>
            </div>

            {/* Sección de Gráfico de Microredes y Tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                {/* Gráfico del Avance por Microredes */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Gráfico del Avance por Microredes
                    </h2>
                    <div className="w-full h-96 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {/* Aquí irá tu gráfico de microredes (Highcharts, Chart.js, etc.) */}
                    </div>
                </div>

                {/* Tabla Avance por Microredes y Meses */}
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Avance por Microredes y Meses
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="px-3 py-2 text-center text-xs font-semibold border border-blue-500">
                                        MICRORED
                                    </th>
                                    {meses.map((mes) => (
                                        <th 
                                            key={mes} 
                                            className="px-3 py-2 text-center text-xs font-semibold border border-blue-500"
                                        >
                                            {mes}
                                        </th>
                                    ))}
                                    <th className="px-3 py-2 text-center text-xs font-semibold border border-blue-500">
                                        TOTAL
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Aquí irán las filas de microredes con sus datos */}
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <td className="px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                                        {/* Nombre de microred */}
                                    </td>
                                    {meses.map((mes) => (
                                        <td 
                                            key={mes} 
                                            className="px-3 py-2 text-center text-xs text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                        >
                                            {/* Datos */}
                                        </td>
                                    ))}
                                    <td className="px-3 py-2 text-center text-xs text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-semibold">
                                        {/* Total */}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
