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
  /*{
    id: 'vigilancia',
    titulo: 'Vigilancia Epidemiológica',
    descripcion: 'Monitoreo y seguimiento de enfermedades de notificación obligatoria',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600 text-white',
    ruta: '/home/epidemiologia/vigilancia',
    badge: 'Nuevo'
  },
  {
    id: 'brotes',
    titulo: 'Investigación de Brotes',
    descripcion: 'Análisis y control de brotes epidémicos y emergencias sanitarias',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.081 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    color: 'from-red-500 to-red-600',
    ruta: '/home/epidemiologia/brotes'
  },*/
  {
    id: 'analisis',
    titulo: 'Boletín Epidemiológico',
    descripcion: 'Boletín Epidemiológico, estadístico y tendencias de salud poblacional',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'from-purple-500 to-purple-600',
    ruta: '/home/epidemiologia/analisis'
  },
  {
    id: 'paciente-dengue',
    titulo: 'Paciente Dengue',
    descripcion: 'Lista de Pacientes Dengue confirmado',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8"  viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h12" />
        <path d="M8 8l3 3" />
        <path d="M16 8l-3 3" />
        <path d="M8 16l3-3" />
        <path d="M16 16l-3-3" />
      </svg>
    ),
    color: 'from-green-500 to-green-600',
    ruta: '/home/epidemiologia/paciente-dengue'
  },
  {
    id: 'mapa-dengue',
    titulo: 'Mapas Dengue',
    descripcion: 'Visualización de datos epidemiológicos ',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'from-yellow-500 to-orange-500',
    ruta: '/home/epidemiologia/mapa-dengue'
  },
  /*{
    id: 'inmunizaciones',
    titulo: 'Control de Inmunizaciones',
    descripcion: 'Seguimiento y control de programas de vacunación',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'from-pink-500 to-pink-600',
    ruta: '/home/epidemiologia/inmunizaciones'
  },
  {
    id: 'laboratorio',
    titulo: 'Resultados de Laboratorio',
    descripcion: 'Integración y análisis de resultados de laboratorio',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: 'from-indigo-500 to-indigo-600',
    ruta: '/home/epidemiologia/laboratorio'
  },
  {
    id: 'reportes',
    titulo: 'Reportes Epidemiológicos',
    descripcion: 'Generación de reportes y boletines epidemiológicos',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'from-teal-500 to-teal-600',
    ruta: '/home/epidemiologia/reportes'
  },
  {
    id: 'alertas',
    titulo: 'Sistema de Alertas',
    descripcion: 'Configuración y gestión de alertas epidemiológicas',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5zM4 19h8v-2H4v2zm0-4h8v-2H4v2zm0-4h8V9H4v2zm0-4h8V5H4v2z" />
      </svg>
    ),
    color: 'from-orange-500 to-red-500',
    ruta: '/home/epidemiologia/alertas',
    badge: 'Activo'
  }*/
];

export default function Epidemiologia() {
  const backLink = useBackToApp();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const opcionesFiltradas = opciones.filter(opcion =>
    opcion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opcion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (ruta: string) => {
    navigate(ruta);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">

          <div className="flex justify-center items-center mb-6 gap-3">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              {/* Botón de inicio, se empuja al lado derecho */}
              <Link to={backLink} className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
                </svg>
              </Link>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Qué Deseas Hacer Hoy?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explora las herramientas de epidemiología disponibles para el monitoreo y análisis de la salud poblacional
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar herramientas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opcionesFiltradas.map((opcion) => (
            <div
              key={opcion.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${hoveredCard === opcion.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                }`}
              onMouseEnter={() => setHoveredCard(opcion.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(opcion.ruta)}
            >
              {/* Badge */}
              {opcion.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${opcion.badge === 'Nuevo'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}>
                    {opcion.badge}
                  </span>
                </div>
              )}

              {/* Gradient Header */}
              <div className={`h-32 bg-gradient-to-br ${opcion.color} p-6 flex items-center justify-center`}>
                <div className="text-white">
                  {opcion.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {opcion.titulo}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {opcion.descripcion}
                </p>
              </div>

              {/* Hover Effect */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${opcion.color} transform transition-all duration-300 ${hoveredCard === opcion.id ? 'scale-x-100' : 'scale-x-0'
                }`} />
            </div>
          ))}
        </div>

        {/* No results */}
        {opcionesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron resultados</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Intenta con otros términos de búsqueda.
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sistema de Epidemiología - SEMCI v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
