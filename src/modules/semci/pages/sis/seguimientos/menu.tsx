import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
    id: 'cancer-uterino',
    titulo: 'Cáncer Uterino',
    descripcion: 'Seguimiento de pacientes con diagnóstico de cáncer uterino',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'from-pink-500 to-pink-600',
    ruta: '/home/sis/seguimiento/cancer-uterino',
    badge: 'Nuevo'
  },
  {
    id: 'cancer-mama',
    titulo: 'Cáncer de Mama',
    descripcion: 'Seguimiento de pacientes con diagnóstico de cáncer de mama',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
    ruta: '/home/sis/seguimiento/cancer-mama',
    badge: 'Nuevo'
  },
  {
    id: 'presion-arterial',
    titulo: 'Presión Arterial',
    descripcion: 'Seguimiento de pacientes con diagnóstico de presión arterial',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
    ruta: '/home/sis/seguimiento/presion-arterial',
    badge: 'Nuevo'
  },
  // ITEM CANCER CERVICO UTERINO
  {
    id: 'cancer-cervico',
    titulo: 'Cáncer Cervico Uterino',
    descripcion: 'Seguimiento de pacientes con diagnóstico de cáncer cervico uterino',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-pink-500 to-pink-600',
    ruta: '/home/sis/seguimiento/cancer-cervico',
    badge: 'Nuevo'
  },
  // ITEM HIPERTENSION DIABETES
  {
    id: 'hipertension-diabetes',
    titulo: 'Hipertensión y Diabetes',
    descripcion: 'Seguimiento de pacientes con diagnóstico de hipertensión y diabetes',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    color: 'from-red-500 to-red-600',
    ruta: '/home/sis/seguimiento/hipertension-diabetes',
    badge: 'Nuevo'
  },
  // ITEM REPORTE DE ATENCIONES GENERAL
  {
    id: 'reporte-atenciones-general',
    titulo: 'Reporte de Atenciones General',
    descripcion: 'Reporte general de atenciones de pacientes del sistema SIS',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    color: 'from-green-500 to-green-600',
    ruta: '/home/sis/seguimiento/reporte-atenciones-general',
    badge: 'Nuevo'
  },
  // ITEM CONSULTA EXTERNA MEDICO ESPECIALISTA
  {
    id: 'consulta-externa-especialista',
    titulo: 'Consulta Externa (Médico Especialista)',
    descripcion: 'Seguimiento de consultas externas realizadas por médicos especialistas',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'from-indigo-500 to-indigo-600',
    ruta: '/home/sis/seguimiento/consulta-externa-especialista',
    badge: 'Nuevo'
  },


];

const MenuSeguimientos: React.FC = () => {
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
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
          <div className="flex justify-center items-center mb-6">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <Link to="/home/sis" className="flex items-center justify-between  text-white hover:text-gray-300 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10  text-red-600">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Seguimiento de Pacientes SIS
          </h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mx-auto">
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

      </div>
    </div>
  );
};

export default MenuSeguimientos;