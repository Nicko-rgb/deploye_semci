import { apiService } from '../../../core/services/apiService';

// Interfaces para manejo de archivos e informes
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface InformeData {
  id: string;
  nombre: string;
  categoria: string;
  estrategia: string;
  año: string;
  tipo: string;
  tamaño: string;
  estado: 'Procesado' | 'En proceso' | 'Error' | 'Pendiente';
  fechaSubida: string;
  archivoId: string;
  uploadedBy: string;
}

export interface UploadInformeRequest {
  file: File;
  categoria: string;
  estrategia: string;
  año: string;
  nombre: string;
}

export interface InformesListResponse {
  informes: InformeData[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FilterOptions {
  categoria?: string;
  estrategia?: string;
  año?: string;
  estado?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class FileService {
  // Subir archivo genérico
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return await apiService.uploadFile<FileUploadResponse>(
      '/files/upload',
      file,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    );
  }

  // Subir múltiples archivos
  async uploadMultipleFiles(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse[]> {
    return await apiService.uploadMultipleFiles<FileUploadResponse[]>(
      '/files/upload-multiple',
      files,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    );
  }

  // Subir informe con metadatos
  async uploadInforme(
    data: UploadInformeRequest,
    onProgress?: (progress: number) => void
  ): Promise<InformeData> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('categoria', data.categoria);
    formData.append('estrategia', data.estrategia);
    formData.append('año', data.año);
    formData.append('nombre', data.nombre);

    const response = await apiService.post<InformeData>('/informes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response;
  }

  // Obtener lista de informes con filtros
  async getInformes(filters: FilterOptions = {}): Promise<InformesListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return await apiService.get<InformesListResponse>(`/informes?${params}`);
  }

  // Obtener informe por ID
  async getInformeById(id: string): Promise<InformeData> {
    return await apiService.get<InformeData>(`/informes/${id}`);
  }

  // Actualizar metadatos de informe
  async updateInforme(id: string, data: Partial<Omit<InformeData, 'id' | 'archivoId' | 'uploadedBy' | 'fechaSubida'>>): Promise<InformeData> {
    return await apiService.put<InformeData>(`/informes/${id}`, data);
  }

  // Eliminar informe
  async deleteInforme(id: string): Promise<void> {
    await apiService.delete(`/informes/${id}`);
  }

  // Descargar archivo
  async downloadFile(fileId: string, filename?: string): Promise<void> {
    await apiService.downloadFile(`/files/${fileId}/download`, filename);
  }

  // Descargar informe
  async downloadInforme(informeId: string, filename?: string): Promise<void> {
    await apiService.downloadFile(`/informes/${informeId}/download`, filename);
  }

  // Procesar informe (cambiar estado)
  async processInforme(id: string): Promise<InformeData> {
    return await apiService.post<InformeData>(`/informes/${id}/process`);
  }

  // Obtener estadísticas de archivos
  async getFileStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    filesByMonth: Record<string, number>;
  }> {
    return await apiService.get('/files/stats');
  }

  // Validar archivo antes de subir
  async validateFile(file: File): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.post('/files/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Obtener tipos de archivo permitidos
  async getAllowedFileTypes(): Promise<{
    extensions: string[];
    maxSize: number;
    mimeTypes: string[];
  }> {
    return await apiService.get('/files/allowed-types');
  }
}

export const fileService = new FileService();
