import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useBackToApp } from '../../../../core/hooks/useBackToApp';

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
    id: 'seguimiento-materno',
    titulo: 'Seguimiento de Materno',
    descripcion: 'Seguimiento y control prenatal, parto y puerperio de gestantes',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'from-pink-500 to-pink-600',
    ruta: '/home/consultas/seguimiento/seguimiento-materno',
    badge: 'Activo'
  },
  {
    id: 'niño',
    titulo: 'Seguimiento de Niño',
    descripcion: 'Seguimiento de crecimiento, desarrollo y vacunación infantil',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
    ruta: '/home/consultas/seguimiento/seguimiento-niño',
    badge: 'Nuevo'
  }
];

export default function Seguimiento() {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6 gap-3">
            <div>
              <div className=" flex justify-center items-center p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                
                {/* Botón de inicio, se empuja al lado derecho */}
                <Link to={backLink} className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
                  <svg className="w-12 h-12 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='black'>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
                  </svg>
                </Link>
              </div>
            </div>

          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Seguimiento de Pacientes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Selecciona el tipo de seguimiento que deseas realizar para brindar una atención integral y personalizada
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="Buscar tipo de seguimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {opcionesFiltradas.map((opcion) => (
            <div
              key={opcion.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${hoveredCard === opcion.id ? 'ring-4 ring-green-500 ring-opacity-50' : ''
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

        {/* Información adicional */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Información del Seguimiento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-800 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Seguimiento Materno</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Control integral de la salud materna durante todo el proceso reproductivo
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Seguimiento de Niño</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Monitoreo del crecimiento, desarrollo y estado nutricional infantil
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Beneficios del Seguimiento</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Detección temprana de complicaciones</li>
                  <li>• Mejora en los indicadores de salud</li>
                  <li>• Atención personalizada y continua</li>
                  <li>• Reducción de la morbimortalidad</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Próximamente</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Nuevos módulos de seguimiento para adolescentes, adultos mayores y enfermedades crónicas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sistema de Seguimiento de Pacientes - SEMCI v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
