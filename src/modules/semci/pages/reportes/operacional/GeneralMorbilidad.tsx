import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//import { redes } from '../../../../core/utils/accesories';
import { accessoriesService } from '../../../../settings/services/accessoriesService';
import type { microredes, establecimientos } from '../../../../settings/services/accessoriesService';



// Datos de catálogo

const years = ['--', '2025', '2024', '2023', '2022', '2021'];
const months = [
    '--', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];
const months2 = [
    '--', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];
const limites = [
    '--', '5 registros', '10 registros', '15 registros', '20 registros',
    '25 registros', '30 registros'
]


// Componente principal de React
export default function ProduccionDigitacion() {
    const [selectedTab, setSelectedTab] = useState<'general' | 'morbilidad' | 'primeras'>('general');
    const [selectedRed, setSelectedRed] = useState<string>('');
    const [selectedMicrored, setSelectedMicrored] = useState<string>('');
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState('--');
    const [selectedMonth, setSelectedMonth] = useState('--');
    const [selectedMonth2, setSelectedMonth2] = useState('--');
    const [selectedLimites, setSelectedLimites] = useState('5 registros')


    // Estados para las opciones de los selectores dinámicos
    //const [redesOptions, setRedesOptions] = useState<string[]>([]);
    const [microredesOptions, setMicroredesOptions] = useState<microredes[]>([]);
    const [establecimientosOptions, setEstablecimientosOptions] = useState<establecimientos[]>([]);


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
                    setSelectedMicrored(''); // Reset microred
                    setEstablecimientosOptions([]); // Reset establecimientos
                } catch (error) {
                    console.error('Error cargando microredes:', error);
                }
            }
        };
        loadMicroredes();
    }, [selectedRed]);

    // Cargar establecimientos cuando cambia la microred seleccionada
    useEffect(() => {
        const loadEstablecimientos = async () => {
            if (selectedRed && selectedMicrored) {
                try {
                    const establecimientosData = await accessoriesService.getEstablecimientosByNombreRedMicroRed(selectedRed, selectedMicrored);
                    setEstablecimientosOptions(establecimientosData);
                    setSelectedEstablecimiento(''); // Reset establecimiento
                } catch (error) {
                    console.error('Error cargando establecimientos:', error);
                }
            }
        };
        loadEstablecimientos();
    }, [selectedRed, selectedMicrored]);

    const handleExportar = () => {
        // Lógica de exportación, por ahora solo un log
        console.log("Exportando datos..." + 'searchResults');
        // Puedes agregar la lógica para generar un archivo .csv o .xlsx aquí
    };








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
                        <h1 className="text-2xl font-bold">REPORTE OPERACIONAL GENERAL MORBILIDAD</h1>
                        <p className="text-blue-100">Fuente: HIS MINSA - Actualizado al 31/10/2025</p>
                    </div>
                </div>
                <Link to="/home/reportes/operacionales" className="flex items-center justify-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg transition-colors duration-200 hover:bg-opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            {/* Contenedor principal de la aplicación */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-800 dark:text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                    REPORTE GENERAL DE MORBILIDAD
                </h2>
                <div className="border-b bg-gray-300 dark:bg-gray-700 rounded-lg shadow-sm border-gray-200 dark:border-gray-700 mt-3 p-6">
                    <h2 className="flex items-center gap-2 text-1xl font-semibold text-gray-800 dark:text-white">
                        Tipo de reporte (*)
                    </h2>
                    <nav className="flex space-x-0 rounded-lg mt-3" aria-label="Tabs">
                        {[
                            { id: 'general', name: 'General Morbilidad', active: selectedTab === 'general' },
                            { id: 'morbilidad', name: 'Morbilidad Agrupado', active: selectedTab === 'morbilidad' },
                            { id: 'primeras', name: 'Primeras Causas de Morbilidad', active: selectedTab === 'primeras' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as 'general' | 'morbilidad' | 'primeras')}
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
                {selectedTab === 'general' && (
                    <div className="space-y-6  relative">
                        {/* Tipo de Búsqueda */}
                        <div className="grid items-center gap-4">
                            <h3 className="flex  items-center gap-2 text-1xl font-semibold text-blue-800 dark:text-blue-600 mt-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800 dark:text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 12 7 12s7-6.75 7-12c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                                </svg>

                                Filtro de Ubicacion
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mt-1">
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
                                        {/*{redesOptions.map((red) => (
                                            <option key={red} value={red}>
                                                {red}
                                            </option>
                                        ))}*/}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Micro Red:
                                    </label>
                                    <select
                                        value={selectedMicrored}
                                        onChange={(e) => setSelectedMicrored(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">---</option>
                                        {microredesOptions.map((microred) => (
                                            <option key={microred.nom_microred} value={microred.nom_microred}>
                                                {microred.nom_microred}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Establecimiento:
                                    </label>
                                    <select
                                        value={selectedEstablecimiento}
                                        onChange={(e) => setSelectedEstablecimiento(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">---</option>
                                        {establecimientosOptions.map((establecimiento) => (
                                            <option key={establecimiento.nombre_establecimiento} value={establecimiento.nombre_establecimiento}>
                                                {establecimiento.nombre_establecimiento}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                            <h3 className="flex  items-center gap-2 text-1xl font-semibold text-orange-600 dark:text-orange-600 mt-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 dark:text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 2a1 1 0 0 0-1 1v1H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1zM5 9h14v9H5V9z" />
                                </svg>
                                Período de Consulta y Configuración
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-4">

                                {/* Año */}
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Año: (*)
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
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mes Inicio: (*)
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                {/* Mes */}
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mes Final: (*)
                                    </label>
                                    <select
                                        value={selectedMonth2}
                                        onChange={(e) => setSelectedMonth2(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {months2.map((m2) => <option key={m2} value={m2}>{m2}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <button
                                        onClick={handleExportar}
                                        className="flex items-center mt-7  px-20 py-2 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        Exportar
                                    </button>
                                </div>

                            </div>

                        </div>

                    </div>
                )}


                {selectedTab === 'morbilidad' && (
                    <div className="space-y-6  relative">
                        {/* Tipo de Búsqueda */}
                        <div className="grid items-center gap-4">
                            <h3 className="flex  items-center gap-2 text-1xl font-semibold text-blue-800 dark:text-blue-600 mt-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800 dark:text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 12 7 12s7-6.75 7-12c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                                </svg>

                                Filtro de Ubicacion
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mt-1">
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
                                        {/*{redesOptions.map((red) => (
                                            <option key={red} value={red}>
                                                {red}
                                            </option>
                                        ))}*/}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Micro Red:
                                    </label>
                                    <select
                                        value={selectedMicrored}
                                        onChange={(e) => setSelectedMicrored(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">---</option>
                                        {microredesOptions.map((microred) => (
                                            <option key={microred.nom_microred} value={microred.nom_microred}>
                                                {microred.nom_microred}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Establecimiento:
                                    </label>
                                    <select
                                        value={selectedEstablecimiento}
                                        onChange={(e) => setSelectedEstablecimiento(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">---</option>
                                        {establecimientosOptions.map((establecimiento) => (
                                            <option key={establecimiento.nombre_establecimiento} value={establecimiento.nombre_establecimiento}>
                                                {establecimiento.nombre_establecimiento}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                            <h3 className="flex  items-center gap-2 text-1xl font-semibold text-orange-600 dark:text-orange-600 mt-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 dark:text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 2a1 1 0 0 0-1 1v1H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1zM5 9h14v9H5V9z" />
                                </svg>
                                Período de Consulta y Configuración
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-4">

                                {/* Año */}
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Año: (*)
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
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mes Inicio: (*)
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                {/* Mes */}
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mes Final: (*)
                                    </label>
                                    <select
                                        value={selectedMonth2}
                                        onChange={(e) => setSelectedMonth2(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {months2.map((m2) => <option key={m2} value={m2}>{m2}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <button
                                        onClick={handleExportar}
                                        className="flex items-center mt-7  px-20 py-2 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        Exportar
                                    </button>
                                </div>

                            </div>

                        </div>

                    </div>
                )}
                {selectedTab === 'primeras' && (
                    <div className="space-y-6  relative">
                        {/* Tipo de Búsqueda */}
                        <div className="grid items-center gap-4">
                            <h3 className="flex  items-center gap-2 text-1xl font-semibold text-blue-800 dark:text-blue-600 mt-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800 dark:text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 12 7 12s7-6.75 7-12c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                                </svg>

                                Filtro de Ubicacion
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mt-1">
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
                                        {/*{redesOptions.map((red) => (
                                            <option key={red} value={red}>
                                                {red}
                                            </option>
                                        ))}*/}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Micro Red:
                                    </label>
                                    <select
                                        value={selectedMicrored}
                                        onChange={(e) => setSelectedMicrored(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">---</option>
                                        {microredesOptions.map((microred) => (
                                            <option key={microred.nom_microred} value={microred.nom_microred}>
                                                {microred.nom_microred}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Establecimiento:
                                    </label>
                                    <select
                                        value={selectedEstablecimiento}
                                        onChange={(e) => setSelectedEstablecimiento(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">---</option>
                                        {establecimientosOptions.map((establecimiento) => (
                                            <option key={establecimiento.nombre_establecimiento} value={establecimiento.nombre_establecimiento}>
                                                {establecimiento.nombre_establecimiento}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                            <h3 className="flex  items-center gap-2 text-1xl font-semibold text-orange-600 dark:text-orange-600 mt-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 dark:text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 2a1 1 0 0 0-1 1v1H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1zM5 9h14v9H5V9z" />
                                </svg>
                                Período de Consulta y Configuración
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-4">

                                {/* Año */}
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Año: (*)
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
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mes Inicio: (*)
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                {/* Mes */}
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mes Final: (*)
                                    </label>
                                    <select
                                        value={selectedMonth2}
                                        onChange={(e) => setSelectedMonth2(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {months2.map((m2) => <option key={m2} value={m2}>{m2}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Límite:
                                    </label>
                                    <select
                                        value={selectedLimites}
                                        onChange={(e) => setSelectedLimites(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {limites.map((l) => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>

                            </div>

                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleExportar}
                                className="flex items-center min-w-[250px] px-20 py-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Exportar
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
