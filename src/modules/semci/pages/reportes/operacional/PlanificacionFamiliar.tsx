import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//import { redes } from '../../../../core/utils/accesories';
import { accessoriesService } from '../../../../settings/services/accessoriesService';
import type { microredes, establecimientos } from '../../../../settings/services/accessoriesService';



const years = ['--', '2025', '2024', '2023', '2022', '2021'];
const months = [
    '--', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];
const months2 = [
    '--', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];




export default function PlanificacionFamiliar() {
    const [selectedRed, setSelectedRed] = useState<string>('');
    const [selectedMicrored, setSelectedMicrored] = useState<string>('');
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState('--');
    const [selectedMonth, setSelectedMonth] = useState('--');
    const [selectedMonth2, setSelectedMonth2] = useState('--');


    // Estados para las opciones de los selectores dinámicos
    //const [redesOptions, setRedesOptions] = useState<string[]>([]);
    const [microredesOptions, setMicroredesOptions] = useState<microredes[]>([]);
    const [establecimientosOptions, setEstablecimientosOptions] = useState<establecimientos[]>([]);


    // Cargar redes al montar el componente
    /*useEffect(() => {
        const loadRedes = () => {
            //const redesList = redes.map(r => r.nombre_red);
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
        console.log("Exportando datos...", "searchResults");
        // Puedes agregar la lógica para generar un archivo .csv o .xlsx aquí
    };


    return (
        <div className="space-y-6">
            {/* Header principal */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">REPORTE OPERACIONAL PLANIFICACION FAMILIAR</h1>
                        <p className="text-blue-100">Fuente: HIS MINSA - Actualizado al 29/10/2025</p>
                    </div>
                </div>

                <Link to="/home/reportes/operacionales" className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
                    <div className="flex items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-800 dark:text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                    REPORTE OPERACIONAL DE PLANIFICACION FAMILIAR
                </h2>
                <div className="grid items-center gap-4 mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Red:
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-4">
                        {/* Año */}
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                AÑO: (*)
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
                                MES INICIO: (*)
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
                                MES FINAL: (*)
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

        </div>

    )
}