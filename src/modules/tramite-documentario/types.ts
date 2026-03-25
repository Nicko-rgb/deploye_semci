// Tipos compartidos del módulo Trámite Documentario
export interface TramiteDocumentarioModule {
  name: string;
  basePath: string;
  icon?: string;
}

export const TRAMITE_CONFIG: TramiteDocumentarioModule = {
  name: 'Trámite Documentario',
  basePath: '/tramite',
  icon: '📄'
};
