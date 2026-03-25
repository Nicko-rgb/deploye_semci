import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//import { redes } from '../../../../core/utils/accesories';
import { accessoriesService } from '../../../../settings/services/accessoriesService';
import type { microredes, establecimientos } from '../../../../settings/services/accessoriesService';


const years = ['--', '2025', '2024', '2023', '2022', '2021'];


export default function SeguimientoMaterno() {
    const [selectedTab, setSelectedTab] = useState<'gestante' | 'estadistico'>('gestante');
    const [tipoBusqueda, setTipoBusqueda] = useState<'exportar' | 'busqueda'>('exportar');
    const [selectedRed, setSelectedRed] = useState<string>('');
    const [selectedMicrored, setSelectedMicrored] = useState<string>('');
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState('--');
    const [searchDocumento, setSearchDocumento] = useState<string>('');

    
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
                    setSelectedMicrored('');
                    setEstablecimientosOptions([]);
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
                    setSelectedEstablecimiento('');
                } catch (error) {
                    console.error('Error cargando establecimientos:', error);
                }
            }
        };
        loadEstablecimientos();
    }, [selectedRed, selectedMicrored]);

    const handleExportar = () => {
        console.log("Exportando datos..." + 'searchResults');
    };

    const handleBuscar = async () => {
    }

    const handleInputChange = (setter: (value: string) => void, value: string) => {
        setter(value);
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
                        <h1 className="text-2xl font-bold">SEGUIMIENTO MATERNO</h1>
                        <p className="text-blue-100">Fuente: HIS MINSA - Actualizado al 31/10/2025</p>
                    </div>
                </div>
                <Link to="/home/consultas/seguimiento" className="flex items-center justify-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg transition-colors duration-200 hover:bg-opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            {/* Contenedor principal de la aplicación */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="flex items-center gap-2 text-1xl font-semibold text-gray-800 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 3H2l7 9v7l6 3V12l7-9z" />
                    </svg>
                    Seguimiento Materno
                </h2>
                <div className="border-b rounded-lg shadow-sm border-gray-200 dark:border-gray-700 mt-4">
                    <nav className="flex space-x-0 rounded-lg mt-3" aria-label="Tabs">
                        {[
                            { id: 'gestante', name: 'Seguimiento Gestante', active: selectedTab === 'gestante' },
                            { id: 'estadistico', name: 'Dashboard Estadistico', active: selectedTab === 'estadistico' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as 'gestante' | 'estadistico')}
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
                {selectedTab === 'gestante' && (
                    <div className="space-y-6 relative">
                        <h3 className="flex items-center gap-2 text-1xl font-semibold text-blue-800 dark:text-blue-600 mt-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                            </svg>
                            Filtro de Acción
                        </h3>

                        {/* Tipo de Búsqueda */}
                        <div className="mb-6">
                            <div className="flex gap-20">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="exportar"
                                        checked={tipoBusqueda === 'exportar'}
                                        onChange={(e) => setTipoBusqueda(e.target.value as 'exportar' | 'busqueda')}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Exportar Padrón Completo</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="busqueda"
                                        checked={tipoBusqueda === 'busqueda'}
                                        onChange={(e) => setTipoBusqueda(e.target.value as 'exportar' | 'busqueda')}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Buscar Gestante Especifica</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            {tipoBusqueda === 'exportar' && (
                                <div className="grid items-center gap-4">
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
                                                {/*redesOptions.map((red) => (
                                                    <option key={red} value={red}>
                                                        {red}
                                                    </option>
                                                ))*/}
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-4">
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

                                        <div className="flex-1 min-w-[180px]">
                                            <button
                                                onClick={handleExportar}
                                                className="flex items-center mt-7 px-20 py-2 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                Exportar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tipoBusqueda === 'busqueda' && (
                                <>
                                    <div className='grid grid-cols-2 md:grid-cols-3 gap-20 mb-4'>
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Numero de Documento:
                                            </label>
                                            <input
                                                type="text"
                                                value={searchDocumento}
                                                onChange={(e) => handleInputChange(setSearchDocumento, e.target.value)}
                                                placeholder="Escribe el Número de Documento para buscar"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <button
                                                onClick={handleBuscar}
                                                className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 font-medium mt-7"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Buscar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabla de datos*/}
                                    <div className="mt-8">
                                        <div className="bg-teal-600 text-white px-4 py-2.5 rounded-t-md flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h4 className="text-sm font-semibold">
                                                Datos del Seguimiento de la Gestante
                                            </h4>
                                        </div>

                                        <div className="overflow-x-auto border border-gray-300 dark:border-gray-600">
                                            <table className="w-full text-sm border-collapse">
                                                <tbody className="bg-white dark:bg-gray-700">
                                                    <tr className="border-b border-gray-300 dark:border-gray-600">
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 w-1/12">
                                                            NRO. DOCUMENTO:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 w-2/12">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 w-1/12">
                                                            NOMBRES:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 w-3/12">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 w-1/12">
                                                            FECHA NAC.:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 w-2/12">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 w-1/12">
                                                            EDAD:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-900 dark:text-white w-1/12">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                    </tr>

                                                    
                                                    <tr className="border-b border-gray-300 dark:border-gray-600">
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600">
                                                            FECHA UM.:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600">
                                                            FECHA 1° APN:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600">
                                                            FECHA PP.:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600">
                                                            TRIMESTRE GESTACION:
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-900 dark:text-white">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                    </tr>

                                                    
                                                    <tr className="border-b-2 border-gray-400 dark:border-gray-500">
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600">
                                                            ESTABLECIMIENTO:
                                                        </td>
                                                        <td colSpan={7} className="px-3 py-2.5 text-gray-900 dark:text-white">
                                                            <input
                                                                type="text"
                                                                className="w-full border-0 bg-transparent focus:outline-none"
                                                                readOnly
                                                            />
                                                        </td>
                                                    </tr>

                                                    
                                                    <tr className="bg-gray-200 dark:bg-gray-600">
                                                        <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600">
                                                            ATENCIONES PRENATALES
                                                        </td>
                                                        <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white text-center border-r border-gray-300 dark:border-gray-600">
                                                            ATENCION 1
                                                        </td>
                                                        <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white text-center border-r border-gray-300 dark:border-gray-600">
                                                            ATENCION 2
                                                        </td>
                                                        <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white text-center border-r border-gray-300 dark:border-gray-600">
                                                            ATENCION 3
                                                        </td>
                                                        <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white text-center border-r border-gray-300 dark:border-gray-600">
                                                            ATENCION 4
                                                        </td>
                                                        <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white text-center border-r border-gray-300 dark:border-gray-600">
                                                            ATENCION 5
                                                        </td>
                                                        <td colSpan={2} className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white text-center">
                                                            ATENCION 6
                                                        </td>
                                                    </tr>

                                                
                                                    {[
                                                        'Fecha',
                                                        'Ácido Fólico',
                                                        'Sulfato Ferroso',
                                                        'Examen de Hemoglobina',
                                                        'Examen de SIFILIS',
                                                        'Examen de VIH',
                                                        'Examen de ORINA',
                                                        'Bateria Completa 1',
                                                        'Visita Domic.',
                                                        'Plan de Parto'
                                                    ].map((label, index) => (
                                                        <tr key={index} className="border-b border-gray-300 dark:border-gray-600">
                                                            <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600">
                                                                {label}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border-0 bg-transparent focus:outline-none"
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border-0 bg-transparent focus:outline-none"
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border-0 bg-transparent focus:outline-none"
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border-0 bg-transparent focus:outline-none"
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border-0 bg-transparent focus:outline-none"
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td colSpan={2} className="px-3 py-2.5 text-gray-900 dark:text-white">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border-0 bg-transparent focus:outline-none"
                                                                    readOnly
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                )}

                {selectedTab === 'estadistico' && (
                    <div className="space-y-6 relative">
                        <h2 className="flex items-center gap-2 text-1xl font-semibold text-gray-800 dark:text-white mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 3H2l7 9v7l6 3V12l7-9z" />
                            </svg>
                            Filtro Dashboard
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mt-4">
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

                        <div className="mt-8">
                            {/* Estadísticas generales */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Gestantes</p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
                                        </div>
                                        <div className="bg-blue-600 dark:bg-blue-900 p-3 rounded-full">
                                            <svg className='w-8 h-8 text-white dark:text-white' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="48" height="48">
                                                <path d="M12 2C8.686 2 6 4.686 6 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm-2 10.5h4c.552 0 1-.448 1-1v-2h-6v2c0 .552.448 1 1 1zm-3-8h10c.552 0 1-.448 1-1V9h-12v1c0 .552.448 1 1 1zm-1 0c0-1.105.895-2 2-2h8c1.105 0 2 .895 2 2v3c0 1.105-.895 2-2 2H6c-1.105 0-2-.895-2-2v-3z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">1er Trimestre</p>
                                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
                                        </div>
                                        <div className="bg-green-600 dark:bg-green-900 p-3 rounded-full">
                                            <svg className="w-8 h-8 text-white dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">2do Trimestre</p>
                                            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">0</p>
                                        </div>
                                        <div className="bg-teal-600 dark:bg-teal-900 p-3 rounded-full">
                                            <svg className='text-white dark:text-white w-8 h-8' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">3er Trimestre</p>
                                            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">0</p>
                                        </div>
                                        <div className="bg-teal-600 dark:bg-teal-900 p-3 rounded-full">
                                            <svg className='text-white dark:text-white w-8 h-8' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="#0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                <polyline points="7 12 9 10 11 12 13 10 15 12 17 10" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Gráfico de Barras */}
                            <div className="mt-8 mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                Avance de Atenciones en Mujeres, que durante su gestacion recibieron el paquete integrado de servicios
                                            </h3>
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Descargar PNG</span>
                                        </button>
                                    </div>

                                    
                                    <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-6 overflow-visible" style={{ height: '550px', paddingBottom: '150px' }}>
                                        
                                        <div className="absolute left-2 top-4 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400 w-10 pr-2 text-right" style={{ height: '350px' }}>
                                            <span>1,558</span>
                                            <span>1,400</span>
                                            <span>1,200</span>
                                            <span>1,000</span>
                                            <span>800</span>
                                            <span>600</span>
                                            <span>400</span>
                                            <span>200</span>
                                            <span>0</span>
                                        </div>

                                    
                                        <div className="absolute left-14 right-8 top-4 flex flex-col justify-between" style={{ height: '350px' }}>
                                            {[...Array(9)].map((_, i) => (
                                                <div key={i} className="border-t border-gray-300 dark:border-gray-600"></div>
                                            ))}
                                        </div>

                                        <div className="absolute left-14 right-8 top-4 flex items-end justify-around gap-8" style={{ height: '350px' }}>
                                            
                                            <div className="flex flex-col items-center flex-1 h-full justify-end">
                                                <div className="relative w-32 bg-gray-700 dark:bg-gray-600 rounded-t-md" style={{ height: '35%' }}>
                                                    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1">
                                                        <span className="bg-yellow-400 px-3 py-1 rounded text-xs font-bold text-gray-800">Valor</span>
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Indicador</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center flex-1 h-full justify-end">
                                                <div className="w-32 bg-blue-500 dark:bg-blue-600 rounded-t-md" style={{ height: '10%' }}></div>
                                            </div>

                                            <div className="flex flex-col items-center flex-1 h-full justify-end">
                                                <div className="w-32 bg-gray-500 dark:bg-gray-400 rounded-t-md" style={{ height: '7%' }}></div>
                                            </div>

                                            
                                            <div className="flex flex-col items-center flex-1 h-full justify-end">
                                                <div className="w-32 bg-blue-400 dark:bg-blue-300 rounded-t-md" style={{ height: '32%' }}></div>
                                            </div>
                                        </div>

                                        
                                        <div className="absolute left-1/4 top-4 w-px border-l-2 border-dashed border-gray-800 dark:border-gray-400" style={{ height: '350px' }}></div>

                                        
                                        <div className="absolute left-14 right-8 flex justify-around gap-8" style={{ top: '370px' }}>
                                            <div className="flex-1 flex justify-center">
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center leading-tight max-w-32" style={{ transform: 'rotate(-45deg)', transformOrigin: 'center top', marginTop: '40px' }}>
                                                    N° de gestantes con 6 o mas atenciones prenatales
                                                </p>
                                            </div>
                                            <div className="flex-1 flex justify-center">
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center leading-tight max-w-32" style={{ transform: 'rotate(-45deg)', transformOrigin: 'center top', marginTop: '40px' }}>
                                                    % de gestantes con 6 o mas atenciones prenatales atendidas en el primer trimestre
                                                </p>
                                            </div>
                                            <div className="flex-1 flex justify-center">
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center leading-tight max-w-32" style={{ transform: 'rotate(-45deg)', transformOrigin: 'center top', marginTop: '40px' }}>
                                                    N° de gestantes con 5 suplementos de hierro SFAC
                                                </p>
                                            </div>
                                            <div className="flex-1 flex justify-center">
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center leading-tight max-w-32" style={{ transform: 'rotate(-45deg)', transformOrigin: 'center top', marginTop: '40px' }}>
                                                    N° de gestantes con examenes auxiliares completos
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            
                            <div className="mt-8">
                                <div className="mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        Indicadores por Red de Salud
                                    </h3>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-600">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-200 dark:bg-gray-700">
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-r border-gray-300 dark:border-gray-600">
                                                    Red de Salud
                                                </th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-r border-gray-300 dark:border-gray-600">
                                                    Total Gestantes
                                                </th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-r border-gray-300 dark:border-gray-600">
                                                    6+ Atenciones
                                                </th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-r border-gray-300 dark:border-gray-600">
                                                    % 6+ Atenciones
                                                </th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-r border-gray-300 dark:border-gray-600">
                                                    5 Suplementos SFAC
                                                </th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-r border-gray-300 dark:border-gray-600">
                                                    % Suplementos SFAC
                                                </th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-r border-gray-300 dark:border-gray-600">
                                                    Examenes Auxiliares
                                                </th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b">
                                                    % Examenes Auxiliares
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800">
                                            
                                            <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-3 text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">

                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">

                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">

                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">

                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">

                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">

                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">

                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-900 dark:text-white">

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
