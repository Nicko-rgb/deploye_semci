import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { importService, type ImportConfig, type ImportResult } from '../services/importService';

// Interfaces para el componente (solo las que no están en el servicio)
interface ProgressState {
  percentage: number;
  status: string;
  currentStep: string;
  estimatedTime?: string;
}

const TIPOS_INFORMACION = [
  { value: 'CNV', label: 'CNV' },
  { value: 'PADRON_NOMINAL', label: 'Padrón Nominal' },
  { value: 'DENGUE', label: 'Dengue' },
  { value: 'HIS', label: 'HIS' },
  { value: 'MAESTRO_REGISTRADOR', label: 'Maestro Registrador' },
  { value: 'MAESTRO_PERSONAL', label: 'Maestro Personal' },
  { value: 'MAESTRO_PACIENTE', label: 'Maestro Paciente' },
  { value: 'epi_edas', label: 'EPI - EDAS' },
  { value: 'epi_iras', label: 'EPI - IRAS' },
  { value: 'epi_individual', label: 'EPI - Individual' },
  { value: 'epi_indicadores', label: 'EPI - Indicadores' },
] as const;

const TIPOS_AMBITO = [
  { value: 'DIRESA', label: 'DIRESA' },
  { value: 'RED_DE_SALUD_CORONEL_PORTILLO', label: 'Red de Salud Coronel Portillo' },
] as const;

