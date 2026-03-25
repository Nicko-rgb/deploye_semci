import { Link, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBackToApp } from '../hooks/useBackToApp';
import type { Application } from '../utils/interfaces';

// Función para generar iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2) // Solo tomar las primeras 2 iniciales
    .join('');
}

// Función para generar color basado en el nombre
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];

  // Usar el hash del nombre para seleccionar un color consistente
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

// Componente Avatar
function UserAvatar({ name, size = 'w-9 h-9', textSize = 'text-sm' }: {
  name: string;
  size?: string;
  textSize?: string;
}) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div
      className={`${size} ${colorClass} rounded-full flex items-center justify-center text-white font-semibold ${textSize} border-2 border-gray-200 dark:border-gray-700`}
    >
      {initials}
    </div>
  );
}

function MenuIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="2" rx="1" />
      <rect x="3" y="5" width="18" height="2" rx="1" />
      <rect x="3" y="17" width="18" height="2" rx="1" />
    </svg>
  );
}

function LogoutIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
    </svg>
  );
}

function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" />
    </svg>
  );
}

function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
  );
}

function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41" />
    </svg>
  );
}

// Tipos para items del menú
interface MenuItem {
  id: string;
  label: string;
  ruta: string;
  icon: React.ReactNode | null;
  secondary: boolean;
  data_secondary: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  ruta: string;
  icon: React.ReactNode | null;
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchParams] = useSearchParams();
  const backLink = useBackToApp();
  const userName = user?.firstName || 'Usuario';
  const userEmail = user?.email || 'usuario@ejemplo.com';
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [openSecondary, setOpenSecondary] = useState<string | null>(null);

  // Debug: Logs para verificar las URLs
  useEffect(() => {
    const currentUrl = `${location.pathname}${location.search}`;
    console.log('🔍 [DashboardLayout Debug]');
    console.log('   - Current URL:', currentUrl);
    console.log('   - BackLink:', backLink);
    console.log('   - Match?:', currentUrl === backLink);
  }, [location.pathname, location.search, backLink]);

  // Obtener el aplicativo actual desde los parámetros de URL o sessionStorage
  const applicationIdFromUrl = searchParams.get('applicationId');
  const applicationCodeFromUrl = searchParams.get('code');

  // Guardar en sessionStorage cuando viene de URL
  useEffect(() => {
    if (applicationIdFromUrl) {
      sessionStorage.setItem('currentApplicationId', applicationIdFromUrl);
      sessionStorage.removeItem('currentApplicationCode');
    } else if (applicationCodeFromUrl) {
      sessionStorage.setItem('currentApplicationCode', applicationCodeFromUrl);
      sessionStorage.removeItem('currentApplicationId');
    }
  }, [applicationIdFromUrl, applicationCodeFromUrl]);

  // Obtener el applicationId/code de URL o sessionStorage
  const applicationId = applicationIdFromUrl || sessionStorage.getItem('currentApplicationId');
  const applicationCode = applicationCodeFromUrl || sessionStorage.getItem('currentApplicationCode');

  const currentApplication = useMemo<Application | undefined>(() => {
    // Si estamos en la ruta /home, no mostrar ningún aplicativo
    if (location.pathname === '/home' || location.pathname === '/semci/home') {
      return undefined;
    }

    if (!user?.applications) return undefined;

    if (applicationId) {
      return user.applications.find(app => app.applicationId === parseInt(applicationId));
    }

    if (applicationCode) {
      return user.applications.find(app => app.code === applicationCode);
    }

    return undefined;
  }, [user, applicationId, applicationCode, location.pathname]);

  // Organizar módulos del aplicativo actual
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

  // Efecto para monitorear cambios en módulos del aplicativo actual
  useEffect(() => {
    if (organizedModules && organizedModules.length > 0) {
      //console.log('📦 Módulos disponibles en DashboardLayout:', organizedModules);

      // Transformar datos de la API directamente en items del menú
      const apiMenuItems: MenuItem[] = [];

      for (const module of organizedModules) {
        const iconElement = module.icon
          ? <div dangerouslySetInnerHTML={{ __html: module.icon }} />
          : null;

        const subMenuItems: SubMenuItem[] = [];
        if (module.submodules && module.submodules.length > 0) {
          for (const sub of module.submodules) {
            const subIcon = sub.icon ? (
              <div dangerouslySetInnerHTML={{ __html: sub.icon }} />
            ) : null;
            subMenuItems.push({
              id: `submodule-${sub.submoduleId}`,
              label: sub.name,
              ruta: sub.route || '',
              icon: subIcon,
            });
          }
        }

        apiMenuItems.push({
          id: `module-${module.moduleId}`,
          label: module.name,
          ruta: module.route || '',
          icon: iconElement,
          secondary: subMenuItems.length > 0,
          data_secondary: subMenuItems,
        });
      }

      /*console.log('📋 Menú desde API:', apiMenuItems.map(item => item.label));
      console.log('📋 Submenús desde API:', apiMenuItems
        .filter(item => item.secondary)
        .map(item => ({
          label: item.label,
          submenus: item.data_secondary.map(s => s.label)
        })));*/

      setMenuItems(apiMenuItems);
    } else {
      // Si no hay aplicativo seleccionado, limpiar el menú
      setMenuItems([]);
    }
  }, [organizedModules]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Limpiar sessionStorage cuando se navega a /home
  useEffect(() => {
    if (location.pathname === '/home' || location.pathname === '/semci/home') {
      sessionStorage.removeItem('currentApplicationId');
      sessionStorage.removeItem('currentApplicationCode');
    }
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    }
    handleResize(); // Ejecuta al montar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para verificar si un menú con submenús contiene la ruta activa
  const isSubMenuActive = (subItems: SubMenuItem[]) => {
    return subItems.some(sub => location.pathname === sub.ruta);
  };

  // Determinar qué submenú debe estar expandido basado en la ruta actual
  const getActiveSubmenu = () => {
    for (const item of menuItems) {
      if (item.secondary && isSubMenuActive(item.data_secondary)) {
        return item.label;
      }
    }
    return openSecondary;
  };

  const activeSubmenu = getActiveSubmenu();

  useEffect(() => {
    setOpenSecondary(null);
  }, [location]);

  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpenSecondary(null);
      }
    }
    if (sidebarCollapsed && openSecondary) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarCollapsed, openSecondary]);

  function handleProfile() {
    setOpen(false);
    navigate('/home/profile');
  }

  function handleBackToHome() {
    // Limpiar el contexto del aplicativo para volver a la selección
    sessionStorage.removeItem('currentApplicationId');
    sessionStorage.removeItem('currentApplicationCode');
    navigate('/home');
  }

  function handleLogout() {
    setOpen(false);
    // Limpiar módulos del localStorage
    const modulesKey = 'userModules';
    try {
      localStorage.removeItem(modulesKey);
      sessionStorage.removeItem('currentApplicationId');
      sessionStorage.removeItem('currentApplicationCode');
    } catch (error) {
      console.error('Error al limpiar módulos:', error);
    }
    logout();
    navigate('/login');
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-gray-800 shadow flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 border-b dark:border-gray-700 dark:text-white`}>
          {!sidebarCollapsed && (
            <span className="font-bold text-xl transition-all duration-200">
              {currentApplication ? currentApplication.name : 'SEMCI v2.0'}
            </span>
          )}
          <button
            type='button'
            className="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 focus:outline-none"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label="Colapsar sidebar"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
        {/* Botón para volver a selección de aplicativos */}
        {currentApplication && !sidebarCollapsed && (
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <button
              onClick={handleBackToHome}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Cambiar aplicativo</span>
            </button>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 dark:text-white">
          {/* Enlace de Inicio - QuickAccess del aplicativo */}
          {currentApplication && (
            <Link
              to={backLink}
              className={`flex items-center gap-2 py-2 px-2 rounded text-base transition-colors ${
                `${location.pathname}${location.search}` === backLink
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={`${sidebarCollapsed ? 'hidden' : 'inline'}`}>Inicio</span>
            </Link>
          )}
          {menuItems.map((item) => (
            <div key={item.label} className="relative">
              {item.secondary ? (
                <button
                  type="button"
                  className={`flex items-center w-full gap-2 py-2 px-2 rounded text-left text-sm transition-colors ${
                    isSubMenuActive(item.data_secondary)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setOpenSecondary(openSecondary === item.label ? null : item.label)}
                >
                  {item.icon}
                  <span className={`${sidebarCollapsed ? 'hidden' : 'inline'}`}>{item.label}</span>
                  <svg className={`w-3 h-3 ml-auto transition-transform ${(openSecondary === item.label || activeSubmenu === item.label) ? 'rotate-90' : ''} ${sidebarCollapsed ? 'hidden' : 'inline'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <Link
                  to={item.ruta}
                  className={`flex items-center gap-2 py-2 px-2 rounded text-base transition-colors ${
                    location.pathname === item.ruta
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className={`${sidebarCollapsed ? 'hidden' : 'inline'}`}>{item.label}</span>
                </Link>
              )}
              {/* Submenú expandido */}
              {item.secondary && (openSecondary === item.label || activeSubmenu === item.label) && !sidebarCollapsed && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.data_secondary.map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.ruta}
                      className={`flex items-center gap-2 py-1 px-2 rounded text-sm transition-colors ${
                        location.pathname === sub.ruta
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {sub.icon} <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>
              )}
              {/* Submenú popover en modo colapsado */}
              {item.secondary && openSecondary === item.label && sidebarCollapsed && (
                <div ref={popoverRef} className="absolute left-full top-0 z-30 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-2 px-2 min-w-[120px] animate-fade-in">
                  {item.data_secondary.map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.ruta}
                      className={`flex items-center gap-2 py-1 px-2 rounded text-sm whitespace-nowrap transition-colors ${
                        location.pathname === sub.ruta
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {sub.icon}
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded transition-all duration-200 hover:bg-red-600"
          >
            <LogoutIcon className="w-6 h-6" />
            <span className={`${sidebarCollapsed ? 'hidden' : 'inline'}`}>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 bg-white dark:bg-gray-800 shadow flex items-center px-6 justify-between flex-shrink-0">
          <span className="font-semibold dark:text-white">Bienvenido</span>
          <div className="flex items-center gap-4 relative" ref={userMenuRef}>
            {/* Dark/Light mode toggle */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setDarkMode((v) => !v)}
              aria-label="Cambiar modo"
            >
              {darkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-600" />}
            </button>
            {/* User dropdown */}
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setOpen(open => !open)}
              aria-label="Usuario"
              type="button"
            >
              <UserAvatar name={userName} />
              <span className="font-medium text-gray-700 dark:text-white">{userName}</span>
              <svg className={`w-4 h-4 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {open && (
              <div className="absolute right-0 top-14 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 py-4 px-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar name={userName} size="w-12 h-12" textSize="text-base" />
                  <div>
                    <div className="font-semibold text-lg text-gray-900 dark:text-white">{userName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{userEmail}</div>
                  </div>
                </div>
                <button
                  className="flex items-center w-full gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 mb-1"
                  onClick={handleProfile}
                >
                  <UserIcon className="w-5 h-5" /> Perfil
                </button>
                <hr className="my-3 border-gray-200 dark:border-gray-700" />
                <button
                  className="flex items-center w-full gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                >
                  <LogoutIcon className="w-5 h-5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
