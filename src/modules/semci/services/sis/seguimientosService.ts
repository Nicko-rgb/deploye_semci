import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_MICRO_PY_URL || 'http://localhost:3000/api/v1';

class SeguimientosService {
    private httpClient;
    
    constructor() {
        this.httpClient = axios.create({
            baseURL: API_BASE_URL,
            timeout: 300000, // 300 segundos (5 minutos) para consultas pesadas
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        // Interceptor para agregar el token automÃ¡ticamente
        /*this.httpClient.interceptors.request.use(
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
        );*/
    
        // Interceptor para manejar respuestas y errores globalmente
        /*this.httpClient.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
            //localStorage.removeItem('authToken');
            //localStorage.removeItem('userData');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            }
            return Promise.reject(error);
        }
        );*/
    }
    
    async getCancerUterinoGeneral(anio: string, mes?: number, nom_red?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/cancer-uterino-general', {
            params: { anio, mes, nom_red, database }
        });
    }

    async getCancerUterinoByMicrored(anio: string, nom_red?: string, nom_microred?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/cancer-uterino-by-microred', {
            params: { anio, nom_red, nom_microred, database }
        });
    }

    async exportarNominalCancerUterino(anio: string, mes: string, nom_red: string, nom_microred: string, nom_establecimiento: string) {
        try {
            const database = "secondary";
            const response = await this.httpClient.get('/sis/seguimientos/exportar-nominal-cancer-uterino', {
                params: { anio, mes, nom_red, nom_microred, nom_establecimiento, database },
                responseType: 'blob', // Importante para manejar archivos
                timeout: 30000, // Mayor timeout para descarga de archivos
            });

            // Crear el blob para el archivo Excel
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generar nombre del archivo incluyendo microred y establecimiento si estÃ¡n disponibles
            let fileName = `cancer_uterino_nominal_${nom_red}_${anio}`;
            if (nom_microred && nom_microred.trim() !== '') {
                fileName += `_${nom_microred.replace(/\s+/g, '_')}`;
            }
            if (nom_establecimiento && nom_establecimiento.trim() !== '') {
                fileName += `_${nom_establecimiento.replace(/\s+/g, '_')}`;
            }
            fileName += '.xlsx';
            
            link.download = fileName;
            
            // Ejecutar la descarga
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return { success: true, message: 'Archivo descargado exitosamente' };
            
        } catch (error) {
            console.error('Error al exportar datos nominales:', error);
            throw new Error('Error al exportar los datos. Por favor, intÃ©ntelo de nuevo.');
        }
    }

    async getCancerMamaGeneral(anio: string, mes?: number, nom_red?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/cancer-mama-general', {
          params: { anio, mes, nom_red, database }
        });
    }

    async getCancerMamaByMicrored(anio: string, nom_red?: string, nom_microred?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/cancer-mama-by-microred', {
          params: { anio, nom_red, nom_microred, database }
        });
    }

    async exportarNominalCancerMama(anio: string, mes: string, nom_red: string, nom_microred: string, nom_establecimiento: string) {
        try {
            const database = "secondary";
            const response = await this.httpClient.get('/sis/seguimientos/exportar-cancer-mama', {
                params: { anio, mes, nom_red, nom_microred, nom_establecimiento, database },
                responseType: 'blob', // Importante para manejar archivos
                timeout: 30000, // Mayor timeout para descarga de archivos
            });

            // Crear el blob para el archivo Excel
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });

            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cancer_mama_nominal_${nom_red}_${anio}.xlsx`;
          
            // Ejecutar la descarga
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return { success: true, message: 'Archivo descargado exitosamente' };
        } catch (error) {
            console.error('Error al exportar datos nominales:', error);
            throw new Error('Error al exportar los datos. Por favor, intÃ©ntelo de nuevo.');
        }
    }

    // ===================================================================================0
    // FUNCIONES DE API PARA PRESION ARTERIAL
    async getPresionArterialGeneral(anio: string, mes?: number, nom_red?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/presion-arterial-general', {
            params: { anio, mes, nom_red, database }
        });
    }

    async getPresionArterialByMicrored(anio: string, nom_red?: string, nom_microred?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/presion-arterial-by-microred', {
            params: { anio, nom_red, nom_microred, database }
        });
    }

    async exportarNominalPresionArterial(anio: string, mes: string, nom_red: string, nom_microred: string, nom_establecimiento: string) {
        try {
            const database = "secondary";
            const response = await this.httpClient.get('/sis/seguimientos/exportar-nominal-presion-arterial', {
                params: { anio, mes, nom_red, nom_microred, nom_establecimiento, database },
                responseType: 'blob', // Importante para manejar archivos
                timeout: 30000, // Mayor timeout para descarga de archivos
            });

            // Crear el blob para el archivo Excel
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generar nombre del archivo incluyendo microred y establecimiento si estÃ¡n disponibles
            let fileName = `presion_arterial_nominal_${nom_red}_${anio}`;
            if (nom_microred && nom_microred.trim() !== '') {
                fileName += `_${nom_microred.replace(/\s+/g, '_')}`;
            }
            if (nom_establecimiento && nom_establecimiento.trim() !== '') {
                fileName += `_${nom_establecimiento.replace(/\s+/g, '_')}`;
            }
            fileName += '.xlsx';
            
            link.download = fileName;
            
            // Ejecutar la descarga
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return { success: true, message: 'Archivo descargado exitosamente' };
            
        } catch (error) {
            console.error('Error al exportar datos nominales de presiÃ³n arterial:', error);
            throw new Error('Error al exportar los datos. Por favor, intÃ©ntelo de nuevo.');
        }
    }

    // ===================================================================================0
    // FUNCIONES DE API PARA CANCER CERVICO
    async getCancerCervicoGeneral(anio: string, mes?: number, nom_red?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/cancer-cervico-general', {
            params: { anio, mes, nom_red, database }
        });
    }

    async getCancerCervicoByMicrored(anio: string, nom_red?: string, nom_microred?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/cancer-cervico-by-microred', {
            params: { anio, nom_red, nom_microred, database }
        });
    }

    async exportarNominalCancerCervico(anio: string, mes: string, nom_red: string, nom_microred: string, nom_establecimiento: string) {
        try {
            const database = "secondary";
            const response = await this.httpClient.get('/sis/seguimientos/exportar-nominal-cancer-cervico', {
                params: { anio, mes, nom_red, nom_microred, nom_establecimiento, database },
                responseType: 'blob', // Importante para manejar archivos
                timeout: 30000, // Mayor timeout para descarga de archivos
            });

            // Crear el blob para el archivo Excel
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generar nombre del archivo incluyendo microred y establecimiento si estÃ¡n disponibles
            let fileName = `cancer_cervico_nominal_${nom_red}_${anio}`;
            if (nom_microred && nom_microred.trim() !== '') {
                fileName += `_${nom_microred.replace(/\s+/g, '_')}`;
            }
            if (nom_establecimiento && nom_establecimiento.trim() !== '') {
                fileName += `_${nom_establecimiento.replace(/\s+/g, '_')}`;
            }
            fileName += '.xlsx';
            
            link.download = fileName;
            
            // Ejecutar la descarga
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return { success: true, message: 'Archivo descargado exitosamente' };
            
        } catch (error) {
            console.error('Error al exportar datos nominales de cÃ¡ncer cÃ©rvico:', error);
            throw new Error('Error al exportar los datos. Por favor, intÃ©ntelo de nuevo.');
        }
    }

    // ===================================================================================0
    // FUNCIONES DE API PARA HIPERTENSION DIABETES
    async getHipertensionDiabetesGeneral(anio: string, mes?: number, nom_red?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/hipertension-diabetes-general', {
            params: { anio, mes, nom_red, database }
        });
    }

    async getHipertensionDiabetesByMicrored(anio: string, nom_red?: string, nom_microred?: string) {
        const database = 'secondary';
        return this.httpClient.get('/sis/seguimientos/hipertension-diabetes-by-microred', {
            params: { anio, nom_red, nom_microred, database }
        });
    }

    async exportarNominalHipertensionDiabetes(anio: string, mes: string, nom_red: string, nom_microred: string, nom_establecimiento: string) {
        try {
            const database = "secondary";
            const response = await this.httpClient.get('/sis/seguimientos/exportar-nominal-hipertension-diabetes', {
                params: { anio, mes, nom_red, nom_microred, nom_establecimiento, database },
                responseType: 'blob', // Importante para manejar archivos
                timeout: 30000, // Mayor timeout para descarga de archivos
            });

            // Crear el blob para el archivo Excel
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generar nombre del archivo incluyendo microred y establecimiento si estÃ¡n disponibles
            let fileName = `hipertension_diabetes_nominal_${nom_red}_${anio}`;
            if (nom_microred && nom_microred.trim() !== '') {
                fileName += `_${nom_microred.replace(/\s+/g, '_')}`;
            }
            if (nom_establecimiento && nom_establecimiento.trim() !== '') {
                fileName += `_${nom_establecimiento.replace(/\s+/g, '_')}`;
            }
            fileName += '.xlsx';
            
            link.download = fileName;
            
            // Ejecutar la descarga
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return { success: true, message: 'Archivo descargado exitosamente' };
            
        } catch (error) {
            console.error('Error al exportar datos nominales de hipertensiÃ³n y diabetes:', error);
            throw new Error('Error al exportar los datos. Por favor, intÃ©ntelo de nuevo.');
        }
    }


    // Reporte de Atenciones General (con filtros avanzados)
    async getReporteAtencionesGeneral(filtros: any) {
        try {
            const params: any = {};
            if (filtros.anio) params.anio = filtros.anio;
            if (filtros.mes) params.mes = filtros.mes;
            if (filtros.nombre_red) params.nombre_red = filtros.nombre_red;
            if (filtros.codigo_unico) params.codigo_unico = filtros.codigo_unico;
            if (filtros.microred) params.microred = filtros.microred;
            if (filtros.dni_profesional) params.dni_profesional = filtros.dni_profesional;
            if (filtros.q_profesional) params.q_profesional = filtros.q_profesional;
            if (filtros.id_profesion) params.id_profesion = filtros.id_profesion;
            if (filtros.especialidad_like) params.especialidad_like = filtros.especialidad_like;
            if (filtros.id_servicio) params.id_servicio = filtros.id_servicio;
            if (filtros.lote) params.lote = filtros.lote;

            const response = await this.httpClient.get('/sis/reportes/atenciones-general', {
                params,
                timeout: 120000, // 2 minutos para consultas pesadas
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener reporte:', error);
            throw new Error('Error al cargar los datos.');
        }
    }

    // Catálogos para filtros
    async getMicroRedes() {
        try {
            const response = await this.httpClient.get('/sis/catalogos/microredes');
            // El endpoint retorna { total, items }, necesitamos solo items
            return response.data.items || [];
        } catch (error) {
            console.error('Error al obtener microredes:', error);
            return [];
        }
    }

    async getEstablecimientos(microred?: string) {
        try {
            const params: any = {};
            if (microred) params.microred = microred;
            const response = await this.httpClient.get('/sis/catalogos/establecimientos', { params });
            // El endpoint retorna { total, items }, necesitamos solo items
            return response.data.items || [];
        } catch (error) {
            console.error('Error al obtener establecimientos:', error);
            return [];
        }
    }

    async getProfesionales(anio?: string, codigo_unico?: string) {
        try {
            const params: any = {};
            if (anio) params.anio = anio;
            if (codigo_unico) params.codigo_unico = codigo_unico;
            const response = await this.httpClient.get('/sis/catalogos/profesionales', { params });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener profesionales:', error);
            return [];
        }
    }

    async getProfesiones() {
        try {
            const response = await this.httpClient.get('/sis/catalogos/profesiones');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener profesiones:', error);
            return [];
        }
    }

    async getEstadisticasAtenciones(filtros: any) {
        try {
            const params: any = {};
            Object.keys(filtros).forEach(key => {
                if (filtros[key] && filtros[key] !== '') {
                    params[key] = filtros[key];
                }
            });
            console.log('📡 Llamando a /sis/reportes/estadisticas-atenciones con params:', params);
            const response = await this.httpClient.get('/sis/reportes/estadisticas-atenciones', { 
                params,
                timeout: 120000 // 2 minutos para consultas pesadas
            });
            console.log('📦 Respuesta recibida:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener estadísticas de atenciones:', error);
            throw error;
        }
    }

    // ========== CONTROL ARTERIAL (HTA) ==========
    
    async getHtaNominal(filtros: any) {
        try {
            const params: any = {};
            Object.keys(filtros).forEach(key => {
                if (filtros[key] && filtros[key] !== '') {
                    params[key] = filtros[key];
                }
            });
            console.log('📡 Llamando a /sis/control-arterial/hta-nominal con params:', params);
            const response = await this.httpClient.get('/sis/control-arterial/hta-nominal', { params });
            console.log('📦 Respuesta HTA nominal recibida:', {
                total: response.data.total,
                items: response.data.items?.length || 0
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener datos nominales de HTA:', error);
            throw error;
        }
    }

    async getEstadisticasHta(filtros: any) {
        try {
            const params: any = {};
            Object.keys(filtros).forEach(key => {
                if (filtros[key] && filtros[key] !== '') {
                    params[key] = filtros[key];
                }
            });
            console.log('📡 Llamando a /sis/control-arterial/estadisticas-hta con params:', params);
            const response = await this.httpClient.get('/sis/control-arterial/estadisticas-hta', { params });
            console.log('📦 Respuesta estadísticas HTA recibida:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener estadísticas de HTA:', error);
            throw error;
        }
    }

    // ========== INDICADOR CÁNCER DE MAMA ==========
    
    async getCancerMamaNominal(filtros: any) {
        try {
            const params: any = {};
            Object.keys(filtros).forEach(key => {
                if (filtros[key] && filtros[key] !== '') {
                    params[key] = filtros[key];
                }
            });
            console.log('📡 Llamando a /sis/indicadores/cancer-mama con params:', params);
            const response = await this.httpClient.get('/sis/indicadores/cancer-mama', { params });
            console.log('📦 Respuesta cáncer de mama nominal recibida:', {
                total: response.data.total,
                items: response.data.items?.length || 0
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener datos nominales de cáncer de mama:', error);
            throw error;
        }
    }

    async getCancerMamaTotal(filtros: any) {
        try {
            const params: any = {
                id_servicio: filtros.id_servicio || '025',
                lote: filtros.lote || 25,
                anio: filtros.anio || new Date().getFullYear()
            };
            console.log('📡 Llamando a /sis/indicadores/cancer-mama/total con params:', params);
            const response = await this.httpClient.get('/sis/indicadores/cancer-mama/total', { params });
            console.log('📦 Respuesta total cáncer de mama recibida:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener total de cáncer de mama:', error);
            throw error;
        }
    }

    // Cuello Uterino
    async getCuelloUterinoNominal(filtros: any) {
        try {
            const params: any = {};
            Object.keys(filtros).forEach(key => {
                if (filtros[key] && filtros[key] !== '') {
                    params[key] = filtros[key];
                }
            });
            console.log('📡 Llamando a /sis/indicadores/cuello-uterino con params:', params);
            const response = await this.httpClient.get('/sis/indicadores/cuello-uterino', { params });
            console.log('📦 Respuesta cuello uterino nominal recibida:', {
                total: response.data.total,
                items: response.data.items?.length || 0
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener datos nominales de cuello uterino:', error);
            throw error;
        }
    }

    async getCuelloUterinoTotal(filtros: any) {
        try {
            const params: any = {
                id_servicio: filtros.id_servicio || '024',
                lote: filtros.lote || 25,
                anio: filtros.anio || new Date().getFullYear()
            };
            console.log('📡 Llamando a /sis/indicadores/cuello-uterino/total con params:', params);
            const response = await this.httpClient.get('/sis/indicadores/cuello-uterino/total', { params });
            console.log('📦 Respuesta total cuello uterino recibida:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener total de cuello uterino:', error);
            throw error;
        }
    }

    // Consulta Externa Especialista
    async getConsultaExternaEspecialista(filtros: any) {
        try {
            const params: any = {};
            Object.keys(filtros).forEach(key => {
                if (filtros[key] && filtros[key] !== '') {
                    params[key] = filtros[key];
                }
            });
            console.log('📡 Llamando a /sis/indicadores/consulta-externa-especialista con params:', params);
            const response = await this.httpClient.get('/sis/indicadores/consulta-externa-especialista', { params });
            console.log('📦 Respuesta consulta externa especialista recibida:', {
                total: response.data.total,
                items: response.data.items?.length || 0
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener datos de consulta externa especialista:', error);
            throw error;
        }
    }

    async getConsultaExternaEspecialistaTotal(filtros: any) {
        try {
            const params: any = {
                lote: filtros.lote || 25,
                anio: filtros.anio || new Date().getFullYear()
            };
            console.log('📡 Llamando a /sis/indicadores/consulta-externa-especialista/total con params:', params);
            const response = await this.httpClient.get('/sis/indicadores/consulta-externa-especialista/total', { params });
            console.log('📦 Respuesta total consulta externa especialista recibida:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener total de consulta externa especialista:', error);
            throw error;
        }
    }

}

export const seguimientosService = new SeguimientosService();
