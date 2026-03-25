import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBackToApp } from '../../../core/hooks/useBackToApp';

interface OpcionCard {
  id: string;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  badge?: string;
}

const opciones: OpcionCard[] = [
  {
    id: 'produccion-digitacion',
    titulo: 'PRODUCCION DIGITACION',
    descripcion: 'Sistema de Reporte Producción de Digitadores HIS',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    color: 'from-yellow-500 to-yellow-600',
    route: '/home/reportes/produccion/produccion-digitacion',
    badge: 'Nuevo'
  },
  {
    id: 'reporte-profecional',
    titulo: 'REPORTE PROFECIONAL',
    descripcion: 'Sistema de Atendidos y Atenciones',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    color: 'from-red-500 to-red-600',
    route: '/home/reportes/produccion/reporte-profesional',
    badge: 'Nuevo'
  }
];

export default function ReportesProduccion() {
  const backLink = useBackToApp();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const opcionesFiltradas = opciones.filter(opcion =>
    opcion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opcion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (route: string) => {
    navigate(route);
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
            Reportes Produccion
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Accede a los accesos directos de reportes produccion: Produccion Digitacion y Reportes Profesional
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
              placeholder="Buscar por año..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {opcionesFiltradas.map((opcion) => (
            <div
              key={opcion.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${hoveredCard === opcion.id ? 'ring-4 ring-blue-300 ring-opacity-50' : ''
                }`}
              onMouseEnter={() => setHoveredCard(opcion.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(opcion.route)}
            >
              {/* Badge */}
              {opcion.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${opcion.badge === 'Vigente'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : opcion.badge === 'Completado'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                    {opcion.badge}
                  </span>
                </div>
              )}

              {/* Gradient Header */}
              <div className={`h-40 bg-gradient-to-br ${opcion.color} p-8 flex items-center justify-center`}>
                <div className="text-white">
                  {opcion.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
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
            <span>Sistema de Reportes Produccion - SEMCI v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
