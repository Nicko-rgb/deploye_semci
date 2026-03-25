import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Configurar instancia de axios para importación
const importClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutos para operaciones de importación
});

// Interceptor para agregar el token automáticamente
importClient.interceptors.request.use(
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

export interface ImportConfig {
  separador: 'coma' | 'punto_coma';
  targetModel: 'CNV' | 'PADRON_NOMINAL' | 'DENGUE' | 'HIS' | 'MAESTRO_REGISTRADOR' | 'MAESTRO_PERSONAL' | 'MAESTRO_PACIENTE' | 'epi_edas' | 'epi_iras' | 'epi_individual' | 'epi_indicador';
  anio: number;
  mes: number;
  ambito: 'DIRESA' | 'RED_DE_SALUD_CORONEL_PORTILLO';
  columnPositions?: Record<string, string>;
  columnMapping?: Record<string, string>;
  batchSize?: number;
  defaultValues?: Record<string, string | number | boolean>;
  transformations?: Record<string, string>;
}

export interface ImportResult {
  success: boolean;
  registrosImportados: number;
  errores?: string[];
  mensaje?: string;
  details?: {
    procesados: number;
    exitosos: number;
    fallidos: number;
    tiempoTotal: string;
  };
}

export interface ImportProgress {
  percentage: number;
  status: string;
  currentStep: string;
  estimatedTime?: string;
}

class ImportService {
  async importData(
    file: File, 
    config: ImportConfig, 
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> {
    try {
      const formData = new FormData();
      
      // Agregar archivo
      formData.append('file', file);
      
      // Agregar configuración básica
      formData.append('targetModel', config.targetModel);
      formData.append('anio', config.anio.toString());
      formData.append('mes', config.mes.toString());
      formData.append('separador', config.separador);
      formData.append('ambito', config.ambito);
      
      // Agregar configuración opcional
      if (config.columnPositions) {
        formData.append('columnPositions', JSON.stringify(config.columnPositions));
      }
      
      if (config.columnMapping) {
        formData.append('columnMapping', JSON.stringify(config.columnMapping));
      }
      
      if (config.batchSize) {
        formData.append('batchSize', config.batchSize.toString());
      }
      
      if (config.defaultValues) {
        formData.append('defaultValues', JSON.stringify(config.defaultValues));
      }
      
      if (config.transformations) {
        formData.append('transformations', JSON.stringify(config.transformations));
      }

      console.log('ImportService - Enviando datos:', {
        targetModel: config.targetModel,
        anio: config.anio,
        mes: config.mes,
        separador: config.separador,
        ambito: config.ambito,
        fileName: file.name,
        fileSize: file.size
      });

      const response = await importClient.post('/import/data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({
              percentage,
              status: 'uploading',
              currentStep: 'Subiendo archivo...',
              estimatedTime: `${Math.ceil((progressEvent.total - progressEvent.loaded) / 1024 / 1024)} MB restantes`
            });
          }
        },
      });

      console.log('ImportService - Response:', response.data);

      // Transformar respuesta del servidor al formato esperado
      const data = response.data;
      
      return {
        success: data.success || false,
        registrosImportados: data.data?.successRows || data.successRows || 0,
        mensaje: data.message || 'Importación completada',
        errores: data.errors || [],
        details: {
          procesados: data.data?.totalRows || data.totalRows || 0,
          exitosos: data.data?.successRows || data.successRows || 0,
          fallidos: data.data?.errorRows || data.errorRows || 0,
          tiempoTotal: data.data?.durationFormatted || data.durationFormatted || 'N/A'
        }
      };

    } catch (error: unknown) {
      console.error('ImportService - Error:', error);
      
      // Manejar errores de axios
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        return {
          success: false,
          registrosImportados: 0,
          mensaje: errorData?.message || errorData?.mensaje || 'Error en la importación',
          errores: errorData?.errors || errorData?.errores || [error.message],
          details: {
            procesados: 0,
            exitosos: 0,
            fallidos: 0,
            tiempoTotal: '0s'
          }
        };
      }
      
      return {
        success: false,
        registrosImportados: 0,
        mensaje: 'Error de conexión durante la importación',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
        details: {
          procesados: 0,
          exitosos: 0,
          fallidos: 0,
          tiempoTotal: '0s'
        }
      };
    }
  }

  // Método para validar archivo antes de importar
  validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push('El archivo debe tener extensión .csv');
    }
    
    // Validar tamaño (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      errors.push('El archivo no puede ser mayor a 100MB');
    }
    
    // Validar que no esté vacío
    if (file.size === 0) {
      errors.push('El archivo está vacío');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Método para obtener plantilla de mapeo según el modelo
  getColumnMappingTemplate(targetModel: string): Record<string, string> {
    const templates: Record<string, Record<string, string>> = {
      CNV: {
        'dni': 'documento',
        'nombres': 'nombres',
        'apellidos': 'apellidos',
        'fecha_nacimiento': 'fechaNacimiento',
        'vacuna': 'tipoVacuna',
        'dosis': 'numeroDosis'
      },
      PADRON_NOMINAL: {
        'dni': 'documento',
        'nombres': 'nombres',
        'apellidos': 'apellidos',
        'fecha_nacimiento': 'fechaNacimiento',
        'establecimiento': 'codigoEstablecimiento'
      },
      HIS: {
        'fecha_atencion': 'fechaAtencion',
        'codigo_establecimiento': 'codigoEstablecimiento',
        'codigo_ups': 'codigoUps',
        'codigo_diagnostico': 'codigoDiagnostico'
      },
      epi_edas: {
        'fecha_atencion': 'fechaAtencion',
        'codigo_establecimiento': 'codigoEstablecimiento',
        'tipo_diagnostico': 'tipoDiagnostico',
        'codigo_diagnostico': 'codigoDiagnostico'
      }
    };
    
    return templates[targetModel] || {};
  }
}

export const importService = new ImportService();
