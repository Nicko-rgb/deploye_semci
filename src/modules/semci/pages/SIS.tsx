import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBackToApp } from '../../../core/hooks/useBackToApp';

interface OpcionCard {
  id: string;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  ruta: string;
  badge?: string;
}

const opciones: OpcionCard[] = [
  {
    id: 'sis-indicadores',
    titulo: 'Indicadores',
    descripcion: 'Indicadores del Sistema Integral de Salud',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'from-red-500 to-red-600',
    ruta: '/home/sis/indicadores',
    //badge: 'Vigente'
  },
  /*{
    id: 'sis-2024',
    titulo: 'SIS 2024',
    descripcion: 'Indicadores del Sistema Integral de Salud para el año 2024',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-teal-500 to-teal-600',
    ruta: '/dashboard/indicadores/sis/2024',
    badge: 'Completado'
  },
  {
    id: 'sis-2023',
    titulo: 'SIS 2023',
    descripcion: 'Indicadores del Sistema Integral de Salud para el año 2023',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: 'from-indigo-500 to-indigo-600',
    ruta: '/dashboard/indicadores/sis/2023',
    badge: 'Archivado'
  },*/
  /*{
    id: 'sis-poblacion',
    titulo: 'Población Afiliada',
    descripcion: 'Estadísticas y métricas de la población afiliada al SIS',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'from-orange-500 to-orange-600',
    ruta: '/dashboard/indicadores/sis/poblacion',
  },*/
  {
    id: 'sis-seguimientos',
    titulo: 'Seguimientos',
    descripcion: 'Indicadores de seguimientos de pacientes',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: 'from-pink-500 to-pink-600',
    ruta: '/home/sis/seguimientos',
  },
  /*{
    id: 'sis-cobertura',
    titulo: 'Cobertura Territorial',
    descripcion: 'Análisis de cobertura del SIS por regiones y establecimientos',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'from-cyan-500 to-cyan-600',
    ruta: '/dashboard/indicadores/sis/cobertura',
  }*/
];

export default function SIS() {
  const backLink = useBackToApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleCardClick = (ruta: string) => {
    navigate(ruta);
  };

  const filteredOpciones = opciones.filter(opcion =>
    opcion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opcion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full dark:bg-gray-800 shadow-lg">
              {/* Botón de inicio, se empuja al lado derecho */}
              <Link to={backLink} className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
                <svg className="w-10 h-10 text-red-600 dark:text-red-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
                </svg>
              </Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ¿Qué Deseas Hacer Hoy?
          </h1>
        </div>

        {/* Barra de búsqueda */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="Buscar indicadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpciones.map((opcion) => (
            <div
              key={opcion.id}
              onClick={() => handleCardClick(opcion.ruta)}
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1  overflow-hidden group"
            >
              {/* Header del card con gradiente */}
              <div className={`bg-gradient-to-r ${opcion.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 opacity-20">
                  <div className="w-32 h-32">
                    {opcion.icon}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {opcion.icon}
                    </div>
                    {opcion.badge && (
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                        {opcion.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{opcion.titulo}</h3>
                </div>
              </div>

              {/* Contenido del card */}
              <div className="p-6 dark:bg-gray-800 shadow-sm">
                <p className="text-gray-600 dark:text-white mb-4 leading-relaxed">
                  {opcion.descripcion}
                </p>

                <div className="flex items-center text-red-600 font-medium group-hover:text-red-700 transition-colors">
                  <span>Ver indicadores</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredOpciones.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron resultados</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Intenta con otros términos de búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
