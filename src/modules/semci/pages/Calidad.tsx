import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//import { redes } from '../utils/accesories';
import { accessoriesService } from '../../settings/services/accessoriesService';
import type { microredes, establecimientos } from '../../settings/services/accessoriesService';
import { useBackToApp } from '../../../core/hooks/useBackToApp';

interface CalidadForm {
  red: string;
  microred: string;
  establecimiento: string;
  año: number;
  mes: number;
  tipoError: string;
}

const TIPOS_ERROR = [
  { value: 'ERROR_REGISTRO', label: 'Error de Registro' },
  { value: 'ERROR_CODIFICACION', label: 'Error de Codificación' },
  { value: 'ERROR_VALIDACION', label: 'Error de Validación' },
  { value: 'ERROR_COMPLETITUD', label: 'Error de Completitud' },
  { value: 'ERROR_CONSISTENCIA', label: 'Error de Consistencia' },
  { value: 'ERROR_OPORTUNIDAD', label: 'Error de Oportunidad' },
];

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export default function Calidad() {
  const backLink = useBackToApp();
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(false);

  // Estados para opciones dinámicas
  //const [redesOptions, setRedesOptions] = useState<string[]>([]);
  const [microredesOptions, setMicroredesOptions] = useState<microredes[]>([]);
  const [establecimientosOptions, setEstablecimientosOptions] = useState<establecimientos[]>([]);

  const [formData, setFormData] = useState<CalidadForm>({
    red: '',
    microred: '',
    establecimiento: '',
    año: currentYear,
    mes: new Date().getMonth() + 1,
    tipoError: '',
  });

  // ===== CARGAR REDES =====
  useEffect(() => {
    const loadRedes = () => {
      //const redesList = redes.map(r => r.nombre_red);
      //setRedesOptions(redesList);
    };
    loadRedes();
  }, []);

  // ===== CARGAR MICROREDES =====
  useEffect(() => {
    const loadMicroredes = async () => {
      if (formData.red) {
        try {
          const microredesData = await accessoriesService.getMicroredesByNombreRed(formData.red);
          setMicroredesOptions(microredesData);
          setFormData(prev => ({ ...prev, microred: '', establecimiento: '' }));
          setEstablecimientosOptions([]);
        } catch (error) {
          console.error('Error cargando microredes:', error);
        }
      } else {
        setMicroredesOptions([]);
        setFormData(prev => ({ ...prev, microred: '', establecimiento: '' }));
        setEstablecimientosOptions([]);
      }
    };
    loadMicroredes();
  }, [formData.red]);

  // ===== CARGAR ESTABLECIMIENTOS =====
  useEffect(() => {
    const loadEstablecimientos = async () => {
      if (formData.red && formData.microred) {
        try {
          const establecimientosData = await accessoriesService.getEstablecimientosByNombreRedMicroRed(formData.red, formData.microred);
          setEstablecimientosOptions(establecimientosData);
          setFormData(prev => ({ ...prev, establecimiento: '' }));
        } catch (error) {
          console.error('Error cargando establecimientos:', error);
        }
      } else {
        setEstablecimientosOptions([]);
        setFormData(prev => ({ ...prev, establecimiento: '' }));
      }
    };
    loadEstablecimientos();
  }, [formData.red, formData.microred]);

  const handleInputChange = (field: keyof CalidadForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportar = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const filename = `calidad_${formData.red}_${formData.año}_${formData.mes}.xlsx`;
      alert(`Archivo ${filename} exportado exitosamente`);

    } catch (error) {
      alert('Error al exportar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.red && formData.microred && formData.establecimiento && formData.tipoError;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className='flex justify-center items-center gap-80'>

        <div className="mb-6 flex justify-center items-center ">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Control de Calidad
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Genere reportes de control de calidad por establecimiento de salud
            </p>
          </div>
        </div>
        {/* Botón de inicio, se empuja al lado derecho */}
        <div>
          <Link to={backLink} className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
            <svg className="w-12 h-12  dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='black'>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Red */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Red de Salud *
              </label>
              <select
                value={formData.red}
                onChange={(e) => handleInputChange('red', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Seleccione una red</option>
                {/*redesOptions.map(red => (
                  <option key={red} value={red}>{red}</option>
                ))*/}
              </select>
            </div>

            {/* Microred */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Microred *
              </label>
              <select
                value={formData.microred}
                onChange={(e) => handleInputChange('microred', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={!formData.red}
                required
              >
                <option value="">Seleccione una microred</option>
                {microredesOptions.map(microred => (
                  <option key={microred.nom_microred} value={microred.nom_microred}>
                    {microred.nom_microred}
                  </option>
                ))}
              </select>
            </div>

            {/* Establecimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Establecimiento *
              </label>
              <select
                value={formData.establecimiento}
                onChange={(e) => handleInputChange('establecimiento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={!formData.microred}
                required
              >
                <option value="">Seleccione un establecimiento</option>
                {establecimientosOptions.map(establecimiento => (
                  <option key={establecimiento.nombre_establecimiento} value={establecimiento.nombre_establecimiento}>
                    {establecimiento.nombre_establecimiento}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Error */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Error *
              </label>
              <select
                value={formData.tipoError}
                onChange={(e) => handleInputChange('tipoError', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Seleccione un tipo de error</option>
                {TIPOS_ERROR.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Año *
              </label>
              <select
                value={formData.año}
                onChange={(e) => handleInputChange('año', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                {[...Array(6)].map((_, index) => {
                  const year = currentYear - index;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </select>
            </div>

            {/* Mes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mes *
              </label>
              <select
                value={formData.mes}
                onChange={(e) => handleInputChange('mes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                {MESES.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Información del reporte */}
          {isFormValid && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                Resumen del Reporte
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p><span className="font-medium">Red:</span> {formData.red}</p>
                <p><span className="font-medium">Microred:</span> {formData.microred}</p>
                <p><span className="font-medium">Establecimiento:</span> {formData.establecimiento}</p>
                <p><span className="font-medium">Período:</span> {MESES.find(m => m.value === formData.mes)?.label} {formData.año}</p>
                <p><span className="font-medium">Tipo de Error:</span> {TIPOS_ERROR.find(t => t.value === formData.tipoError)?.label}</p>
              </div>
            </div>
          )}

          {/* Botón de exportar */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleExportar}
                disabled={!isFormValid || loading}
                className={`flex items-center px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${!isFormValid || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                  }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exportando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar a Excel
                  </>
                )}
              </button>
            </div>

            {!isFormValid && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                Complete todos los campos requeridos para exportar
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
