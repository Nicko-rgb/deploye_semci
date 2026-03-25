import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook personalizado para obtener el link de retorno al QuickAccess del aplicativo actual
 * Extrae el código del aplicativo desde la URL o el applicationId de los parámetros
 * 
 * @returns {string} URL para regresar al QuickAccess del aplicativo o al home principal
 * 
 * @example
 * // En un componente de módulo/submódulo:
 * const backLink = useBackToApp();
 * <Link to={backLink}>Volver</Link>
 */
export function useBackToApp(): string {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extraer el prefijo base de la ruta (todo antes de /home/)
  const basePrefix = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const homeIndex = pathSegments.indexOf('home');
    
    if (homeIndex > 0) {
      // Si hay segmentos antes de 'home', construir el prefijo
      return '/' + pathSegments.slice(0, homeIndex).join('/');
    }
    
    return ''; // No hay prefijo
  }, [location.pathname]);

  // Extraer el código del aplicativo desde la URL
  const applicationCode = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    console.log('[useBackToApp] Path completo:', location.pathname);
    console.log('[useBackToApp] Segmentos:', pathSegments);
    
    // La estructura puede ser: /home/{applicationCode}/... o /semci/home/{applicationCode}/...
    const homeIndex = pathSegments.indexOf('home');
    console.log('[useBackToApp] Índice de "home":', homeIndex);
    
    if (homeIndex !== -1 && pathSegments.length > homeIndex + 1) {
      const nextSegment = pathSegments[homeIndex + 1];
      // Si el siguiente segmento NO es 'quick-access', asumimos que es un código de aplicativo
      if (nextSegment !== 'quick-access') {
        console.log('[useBackToApp] Código extraído:', nextSegment);
        return nextSegment.toLowerCase(); // Normalizar a minúsculas
      }
    }
    
    console.log('[useBackToApp] No se pudo extraer código');
    return null;
  }, [location.pathname]);

  // Verificar si hay applicationId en los parámetros de URL
  const applicationIdFromUrl = searchParams.get('applicationId');

  // Encontrar el applicationId del código extraído o usar el de URL
  const backLink = useMemo(() => {
    console.log('[useBackToApp] ApplicationCode:', applicationCode);
    console.log('[useBackToApp] ApplicationId from URL:', applicationIdFromUrl);
    console.log('[useBackToApp] Base prefix:', basePrefix);
    console.log('[useBackToApp] User applications:', user?.applications);
    
    if (!user?.applications) {
      console.log('[useBackToApp] Retornando /home (sin aplicaciones)');
      return `${basePrefix}/home`;
    }

    // Prioridad 1: Si hay applicationId en la URL, usarlo directamente
    if (applicationIdFromUrl) {
      const currentApp = user.applications.find(app => app.applicationId === parseInt(applicationIdFromUrl));
      if (currentApp) {
        const link = `${basePrefix}/home/quick-access?applicationId=${currentApp.applicationId}`;
        console.log('[useBackToApp] App encontrada por ID! Retornando:', link);
        return link;
      }
    }

    // Prioridad 2: Si hay código en la ruta, buscar por código
    if (applicationCode) {
      const currentApp = user.applications.find(app => {
        const appCodeLower = app.code?.toLowerCase();
        console.log('[useBackToApp] Comparando:', appCodeLower, 'con', applicationCode, 'para app:', app.name);
        return appCodeLower === applicationCode;
      });
      
      if (currentApp) {
        const link = `${basePrefix}/home/quick-access?applicationId=${currentApp.applicationId}`;
        console.log('[useBackToApp] App encontrada por código! Retornando:', link);
        return link;
      }
    }

    console.log('[useBackToApp] App no encontrada, retornando /home');
    console.log('[useBackToApp] Aplicaciones disponibles:', user.applications.map(app => ({ 
      code: app.code, 
      id: app.applicationId 
    })));
    return `${basePrefix}/home`;
  }, [applicationCode, applicationIdFromUrl, user, basePrefix]);

  console.log('[useBackToApp] Link final:', backLink);
  return backLink;
}



