import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

// Página de Gestión de Empleados
const Employees = lazy(() => import('./pages/Employees'));
// Página de Creación de Nuevo Empleado
const NewEmployee = lazy(() => import('./pages/NewEmployee'));
// Página de Visualización de Empleado
const ViewEmployee = lazy(() => import('./pages/ViewEmployee'));
// Pagina de turnos
const Turnos = lazy(() => import('./pages/Turnos'))
// Pagina de licencias
const Licencias = lazy(() => import('./pages/Licencias'));
// Historial de Licencias
const LicenciaHistory = lazy(() => import('./pages/LicenciaHistory'));
// Pagina de Rotaciones
const Rotations = lazy(() => import('./pages/Rotations'))
// Historial de Rotaciones
const RotationHistory = lazy(() => import('./pages/RotationHistory'))
// Organigrama institucional
const Organigrama = lazy(() => import('./pages/Organigrama'))

const RecursosHumanosRoutes = () => {
  return (
    <Routes>
      <Route path="employees" element={<Employees />} />
      <Route path="employees/new" element={<NewEmployee />} />
      <Route path="employees/edit/:id" element={<NewEmployee />} />
      <Route path="employees/:id" element={<ViewEmployee />} />
      <Route path='turnos' element={<Turnos />} />
      <Route path='licencias' element={<Licencias />} />
      <Route path='licencias/history/:employeeId' element={<LicenciaHistory />} />
      <Route path='rotation' element={<Rotations />} />
      <Route path='rotations/history/:employeeId' element={<RotationHistory />} />
      <Route path='organigrama' element={<Organigrama />} />
    </Routes>
  );
};

export default RecursosHumanosRoutes;
