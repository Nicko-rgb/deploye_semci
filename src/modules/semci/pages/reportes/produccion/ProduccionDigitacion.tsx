import { useState } from 'react';
import { Link } from 'react-router-dom';




// Datos de catálogo
const years = ['--', '2021', '2022', '2023', '2024', '2025', '2026'];



// Componente principal de React
export default function ProduccionDigitacion() {
    const [selectedTab, setSelectedTab] = useState<'reporte-produccion' | 'produccion-oportuna'>('reporte-produccion');
    const [tipoFecha, setTipoFecha] = useState<'semana' | 'mensual' | 'entre-fecha'>('semana');
    const [selectedYear, setSelectedYear] = useState('--');

    //const [loadingBusqueda, setLoadingBusqueda] = useState(false);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');


    // Para mostrar detalle SPR




    const handleBuscar = async () => {
    }

    const handleExportar = () => {
        // Lógica de exportación, por ahora solo un log
        console.log("Exportando datos...");
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
                        <h1 className="text-2xl font-bold">Fuente: HIS MINSA</h1>
                        <p className="text-blue-100">Actualizado al 22/09/2025 11:00:00</p>
                    </div>
                </div>
                <Link to="/home/reportes/produccion" className="flex items-center justify-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg transition-colors duration-200 hover:bg-opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            {/* Contenedor principal de la aplicación */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Reporte Producción de Digitadores HIS
                    </h2>
                </div>
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex space-x-0 rounded-lg" aria-label="Tabs">
                        {[
                            { id: 'reporte-produccion', name: 'Reporte Produccion', active: selectedTab === 'reporte-produccion' },
                            { id: 'produccion-oportuna', name: 'Produccion Oportuna Descarga', active: selectedTab === 'produccion-oportuna' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as 'reporte-produccion' | 'produccion-oportuna')}
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
                {selectedTab === 'reporte-produccion' && (
                    <div className="space-y-6 relative">
                        {/* Tipo de Búsqueda */}
                        <div className="mb-6">
                            <div className="flex gap-20">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="semana"
                                        checked={tipoFecha === 'semana'}
                                        onChange={(e) => setTipoFecha(e.target.value as 'semana' | 'mensual' | 'entre-fecha')}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Semana</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="mensual"
                                        checked={tipoFecha === 'mensual'}
                                        onChange={(e) => setTipoFecha(e.target.value as 'semana' | 'mensual' | 'entre-fecha')}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Mensualizado</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="entre-fecha"
                                        checked={tipoFecha === 'entre-fecha'}
                                        onChange={(e) => setTipoFecha(e.target.value as 'semana' | 'mensual' | 'entre-fecha')}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Entre Fechas</span>
                                </label>
                            </div>
                        </div>

                        {/* Formulario de búsqueda */}
                        <div>
                            {tipoFecha === 'semana' && (
                                <div className="flex items-center justify-between gap-5">
                                    {/* Fecha de: */}
                                    <div className="flex-1 min-w-min[200px]">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ">
                                            Fecha de: (*)
                                        </label>
                                        <input
                                            type="date"
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    {/* Mes */}
                                    <div className="flex-1 min-w-min[200px]">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ">
                                            Fecha hasta: (*)
                                        </label>
                                        <input
                                            type="date"
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        onClick={handleBuscar}
                                        disabled={/*loadingBusqueda*/ false}
                                        className="flex items-center px-20 py-2  mt-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        {/*{loadingBusqueda ? (*/}
                                        {false ? (
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        )}

                                        <span className="ml-2">Buscar</span>
                                    </button>
                                    <button
                                        onClick={handleExportar}
                                        className="flex items-center px-20 py-2  mt-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        Exportar
                                    </button>
                                </div>
                            )}
                            {tipoFecha === 'mensual' && (
                                <>
                                    <div className="flex flex-wrap items-center justify-items-start gap-5">
                                        <div className="">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                AÑO: (*)
                                            </label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                className="min-w-[400px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            >
                                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleBuscar}
                                            disabled={/*loadingBusqueda*/ false}
                                            className="flex items-center  px-20 py-2  mt-5 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            {/*{loadingBusqueda ? (*/}
                                            {false ? (
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            )}

                                            <span className="ml-2">Buscar</span>
                                        </button>
                                        <button
                                            onClick={handleExportar}
                                            className="flex items-center px-20 py-2  mt-5 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            Exportar
                                        </button>
                                    </div>
                                </>

                            )}

                            {tipoFecha === 'entre-fecha' && (
                                <>
                                    <div className="flex items-center justify-between gap-5">
                                        {/* Fecha de: */}
                                        <div className="flex-1 min-w-min[200px]">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ">
                                                Fecha de: (*)
                                            </label>
                                            <input
                                                type="date"
                                                value={fechaInicio}
                                                onChange={(e) => setFechaInicio(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                            />
                                        </div>
                                        {/* Mes */}
                                        <div className="flex-1 min-w-min[200px]">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ">
                                                Fecha hasta: (*)
                                            </label>
                                            <input
                                                type="date"
                                                value={fechaFin}
                                                onChange={(e) => setFechaFin(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                            />
                                        </div>
                                        <button
                                            onClick={handleBuscar}
                                            disabled={/*loadingBusqueda*/ false}
                                            className="flex items-center px-20 py-2  mt-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            {/*{loadingBusqueda ? (*/}
                                            {false ? (
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            )}

                                            <span className="ml-2">Buscar</span>
                                        </button>
                                        <button
                                            onClick={handleExportar}
                                            className="flex items-center px-20 py-2  mt-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            Exportar
                                        </button>
                                    </div>
                                </>
                            )}


                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-center gap-4 mt-6">

                        </div>
                        <div className=' relative'>
                            {/*{loadingBusqueda && (*/}
                            {false && (
                                <div className="absolute rounded-lg inset-0 bg-black/10 backdrop-blur-[1px] z-20 flex items-center justify-center ">
                                    <div className=" dark:bg-gray-800 rounded-md px-4 py-2 mt-40">
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0..." />
                                            </svg>
                                            <span className="text-1xl">Generando resultados…</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}


                {selectedTab === 'produccion-oportuna' && (
                    <div className="space-y-6  relative">
                        <div className="flex flex-wrap items-center justify-between gap-5">
                            {/* Fecha de: */}
                            <div className="flex-1 min-w-min[200px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ">
                                    Fecha de: (*)
                                </label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            {/* Mes */}
                            <div className="flex-1 min-w-min[200px]">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ">
                                    Fecha hasta: (*)
                                </label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <button
                                onClick={handleExportar}
                                className="flex items-center px-20 py-2  mt-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200"
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
