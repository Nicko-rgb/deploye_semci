import { Route, Routes } from 'react-router-dom';
import Usuarios from './pages/Usuarios';
import Application from './pages/Application';
import Module from './pages/Module';
import SubModule from './pages/SubModule';
import Permission from './pages/Permission';

const SettingsRoutes = () => {
  return (
    <Routes>
      <Route path="users" element={<Usuarios />} />
      <Route path="applications" element={<Application />} />
      <Route path="modules" element={<Module />} /> 
      <Route path="submodules" element={<SubModule />} />
      <Route path="permissions" element={<Permission />} />
    </Routes>
  );
};

export default SettingsRoutes;
