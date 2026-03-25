import { Link } from 'react-router-dom';

export default function SeguimientoNiño() {
    return (
        <div className="space-y-6 bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans dark:bg-gray-800">
            {/* Header principal */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">SEGUIMIENTO DEL NIÑO</h1>
                        <p className="text-blue-100">Fuente: HIS MINSA - Actualizado al 03/10/2025</p>
                    </div>
                </div>
                <Link to="/home/consultas/seguimiento" className="flex items-center justify-center p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg transition-colors duration-200 hover:bg-opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 sm:w-12 sm:h-12 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            {/* Contenedor principal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 3H2l7 9v7l6 3V12l7-9z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Exportar Reporte de Seguimiento del Niño
                    </h2>
                </div>

                {/* Sección de descargas */}
                <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 border-l-4 border-orange-500 p-4 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                        <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                            Descargas desde Google Drive
                        </h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Archivos Excel predefinidos por grupo de edad
                    </p>
                </div>

                {/* Cards de descarga */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card 1: Niños menores de 1 año */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md p-6 flex flex-col items-center">
                        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
                            <svg className="w-12 h-12 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            NIÑOS MENORES DE 1 AÑO
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                            Archivo Excel con datos de seguimiento para niños menores de 12 meses
                        </p>
                        
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 mb-3">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            DESCARGAR DESDE DRIVE
                        </button>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Descarga segura desde el servidor</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Actualizado mensualmente</span>
                        </div>
                    </div>

                    {/* Card 2: Niños de 1 año */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md p-6 flex flex-col items-center">
                        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-4">
                            <svg className="w-12 h-12 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                            NIÑOS DE 1 AÑO
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                            Archivo Excel con datos de seguimiento para niños de 12 a 23 meses
                        </p>
                        
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 mb-3">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                            DESCARGAR DESDE DRIVE
                        </button>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Descarga segura desde el servidor</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Actualizado mensualmente</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
