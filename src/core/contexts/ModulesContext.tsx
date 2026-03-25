import React, { createContext, useContext, useState } from 'react';

// Tipos de módulos
interface UserSubmodule {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  route?: string;
}

interface UserModule {
  id: number;
  name: string;
  description: string;
  icon?: string;
  route?: string | null;
  submodules: UserSubmodule[];
}

interface ModulesContextType {
  userModules: UserModule[] | null;
  setUserModules: (modules: UserModule[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearModules: () => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

const MODULES_STORAGE_KEY = 'userModules';

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  // Inicializar userModules desde localStorage si existe
  const [userModules, setUserModulesState] = useState<UserModule[] | null>(() => {
    try {
      const stored = localStorage.getItem(MODULES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error al cargar módulos de localStorage:', error);
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wrapper para setUserModules que también guarda en localStorage
  const setUserModules = (modules: UserModule[]) => {
    try {
      localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
      setUserModulesState(modules);
    } catch (error) {
      console.error('Error al guardar módulos en localStorage:', error);
      setUserModulesState(modules);
    }
  };

  // Función para limpiar módulos (útil en logout)
  const clearModules = () => {
    try {
      localStorage.removeItem(MODULES_STORAGE_KEY);
      setUserModulesState(null);
    } catch (error) {
      console.error('Error al limpiar módulos:', error);
    }
  };

  return (
    <ModulesContext.Provider
      value={{
        userModules,
        setUserModules,
        loading,
        setLoading,
        error,
        setError,
        clearModules,
      }}
    >
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules debe ser usado dentro de ModulesProvider');
  }
  return context;
}

// Exportar tipos para uso en otros archivos
export type { UserModule, UserSubmodule, ModulesContextType };
