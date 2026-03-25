import Swal from 'sweetalert2';
import { AxiosError } from 'axios';

interface BackendErrorResponse {
    success: false;
    message: string;
    error: string;
    details?: any;
}

export const handleApiError = (error: AxiosError<BackendErrorResponse> | any) => {
    let title = 'Error';
    let text = 'Ha ocurrido un error inesperado.';

    if (error instanceof AxiosError) {
        if (error.response) {
            // El servidor respondió con un estado de error (ej. 4xx, 5xx)
            const backendError = error.response.data;
            if (backendError && backendError.message) {
                text = backendError.message;
            } else if (error.message) {
                text = error.message;
            }
            if (backendError && backendError.error) {
                title = backendError.error;
            } else {
                title = `Error ${error.response.status}`;
            }
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta (ej. red caída, CORS)
            title = 'Error de Conexión';
            text = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet o inténtalo de nuevo más tarde.';
        } else {
            // Algo pasó al configurar la petición que disparó un Error
            text = error.message || 'Error al configurar la petición.';
        }
    } else if (error && typeof error === 'object') {
        // Errores no Axios, pero con estructura de objeto
        if (error.message) {
            text = error.message;
        }
        if (error.error) {
            title = error.error;
        }
    } else if (typeof error === 'string') {
        // Error como string simple
        text = error;
    }

    Swal.fire({
        icon: 'error',
        title: title,
        text: text,
        confirmButtonText: 'Aceptar'
    });
};
