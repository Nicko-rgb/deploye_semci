import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { hexToTailwindGradient, hexToTailwindText } from '../utils/accesories';

export default function Home() {
  const { user } = useAuth();
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);

  // Limpiar el contexto del aplicativo cuando se regresa a la selección
  useEffect(() => {
    sessionStorage.removeItem('currentApplicationId');
    sessionStorage.removeItem('currentApplicationCode');
  }, []);

  // Obtener las aplicaciones del usuario desde la API
  const applications = user?.applications || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative p-6 bg-white dark:bg-gray-800 rounded-full shadow-2xl">
                <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Bienvenido al Sistema
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
              Integral de Gestión
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Selecciona el módulo al que deseas acceder para comenzar a trabajar
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {applications.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No tienes aplicaciones asignadas. Contacta al administrador.
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const gradient = hexToTailwindGradient(app.color);
              const textColor = hexToTailwindText(app.color);
              
              return (
                <Link
                  key={app.applicationId}
                  to={`/home/quick-access?applicationId=${app.applicationId}`}
                  className="group relative"
                  onMouseEnter={() => setHoveredModule(app.applicationId)}
                  onMouseLeave={() => setHoveredModule(null)}
                >
                  <div className={`
                    relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden
                    transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                    border-2 border-transparent hover:border-opacity-50
                    ${hoveredModule === app.applicationId ? 'ring-4 ring-opacity-50 ring-offset-2 dark:ring-offset-gray-900' : ''}
                  `}
                    style={{
                      borderColor: hoveredModule === app.applicationId ? app.color : 'transparent'
                    }}
                  >
                    {/* Gradient Header */}
                    <div className={`h-48 bg-gradient-to-br ${gradient} p-8 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-500"></div>
                      
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div 
                          className="text-white opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                          dangerouslySetInnerHTML={{ __html: app.icon }}
                        />
                        
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">
                            {app.name}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                        {app.description}
                      </p>
                      
                      <div className={`flex items-center ${textColor} dark:${textColor.replace('600', '400')} font-semibold group-hover:translate-x-2 transition-transform duration-300`}>
                        <span>Acceder al módulo</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className={`h-2 bg-gradient-to-r ${gradient} transform transition-all duration-300 ${hoveredModule === app.applicationId ? 'scale-x-100' : 'scale-x-0'}`} />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Seguro
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Sistema protegido con autenticación y control de acceso
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Rápido
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Optimizado para un rendimiento excepcional
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Modular
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Arquitectura flexible y escalable por módulos
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sistema Integral de Gestión - Versión 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
