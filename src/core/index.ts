// Core exports - Exportaciones centrales del sistema
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { HighchartsExportLoader } from './components/HighchartsExportLoader';
export { default as DashboardLayout } from './layouts/DashboardLayout';
export { AuthProvider } from './contexts/AuthContext';
export { useAuth } from './hooks/useAuth';
export { useAccessLevel } from './hooks/useAccessLevel';
export type { AccessLevel, AccessFilters, UseAccessLevelResult } from './hooks/useAccessLevel';
export { useSubmodulePermissions } from './hooks/useSubmodulePermissions';
export type { SubmodulePermissions, UseSubmodulePermissionsOptions } from './hooks/useSubmodulePermissions';
export { ModulesProvider, useModules } from './contexts/ModulesContext';
export * from './config/modules';
