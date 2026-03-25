import axios from 'axios';
import type { AxiosError } from 'axios';
import type { User } from '../utils/interfaces';
import apiService from './apiService';
import type { profileData } from '../config';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken?: string;
  user: User | null;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const TOKEN_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'authToken';
const USER_KEY = import.meta.env.VITE_USER_STORAGE_KEY || 'userData';

// Configurar instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Si el token ha expirado (401), limpiar el almacenamiento
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Opcional: redirigir al login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/settings/auth/login', credentials);
      const rawData = response.data;

      console.log('AuthService - Response completa:', response);
      console.log('AuthService - Raw data:', rawData);

      // Extraer datos del nuevo formato de la API
      const token = rawData.data?.accessToken || rawData.data?.token || rawData.token || rawData.accessToken;
      const refreshToken = rawData.data?.refreshToken || rawData.refreshToken;
      const user = rawData.data?.user || rawData.user;

      const data: LoginResponse = {
        success: rawData.success,
        message: rawData.message,
        token: token,
        refreshToken: refreshToken,
        user: user
      };

      console.log('AuthService - Structured data:', data);
      console.log('AuthService - Token:', data.token);
      console.log('AuthService - User applications:', user?.applications);

      // Verificar que el login fue exitoso
      if (data && data.success && data.token && data.user) {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        console.log('AuthService - Login exitoso, datos guardados');
        return data;
      } else {
        console.log('AuthService - Login falló, data:', data);
        return {
          success: false,
          message: data?.message || 'Error en el login',
          token: '',
          user: null
        };
      }
    } catch (error) {
      console.error('AuthService - Error completo:', error);
      
      // Manejar errores de axios
      if (axios.isAxiosError(error)) {
        console.error('AuthService - Axios error response:', error.response);
        console.error('AuthService - Axios error request:', error.request);
        const message = error.response?.data?.message || 'Error en el login';
        return {
          success: false,
          message: message,
          token: '',
          user: null
        };
      }
      
      console.error('AuthService - Error no axios:', error);
      return {
        success: false,
        message: 'Error de conexión',
        token: '',
        user: null
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Opcional: llamada al endpoint de logout si existe
      await apiClient.post('/settings/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  getCurrentUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Verificar si el token no ha expirado (opcional)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Método para verificar token con el servidor (opcional)
  async verifyToken(): Promise<boolean> {
    try {
      const response = await apiClient.get('/settings/auth/verify');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Método para refresh token (opcional)
  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post('/settings/auth/refresh');
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Error al renovar token:', error);
      return null;
    }
  }

  // Método para cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await apiClient.post('/settings/auth/change-password', {
        currentPassword,
        newPassword
      });
      return true;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
      }
      throw new Error('Error de conexión');
    }
  }

  // Método para solicitar recuperación de contraseña
  async forgotPassword(email: string): Promise<boolean> {
    try {
      await apiClient.post('/settings/auth/forgot-password', { email });
      return true;
    } catch (error) {
      console.error('Error al solicitar recuperación:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al solicitar recuperación');
      }
      throw new Error('Error de conexión');
    }
  }

  // Método para resetear contraseña
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      await apiClient.post('/settings/auth/reset-password', {
        token,
        newPassword
      });
      return true;
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al resetear contraseña');
      }
      throw new Error('Error de conexión');
    }
  }

  // Obtener perfil del usuario actual
  async getCurrentProfile(): Promise<profileData> {
    return await apiService.get<profileData>('/settings/auth/profile', {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  async updateProfile(profileData: Partial<User>): Promise<profileData> {
    return await apiService.put<profileData>('/settings/auth/profile', profileData, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  async updatePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await apiService.patch('/settings/auth/profile/update-password', {
      currentPassword,
      newPassword,
      confirmPassword
    }, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

}

export const authService = new AuthService();
