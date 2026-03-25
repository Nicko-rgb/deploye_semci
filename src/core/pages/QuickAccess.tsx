import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Application, Permission, Submodule } from '../utils/interfaces';

type QuickAccessCard = {
  id: number;
  name: string;
  description: string;
  icon?: string;
  route: string;
  permissions?: Permission[];
  isModule: boolean;
  color?: string;
};

export default function QuickAccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const applicationId = searchParams.get('applicationId');
  const applicationCode = searchParams.get('code');

  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const currentApplication = useMemo<Application | undefined>(() => {
    if (!user?.applications) return undefined;

    if (applicationId) {
      return user.applications.find(app => app.applicationId === parseInt(applicationId));
    }

    if (applicationCode) {
      return user.applications.find(app => app.code === applicationCode);
    }

    return undefined;
  }, [user, applicationId, applicationCode]);

  const buildSubmoduleRoute = (submodule: Submodule) => {
    const customRoute = submodule.route?.trim();
    if (customRoute) return customRoute;
    const appCode = currentApplication?.code?.toLowerCase() ?? 'app';
    return `/home/${appCode}/${submodule.name.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const organizedModules = useMemo(() => {
    if (!currentApplication) return [];

    const sortedModules = [...currentApplication.modules].sort((a, b) => a.orderIndex - b.orderIndex);

    return sortedModules.map(module => {
      const normalizedSubmodules = Array.isArray(module.submodules) ? module.submodules : [];
      const sortedSubmodules = [...normalizedSubmodules].sort((a, b) => a.orderIndex - b.orderIndex);
      return {
        ...module,
        submodules: sortedSubmodules,
      };
    });
  }, [currentApplication]);

  useEffect(() => {
    if (organizedModules.length === 0) return;
    console.group('QuickAccess - módulos recibidos');
    organizedModules.forEach((module) => {
      console.groupCollapsed(`Módulo: ${module.name} (ID: ${module.moduleId})`);
      console.log('Datos completos del módulo:', module);
      console.log('Submódulos:', module.submodules);
      console.groupEnd();
    });
    console.groupEnd();
  }, [organizedModules]);

  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return organizedModules;

    const term = searchTerm.toLowerCase();

    return organizedModules
      .map(module => ({
        ...module,
        submodules: module.submodules.filter(sub =>
          sub.name.toLowerCase().includes(term) ||
          sub.description.toLowerCase().includes(term)
        )
      }))
      .filter(module => {
        const matchesTerm =
          module.name.toLowerCase().includes(term) ||
          module.description.toLowerCase().includes(term) ||
          (module.route?.toLowerCase().includes(term));
        return matchesTerm || module.submodules.length > 0;
      });
  }, [organizedModules, searchTerm]);

  function handleBackToHome() {
    // Limpiar el contexto del aplicativo para volver a la selección
    sessionStorage.removeItem('currentApplicationId');
    sessionStorage.removeItem('currentApplicationCode');
    navigate('/home');
  }

  if (!currentApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Aplicación no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            No se pudo encontrar la aplicación solicitada.
          </p>
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Cambiar de Aplicativo</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <div
                className="text-blue-600 dark:text-blue-400"
                dangerouslySetInnerHTML={{ __html: currentApplication.icon }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentApplication.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {currentApplication.description}
          </p>
        </div>

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
              placeholder="Buscar funcionalidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredModules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm ? 'No se encontraron resultados' : 'No hay módulos configurados'}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm && 'Intenta con otros términos de búsqueda.'}
            </p>
          </div>
        ) : (
          filteredModules.map((module) => {
            const normalizedSubmodules = Array.isArray(module.submodules) ? module.submodules : [];
            const moduleRoute = module.route?.trim();
            const quickAccessCards: QuickAccessCard[] = moduleRoute
              ? [{
                id: module.moduleId,
                name: module.name,
                description: module.description,
                icon: module.icon,
                route: moduleRoute,
                isModule: true,
                color: module.color,
              }]
              : normalizedSubmodules.map((submodule) => ({
                id: submodule.submoduleId,
                name: submodule.name,
                description: submodule.description,
                icon: submodule.icon,
                route: buildSubmoduleRoute(submodule),
                permissions: submodule.permissions,
                isModule: false,
                color: submodule.color,
              }));

            if (quickAccessCards.length === 0) {
              return null;
            }

            return (
              <div key={module.moduleId} className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3">
                    <div className="text-blue-600 dark:text-blue-400">
                      {module.icon && (
                        <div dangerouslySetInnerHTML={{ __html: module.icon }} />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {module.name}
                    </h2>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                      {quickAccessCards.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {quickAccessCards.map((card) => {
                    const cardKey = `${card.isModule ? 'module' : 'sub'}-${card.id}`;
                    const cardColor = card.color || '#3B82F6'; // Color por defecto: azul
                    return (
                      <Link
                        key={cardKey}
                        to={card.route}
                        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl group ${hoveredCard === cardKey ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                        onMouseEnter={() => setHoveredCard(cardKey)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div
                          className="h-24 p-4 flex items-center justify-center"
                          style={{ backgroundColor: cardColor }}
                        >
                          {card.icon ? (
                            <div
                              className="text-white"
                              dangerouslySetInnerHTML={{ __html: card.icon }}
                            />
                          ) : (
                            <span className="text-white text-2xl font-semibold">
                              {card.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm uppercase tracking-wide">
                            {card.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-3">
                            {card.description}
                          </p>

                          {card.permissions && card.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {card.permissions.map((permission) => (
                                <span
                                  key={permission.permissionId}
                                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
                                  title={permission.description}
                                >
                                  {permission.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 transform transition-all duration-300"
                          style={{
                            backgroundColor: cardColor,
                            transform: hoveredCard === cardKey ? 'scaleX(1)' : 'scaleX(0)'
                          }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Accesos rápidos - {currentApplication.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