const MESES = [
  { value: 0, label: '---' },
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

export default function ImportarArchivos() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    percentage: 0,
    status: 'idle',
    currentStep: '',
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const [config, setConfig] = useState<ImportConfig>({
    separador: 'coma',
    targetModel: 'CNV',
    anio: currentYear,
    mes: new Date().getMonth() + 1,
    ambito: 'DIRESA',
    batchSize: 1000,
  });
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar archivo usando el servicio
      const validation = importService.validateFile(file);
      if (!validation.valid) {
        alert(`Errores en el archivo:\n${validation.errors.join('\n')}`);
        return;
      }
      
      setSelectedFile(file);
      setImportResult(null);
      setShowResult(false);
      setProgress({ percentage: 0, status: 'idle', currentStep: '' });
    }
  };

  const handleConfigChange = (field: keyof ImportConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo para importar');
      return;
    }

    setIsImporting(true);
    setProgress({ percentage: 0, status: 'starting', currentStep: 'Iniciando importación...' });
    setShowResult(false);

    try {
      const result = await importService.importData(
        selectedFile,
        config,
        (progressInfo) => {
          setProgress({
            percentage: progressInfo.percentage,
            status: progressInfo.status,
            currentStep: progressInfo.currentStep,
            estimatedTime: progressInfo.estimatedTime
          });
        }
      );
      
      setImportResult(result);
      setShowResult(true);
      
      if (result.success) {
        setProgress({ 
          percentage: 100, 
          status: 'completed', 
          currentStep: 'Importación completada exitosamente' 
        });
        
        // Limpiar el input file después de una importación exitosa con un pequeño delay
        setTimeout(() => {
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000); // 2 segundos de delay para que el usuario vea el resultado
      } else {
        setProgress({ 
          percentage: 100, 
          status: 'error', 
          currentStep: 'Error en la importación' 
        });
      }
    } catch (error) {
      console.error('Error durante la importación:', error);
      setImportResult({
        success: false,
        registrosImportados: 0,
        errores: ['Error inesperado durante la importación'],
        mensaje: 'Ha ocurrido un error inesperado'
      });
      setShowResult(true);
      setProgress({ 
        percentage: 100, 
        status: 'error', 
        currentStep: 'Error inesperado' 
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setProgress({ percentage: 0, status: 'idle', currentStep: '' });
    setImportResult(null);
    setShowResult(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Importar Archivos CSV
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Sube e importa archivos CSV con la configuración específica para cada tipo de información
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        {/* Selección de archivo */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            1. Seleccionar Archivo
          </h2>
          
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {selectedFile ? (
                  <>
                    <svg className="w-10 h-10 mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mb-2 text-sm text-green-600 dark:text-green-400">
                      <span className="font-semibold">Archivo seleccionado:</span> {selectedFile.name}
                    </p>
                    <p className="text-xs text-green-500 dark:text-green-400">
                      Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                      ✓ Archivo válido y listo para importar
                    </p>
                  </>
                ) : (
                  <>
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra el archivo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">CSV únicamente (máximo 100MB)</p>
                  </>
                )}
              </div>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Consejos para el archivo CSV */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
              📋 Consejos para el archivo CSV
            </h4>
            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <li>• Asegúrate de que la primera fila contenga los nombres de las columnas</li>
              <li>• Usa el separador correcto (coma o punto y coma) según tu configuración</li>
              <li>• Evita caracteres especiales en los nombres de las columnas</li>
              <li>• Las fechas deben estar en formato YYYY-MM-DD o DD/MM/YYYY</li>
              <li>• Los campos vacíos se completarán con valores por defecto si están configurados</li>
            </ul>
          </div>
        </div>

        {/* Configuración */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            2. Configuración de Importación
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Separador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Separador de campos
              </label>
              <select
                value={config.separador}
                name='separador'
                onChange={(e) => handleConfigChange('separador', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="coma">Coma (,)</option>
                <option value="punto_coma">Punto y coma (;)</option>
              </select>
            </div>

            {/* Tipo de información */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de información
              </label>
              <select
                value={config.targetModel}
                name='targetModel'
                onChange={(e) => handleConfigChange('targetModel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {TIPOS_INFORMACION.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Año
              </label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={config.anio}
                name='anio'
                onChange={(e) => handleConfigChange('anio', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Mes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mes
              </label>
              <select
                value={config.mes}
                name='mes'
                onChange={(e) => handleConfigChange('mes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {MESES.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>

            {/* Tipo de ámbito */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de ámbito
              </label>
              <select
                value={config.ambito}
                name='ambito'
                onChange={(e) => handleConfigChange('ambito', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {TIPOS_AMBITO.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Configuración avanzada */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <span>Configuración Avanzada</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showAdvancedConfig ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvancedConfig && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                {/* Tamaño de lote */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tamaño de lote para procesamiento
                    <span className="text-xs text-gray-500 ml-1">(registros por lote)</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={config.batchSize || 1000}
                    onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Un lote más grande puede ser más rápido pero consume más memoria. Recomendado: 1000-5000
                  </p>
                </div>

                {/* Información sobre mapeo de columnas */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    💡 Mapeo de Columnas para {config.targetModel}
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    {Object.entries(importService.getColumnMappingTemplate(config.targetModel)).length > 0 ? (
                      Object.entries(importService.getColumnMappingTemplate(config.targetModel)).map(([csvCol, dbField]) => (
                        <div key={csvCol} className="flex justify-between">
                          <span className="font-mono">{csvCol}</span>
                          <span>→</span>
                          <span className="font-mono">{dbField}</span>
                        </div>
                      ))
                    ) : (
                      <p>El sistema detectará automáticamente las columnas para este tipo de información.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/home/settings')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ← Volver a Configuración
          </button>
          
          <div className="space-x-3">
            <button
              onClick={resetForm}
              disabled={isImporting}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Limpiar
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isImporting ? 'Importando...' : 'Importar Archivo'}
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        {isImporting && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{progress.currentStep || 'Procesando...'}</span>
              <span>{Math.round(progress.percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {progress.estimatedTime && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {progress.estimatedTime}
              </div>
            )}
          </div>
        )}

        {/* Resultados */}
        {showResult && importResult && (
          <div className={`p-4 rounded-lg border ${
            importResult.success
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center mb-3">
              {importResult.success ? (
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              <h3 className={`text-lg font-semibold ${
                importResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}>
                {importResult.success ? 'Importación Exitosa' : 'Error en la Importación'}
              </h3>
            </div>
            
            <p className={`mb-3 ${
              importResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {importResult.mensaje}
            </p>
            
            {importResult.success && (
              <div className="space-y-2">
                <div className="flex items-center text-green-700 dark:text-green-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-semibold">Registros importados: {importResult.registrosImportados.toLocaleString()}</span>
                </div>
                
                {/* Detalles adicionales si están disponibles */}
                {importResult.details && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 p-3 bg-green-100 dark:bg-green-800/30 rounded-md">
                    <div className="text-center">
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">Procesados</div>
                      <div className="text-lg font-bold text-green-800 dark:text-green-300">{importResult.details.procesados.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">Exitosos</div>
                      <div className="text-lg font-bold text-green-800 dark:text-green-300">{importResult.details.exitosos.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">Fallidos</div>
                      <div className="text-lg font-bold text-green-800 dark:text-green-300">{importResult.details.fallidos.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">Tiempo</div>
                      <div className="text-lg font-bold text-green-800 dark:text-green-300">{importResult.details.tiempoTotal}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {importResult.errores && importResult.errores.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Errores encontrados:</h4>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-400">
                    {importResult.errores.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
