import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ModulesProvider } from './contexts/ModulesContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Core pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AsisPage from './pages/AsisPage';
import Home from './pages/Home';
import QuickAccess from './pages/QuickAccess';
import Profile from './pages/Profile';

// Module routes (lazy loaded)
const SemciRoutes = lazy(() => import('../modules/semci/routes'));
const SettingsRoutes = lazy(() => import('../modules/settings/routes'));
const RecursosHumanosRoutes = lazy(() => import('../modules/recursos-humanos/routes'));
const TramiteDocumentarioRoutes = lazy(() => import('../modules/tramite-documentario/routes'));

function App() {
  return (
    <Router basename="/riscp">
      <ModulesProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="asis" element={<AsisPage />} />

          {/* Rutas protegidas con Dashboard Layout */}
          <Route path="home/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Dashboard principal */}
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />

            {/* Accesos rápidos a funcionalidades del módulo */}
            <Route path="quick-access" element={<QuickAccess />} />

            {/* Módulos cargados dinámicamente */}
            <Route path="*" element={
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando módulo...</div>}>
                <Routes>
                  {/* Módulo SEMCI */}
                  <Route path="semci/*" element={<SemciRoutes />} />
                  {/* Módulo Configuración */}
                  <Route path="settings/*" element={<SettingsRoutes />} />
                  {/* Módulo Recursos Humanos */}
                  <Route path="rrhh/*" element={<RecursosHumanosRoutes />} />
                  {/* Módulo Trámite Documentario */}
                  <Route path="tramite-documentario/*" element={<TramiteDocumentarioRoutes />} />
                </Routes>
              </Suspense>
            } />            
          </Route>

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ModulesProvider>
    </Router>
  );
}

export default App;
