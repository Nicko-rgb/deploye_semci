export * from './catalog.types';
export * from './employee.types';
export * from './shift.types';
export * from './licencia.types';
export * from './organigrama.types';

// Tipos compartidos del módulo
export interface RecursosHumanosModule {
    name: string;
    basePath: string;
    icon?: string;
}

export const RRHH_CONFIG: RecursosHumanosModule = {
    name: 'Recursos Humanos',
    basePath: '/rrhh',
    icon: '👥'
};
