import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';
import { handleApiError } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Cliente HTTP genérico
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globalmente
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Solo redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/semci/login';
      }
    } else if (error.response?.data) {
      // Si hay una respuesta de error del servidor, la mostramos con SweetAlert2
      console.error('Error del servidor:', error.response.data);
      handleApiError(error.response.data);
    } else {
      // Para otros errores (ej. de red), mostramos un mensaje genérico
      handleApiError(error);
    }

    return Promise.reject(error);
  }
);

// Funciones helper para diferentes tipos de requests
export const apiService = {
  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.get<T>(url, config);
    return response.data;
  },

  // POST request
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.post<T>(url, data, config);
    return response.data;
  },

  // PUT request
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.delete<T>(url, config);
    return response.data;
  },

  // Upload de archivos
  async uploadFile<T>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  },

  // Upload múltiple de archivos
  async uploadMultipleFiles<T>(
    url: string,
    files: File[],
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<T> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const response = await httpClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  },

  // Descargar archivo
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await httpClient.get(url, {
      responseType: 'blob',
    });

    // Crear URL para el blob
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);

    // Crear elemento de descarga temporal
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default apiService;
