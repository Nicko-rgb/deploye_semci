import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MapFilters {
    tipoMapa: 'calor' | 'georeferenciacion';
    jurisdiccion: 'mostrar' | 'ocultar';
    año: string;
    semanaEpidemiologica: string;
    tipoDengue: string;
}

export default function MapaDengue() {
    const [filters, setFilters] = useState<MapFilters>({
        tipoMapa: 'calor',
        jurisdiccion: 'mostrar',
        año: '---',
        semanaEpidemiologica: '---',
        tipoDengue: '---'
    });

    const [años, setAños] = useState<string[]>([]);
    const [semanas, setSemanas] = useState<string[]>([]);
    const [tiposDengue, setTiposDengue] = useState<string[]>([]);

    useEffect(() => {
        loadSelectOptions();
    }, []);

    const loadSelectOptions = () => {
        const currentYear = new Date().getFullYear();
        const añosArray = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
        setAños(['---', ...añosArray]);

        // Generar semanas epidemiológicas (1-52)
        const semanasArray = Array.from({ length: 52 }, (_, i) => `Semana ${i + 1}`);
        setSemanas(['---', ...semanasArray]);

        // Tipos de dengue
        setTiposDengue([
            '---',
            'Dengue Sin Señales de Alarma',
            'Dengue Con Señales de Alarma',
            'Dengue Grave',
            'Todos'
        ]);
    };

    const handleFilterChange = (field: keyof MapFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGenerarMapa = () => {
        
        if (filters.año === '---') {
            alert('Por favor seleccione un año');
            return;
        }

        console.log('Generando mapa con filtros:', filters);
    };

    return (
        <div className="p-4 max-w-full mx-auto">
            {/* Header */}
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Mapa de Calor y/o Geolocalización DENGUE</h1>
                            <p className="text-blue-100">Sistema de Visualización Geográfica</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center justify-between">
                        <Link to="/home/epidemiologia" className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
                            <div className="flex items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Panel de Filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                {/* Tipo de Mapa y Jurisdicción */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    {/* Tipo de Mapa */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                            Tipo de Mapa
                        </h3>
                        <div className="flex items-center gap-20">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="tipoMapa"
                                    value="calor"
                                    checked={filters.tipoMapa === 'calor'}
                                    onChange={(e) => handleFilterChange('tipoMapa', e.target.value as 'calor' | 'georeferenciacion')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Mapa de Calor</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="tipoMapa"
                                    value="georeferenciacion"
                                    checked={filters.tipoMapa === 'georeferenciacion'}
                                    onChange={(e) => handleFilterChange('tipoMapa', e.target.value as 'calor' | 'georeferenciacion')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Georeferenciación</span>
                            </label>
                        </div>
                    </div>

                    {/* Jurisdicción EESS */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                            Jurisdicción EESS
                        </h3>
                        <div className="flex items-center gap-20">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="jurisdiccion"
                                    value="mostrar"
                                    checked={filters.jurisdiccion === 'mostrar'}
                                    onChange={(e) => handleFilterChange('jurisdiccion', e.target.value as 'mostrar' | 'ocultar')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Mostrar</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="jurisdiccion"
                                    value="ocultar"
                                    checked={filters.jurisdiccion === 'ocultar'}
                                    onChange={(e) => handleFilterChange('jurisdiccion', e.target.value as 'mostrar' | 'ocultar')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Ocultar</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Selectores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Año */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            AÑO <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={filters.año}
                            onChange={(e) => handleFilterChange('año', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {años.map((año) => (
                                <option key={año} value={año}>
                                    {año}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Semana Epidemiológica */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Semana Epidemiológica
                        </label>
                        <select
                            value={filters.semanaEpidemiologica}
                            onChange={(e) => handleFilterChange('semanaEpidemiologica', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {semanas.map((semana) => (
                                <option key={semana} value={semana}>
                                    {semana}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de Dengue */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Dengue
                        </label>
                        <select
                            value={filters.tipoDengue}
                            onChange={(e) => handleFilterChange('tipoDengue', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {tiposDengue.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Botón Generar Mapa */}
                <div className="mt-6 flex items-center justify-center ">
                    <button
                        onClick={handleGenerarMapa}
                        className=" bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Generar Mapa
                    </button>
                </div>
            </div>

            {/* Contenedor del Mapa */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium mb-2">
                            Mapa de Dengue
                        </p>
                        <p className="text-gray-400 text-sm">
                            Seleccione los filtros y haga clic en "Generar Mapa" para visualizar los datos
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
