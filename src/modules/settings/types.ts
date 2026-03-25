// Tipos compartidos del módulo Registro de Usuario
export interface RegistroUsuarioModule {
  name: string;
  basePath: string;
  icon?: string;
}

export const REGISTRO_CONFIG: RegistroUsuarioModule = {
  name: 'Registro de Usuario',
  basePath: '/usuarios',
  icon: '📝'
};
