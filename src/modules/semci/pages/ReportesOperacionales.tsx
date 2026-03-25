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
    id: 'materno',
    titulo: 'MATERNO',
    descripcion: 'Sistema de Reporte Operacional Materno',
    icon: (
      <svg
        className='w-20 h-20'
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        color='pink'

      >
        <circle cx="22" cy="16" r="6" fill='white' />

        <path d="M10 54c0-10 8-18 18-18s18 8 18 18" fill='white' />

        <circle cx="40" cy="34" r="4" fill='white' />

        <path d="M24 40c4 2 10 2 14-2" />
        <path d="M18 44c2 4 6 6 10 6s8-2 10-6" />
        <path
          d="M32 58s16-10 16-22c0-6-4-10-10-10-4 0-6 2-6 2s-2-2-6-2c-6 0-10 4-10 10 0 12 16 22 16 22z"
          fill="none"
          color='pink'
        />
      </svg>

    ),
    color: 'from-pink-500 to-pink-600 ',
    route: '/home/reportes/operacionales/materno',
    badge: 'Nuevo'
  },
  {
    id: 'planificacion-familiar',
    titulo: 'PLANIFICACION FAMILIAR',
    descripcion: 'Sistema de Reporte Operacional de Planificacion Familiar',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="w-20 h-20 text-white"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        
        <circle cx="20" cy="20" r="5" fill="white" stroke="currentColor" />
        <circle cx="44" cy="20" r="5" fill="white" stroke="currentColor" />

        
        <path d="M14 52c0-10 6-18 12-18" />
        <path d="M50 52c0-10-6-18-12-18" />

        
        <path
          d="M32 34c-4-6-12-2-12 4 0 6 12 12 12 12s12-6 12-12c0-6-8-10-12-4z"
          fill="white"
          stroke="currentColor"
        />

        
        <line x1="10" y1="52" x2="54" y2="52" />
      </svg>


    ),
    color: 'from-red-500 to-red-600',
    route: '/home/reportes/operacionales/planificacion-familiar',
    badge: 'Nuevo'
  },
  {
    id: 'general-morbilidad',
    titulo: 'GENERAL MORBILIDAD',
    descripcion: 'Sistema de Operacional de General Morbilidad',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="w-20 h-20 text-white"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >

        <line x1="8" y1="54" x2="56" y2="54" />


        <line x1="32" y1="54" x2="32" y2="16" />
        <circle cx="32" cy="12" r="3" fill="white" />


        <line x1="16" y1="20" x2="48" y2="20" />


        <path d="M14 20c0 6 6 10 6 10s6-4 6-10" />
        <path
          d="M18 24c0 0 1.5-2 3-2s3 2 3 2"
          fill="white"
          stroke="none"
        />


        <circle cx="46" cy="26" r="5" fill="white" />


        <path
          d="M28 36c0 4 4 8 4 8s4-4 4-8c0-2-2-4-4-4s-4 2-4 4z"
          fill="white"
          stroke="none"
        />
      </svg>

    ),
    color: 'from-indigo-600 to-indigo-600',
    route: '/home/reportes/operacionales/general-morbilidad',
    badge: 'Nuevo'
  },
  {
    id: 'adolecente',
    titulo: 'ADOLECENTE',
    descripcion: 'Sistema de Operacional de Adolecentes',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="w-20 h-20 text-white"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >

        <path d="M20 16c0-3 4-6 12-6s12 3 12 6" fill="white" stroke="currentColor" />
        <path d="M18 18c6-4 28-4 34 0" />
        <circle cx="32" cy="24" r="6" fill="white" stroke="currentColor" />
        <path d="M22 36c2 6 6 8 10 8s8-2 10-8" fill="#fce7f3" stroke="currentColor" />
        <path d="M18 36c2 2 4 3 6 3" />
        <path d="M46 36c-2 2-4 3-6 3" />
        <rect x="10" y="28" width="8" height="16" rx="2" fill="white" stroke="currentColor" />
        <path d="M16 28v-4" />

        <rect x="44" y="32" width="6" height="10" rx="1" fill="white" stroke="currentColor" />
        <circle cx="47" cy="40" r="0.6" fill="currentColor" />
        <path d="M26 50c1.5 4 2.5 6 6 6s4.5-2 6-6" />
        <line x1="30" y1="56" x2="30" y2="62" />
        <line x1="38" y1="56" x2="38" y2="62" />
      </svg>

    ),
    color: 'from-teal-500 to-teal-600',
    route: '/home/reportes/operacionales/adolecente',
    badge: 'Nuevo'
  },
  {
    id: 'etapa-vida-niño',
    titulo: 'ETAPA VIDA NIÑO',
    descripcion: 'Sistema de Operacional de Etapa Vida Niño',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="w-20 h-20 text-white"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >

        <circle cx="32" cy="18" r="6" fill="white" stroke="currentColor" />


        <path d="M26 28v10a6 6 0 0 0 12 0V28" fill="white" stroke="currentColor" />


        <path d="M20 32c4-2 6-2 8 0" />
        <path d="M44 32c-4-2-6-2-8 0" />


        <path d="M28 40v10" />
        <path d="M36 40v10" />


        <circle cx="50" cy="10" r="4" fill="white" stroke="currentColor" />
        <line x1="50" y1="14" x2="38" y2="22" />


        <line x1="16" y1="50" x2="48" y2="50" />
      </svg>

    ),
    color: 'from-sky-500 to-sky-600',
    route: '/home/reportes/operacionales/etapa-vida-niño',
    badge: 'Nuevo'
  }
];

export default function ReportesOperacionales() {
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
            Reportes Opreacionales
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Accede a los accesos directos de reportes operacionales:
            para generar reportes operacionales detallados sobre las actividades médicas y administrativas
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
            <span>Sistema de Reportes Operacionales - SEMCI v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
