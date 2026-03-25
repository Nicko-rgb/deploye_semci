import { Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Página Dashboard de Trámite Documentario (placeholder)
const Dashboard = lazy(() => import('./pages/Dashboard'));

const TramiteDocumentarioRoutes = () => {
  return (
    <>
      <Route path="tramite" element={
        <Suspense fallback={<div>Cargando módulo Trámite Documentario...</div>}>
          <Dashboard />
        </Suspense>
      } />
    </>
  );
};

export default TramiteDocumentarioRoutes;
