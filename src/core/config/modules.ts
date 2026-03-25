/**
 * Configuración central de módulos para la aplicación
 * Arquitectura Microfrontend
 */

export interface ModuleConfig {
  id: string;
  name: string;
  basePath: string;
  icon: string;
  description: string;
  enabled: boolean;
  order: number;
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'semci',
    name: 'SEMCI',
    basePath: '/home',
    icon: '📊',
    description: 'Sistema de Estadística e Informática',
    enabled: true,
    order: 1
  },
  {
    id: 'registro-usuario',
    name: 'Registro de Usuario',
    basePath: '/home/settings',
    icon: '📝',
    description: 'Gestión de usuarios y configuración',
    enabled: true,
    order: 2
  },
  {
    id: 'recursos-humanos',
    name: 'Recursos Humanos',
    basePath: '/home/rrhh',
    icon: '👥',
    description: 'Gestión de recursos humanos',
    enabled: true,
    order: 3
  },
  {
    id: 'tramite-documentario',
    name: 'Trámite Documentario',
    basePath: '/home/tramite',
    icon: '📄',
    description: 'Sistema de gestión documentaria',
    enabled: true,
    order: 4
  }
];

export const getEnabledModules = () => MODULES.filter(m => m.enabled);
export const getModuleById = (id: string) => MODULES.find(m => m.id === id);
