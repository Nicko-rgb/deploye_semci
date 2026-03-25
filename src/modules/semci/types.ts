// Tipos compartidos del módulo SEMCI
export interface SemciModule {
  name: string;
  basePath: string;
  icon?: string;
}

export const SEMCI_CONFIG: SemciModule = {
  name: 'SEMCI',
  basePath: '/semci',
  icon: '📊'
};
