import { useState, createContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { LoginRequest } from '../services/authService';
import type { User } from '../utils/interfaces';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario logueado al cargar la app
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        
        if (currentUser && isAuth) {
          setUser(currentUser);
        } else {
          // Limpiar datos si el token no es válido
          authService.logout();
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      console.log('AuthContext - Login response:', response);
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        return { success: true, message: response.message || 'Login exitoso' };
      } else {
        return { success: false, message: response.message || 'Error en el login' };
      }
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      const message = error instanceof Error ? error.message : 'Error de conexión';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
