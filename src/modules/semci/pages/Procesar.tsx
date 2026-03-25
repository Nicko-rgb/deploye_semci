import { useState } from 'react';

/*interface ProcesamientoForm {
  tipo: 'Individual' | 'ETL';
  nombres: string;
  año: number;
  mes?: number;
}*/

/*interface ProcesamientoHistorial {
  id: number;
  tipo: 'Individual' | 'ETL';
  categoria: string;
  nombres: string;
  año: number;
  mes?: number;
  fecha: string;
  estado: 'Procesando' | 'Completado' | 'Error';
  progreso: number;
}*/

interface DockerService {
  id: string;
  name: string;
  description: string;
}

interface DockerStatus {
  service: string;
  status: 'running' | 'stopped' | 'error' | 'unknown';
  message: string;
}

type TabType = 'atenciones' | 'reportes' | 'indicadores-fed' | 'indicadores-gestion' | 'procesos-internos';

// Datos de ejemplo para el historial
/*const HISTORIAL_EJEMPLO: ProcesamientoHistorial[] = [
  {
    id: 1,
    tipo: 'ETL',
    categoria: 'Atenciones',
    nombres: 'Procesamiento mensual completo',
    año: 2024,
    mes: 1,
    fecha: '2024-01-15 10:30:00',
    estado: 'Completado',
    progreso: 100
  },
  {
    id: 2,
    tipo: 'Individual',
    categoria: 'Reportes',
    nombres: 'Reporte anual de consultas',
    año: 2024,
    fecha: '2024-01-14 14:20:00',
    estado: 'Completado',
    progreso: 100
  },
  {
    id: 3,
    tipo: 'ETL',
    categoria: 'Indicadores FED',
    nombres: 'Actualización indicadores FED',
    año: 2024,
    mes: 1,
    fecha: '2024-01-13 09:15:00',
    estado: 'Procesando',
    progreso: 65
  }
];*/

/*const MESES = [
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
];*/

export default function Procesar() {
  const [activeTab, setActiveTab] = useState<TabType>('atenciones');
  /*const [formData, setFormData] = useState<ProcesamientoForm>({
    tipo: 'Individual',
    nombres: '',
    año: new Date().getFullYear(),
    mes: new Date().getMonth() + 1
  });*/
  //const [loading, setLoading] = useState(false);
  //const [historial, setHistorial] = useState<ProcesamientoHistorial[]>(HISTORIAL_EJEMPLO);
  //const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para servicios Docker
  const [selectedService, setSelectedService] = useState<string>('');
  const [dockerStatus, setDockerStatus] = useState<DockerStatus | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);

  // Lista de servicios Docker disponibles
  const dockerServices: DockerService[] = [
    { id: 'api-gateway', name: 'API Gateway', description: 'Servicio principal de API' },
    { id: 'database', name: 'Base de Datos', description: 'Servicio de PostgreSQL' },
    { id: 'redis-cache', name: 'Redis Cache', description: 'Servicio de caché Redis' },
    { id: 'nginx-proxy', name: 'Nginx Proxy', description: 'Servidor proxy Nginx' },
    { id: 'etl-processor', name: 'Procesador ETL', description: 'Servicio de procesamiento ETL' },
    { id: 'backup-service', name: 'Servicio de Backup', description: 'Servicio de respaldos automáticos' }
  ];

  const tabs = [
    { id: 'atenciones', label: 'Atenciones', icon: '🏥' },
    { id: 'reportes', label: 'Reportes', icon: '📊' },
    { id: 'indicadores-fed', label: 'Indicadores FED', icon: '📈' },
    { id: 'indicadores-gestion', label: 'Indicadores de Gestión', icon: '📋' },
    { id: 'procesos-internos', label: 'Procesos Internos', icon: '📋' }
  ];

  /*const handleInputChange = (field: keyof ProcesamientoForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar errores al cambiar valores
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };*/

  /*const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'El nombre del procesamiento es requerido';
    }
    
    if (formData.año < 2020 || formData.año > new Date().getFullYear() + 1) {
      newErrors.año = 'Año inválido';
    }
    
    // Validar mes solo para ciertos tipos de procesamiento
    if (activeTab === 'atenciones' || activeTab === 'indicadores-fed') {
      if (!formData.mes || formData.mes < 1 || formData.mes > 12) {
        newErrors.mes = 'Mes inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };*/

  /*const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    //setLoading(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Agregar al historial
      const nuevoProcesamientoHistorial: ProcesamientoHistorial = {
        id: Math.max(...historial.map(h => h.id)) + 1,
        tipo: formData.tipo,
        categoria: tabs.find(t => t.id === activeTab)?.label || '',
        nombres: formData.nombres,
        año: formData.año,
        mes: formData.mes,
        fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
        estado: 'Procesando',
        progreso: 0
      };
      
      setHistorial(prev => [nuevoProcesamientoHistorial, ...prev]);
      
      // Simular progreso
      simulateProgress(nuevoProcesamientoHistorial.id);
      
      // Resetear formulario
      setFormData({
        tipo: 'Individual',
        nombres: '',
        año: new Date().getFullYear(),
        mes: new Date().getMonth() + 1
      });
      
      alert('Procesamiento iniciado exitosamente');
      
    } catch {
      alert('Error al iniciar el procesamiento');
    } finally {
      //setLoading(false);
    }
  };*/

  /*const simulateProgress = (id: number) => {
    const interval = setInterval(() => {
      setHistorial(prev => prev.map(h => {
        if (h.id === id && h.estado === 'Procesando') {
          const newProgress = h.progreso + Math.random() * 20;
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...h, progreso: 100, estado: 'Completado' };
          }
          return { ...h, progreso: newProgress };
        }
        return h;
      }));
    }, 1000);
  };*/

  // Función para ejecutar un servicio Docker
  const executeDockerService = async (serviceId: string) => {
    if (!serviceId) {
      alert('Por favor, seleccione un servicio');
      return;
    }

    setServiceLoading(true);
    try {
      // Simular llamada a API para ejecutar servicio Docker
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const service = dockerServices.find(s => s.id === serviceId);
      alert(`Servicio "${service?.name}" ejecutado exitosamente`);
      
      // Actualizar el estado después de ejecutar
      await checkDockerStatus(serviceId);
      
    } catch (error) {
      console.error('Error al ejecutar servicio:', error);
      alert('Error al ejecutar el servicio');
    } finally {
      setServiceLoading(false);
    }
  };

  // Función para verificar el estado de un servicio Docker
  const checkDockerStatus = async (serviceId: string) => {
    if (!serviceId) {
      setDockerStatus(null);
      return;
    }

    setServiceLoading(true);
    try {
      // Simular llamada a API para verificar estado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular diferentes estados de respuesta
      const randomStatus = Math.random();
      let status: 'running' | 'stopped' | 'error' | 'unknown';
      let message: string;

      if (randomStatus > 0.7) {
        status = 'running';
        message = 'Servicio ejecutándose correctamente';
      } else if (randomStatus > 0.4) {
        status = 'stopped';
        message = 'Servicio detenido';
      } else if (randomStatus > 0.2) {
        status = 'error';
        message = 'Error en el servicio - Revisar logs';
      } else {
        status = 'unknown';
        message = 'Estado desconocido - No se puede conectar';
      }

      const service = dockerServices.find(s => s.id === serviceId);
      setDockerStatus({
        service: service?.name || serviceId,
        status,
        message
      });

    } catch (error) {
      console.error('Error al verificar estado:', error);
      setDockerStatus({
        service: serviceId,
        status: 'error',
        message: 'Error al verificar el estado del servicio'
      });
    } finally {
      setServiceLoading(false);
    }
  };

  // Función para manejar cambio de servicio seleccionado
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    if (serviceId) {
      checkDockerStatus(serviceId);
    } else {
      setDockerStatus(null);
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      case 'stopped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
      case 'unknown':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getTabConfig = (tabId: TabType) => {
    switch (tabId) {
      case 'atenciones':
        return {
          title: 'Procesamiento de Atenciones',
          description: 'Procesa los datos de atenciones médicas del sistema HIS',
          requiresMonth: true,
          placeholder: 'Ej: Procesamiento atenciones enero 2024'
        };
      case 'reportes':
        return {
          title: 'Procesamiento de Reportes',
          description: 'Genera y procesa reportes estadísticos del sistema',
          requiresMonth: false,
          placeholder: 'Ej: Reporte anual de consultas externas'
        };
      case 'indicadores-fed':
        return {
          title: 'Procesamiento de Indicadores FED',
          description: 'Procesa indicadores de la Ficha de Evaluación de Desempeño',
          requiresMonth: true,
          placeholder: 'Ej: Indicadores FED primer trimestre'
        };
      case 'indicadores-gestion':
        return {
          title: 'Procesamiento de Indicadores de Gestión',
          description: 'Procesa indicadores de gestión administrativa y operativa',
          requiresMonth: false,
          placeholder: 'Ej: Indicadores de gestión anual'
        };
      case 'procesos-internos':
        return {
          title: 'Procesamiento de Procesos Internos',
          description: 'Procesa datos de los procesos internos del sistema',
          requiresMonth: false,
          placeholder: 'Ej: Procesos internos 2024'
        };
      default:
        return {
          title: 'Procesamiento',
          description: 'Configurar procesamiento de datos',
          requiresMonth: false,
          placeholder: 'Nombre del procesamiento'
        };
    }
  };

  /*const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Procesando':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };*/

  const currentConfig = getTabConfig(activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Procesamiento de Datos</h1>
            <p className="text-gray-600 dark:text-gray-400">Configurar y ejecutar procesamientos del sistema</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido específico para Procesos Internos */}
        {activeTab === 'procesos-internos' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {currentConfig.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {currentConfig.description}
              </p>
            </div>

            {/* Sección de control de servicios Docker */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel de control */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Control de Servicios Docker
                </h4>
                
                <div className="space-y-4">
                  {/* Select de servicios */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seleccionar Servicio
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={serviceLoading}
                    >
                      <option value="">-- Seleccione un servicio --</option>
                      {dockerServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botón de ejecutar */}
                  <button
                    onClick={() => executeDockerService(selectedService)}
                    disabled={!selectedService || serviceLoading}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {serviceLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a3 3 0 003-3V7a3 3 0 00-3-3H5a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Ejecutar Servicio
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Panel de estado */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estado del Servicio
                </h4>

                {!selectedService ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Seleccione un servicio para ver su estado
                    </p>
                  </div>
                ) : serviceLoading ? (
                  <div className="text-center py-8">
                    <div className="text-blue-500 mb-2">
                      <svg className="animate-spin mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Verificando estado...
                    </p>
                  </div>
                ) : dockerStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Servicio:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white font-semibold">
                        {dockerStatus.service}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Estado:
                      </span>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(dockerStatus.status)}`}>
                        {dockerStatus.status.charAt(0).toUpperCase() + dockerStatus.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-md border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Mensaje:</span> {dockerStatus.message}
                      </p>
                    </div>

                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Última verificación: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No se pudo obtener el estado del servicio
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
      </div>

      {/* Historial de procesamientos */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historial de Procesamientos
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progreso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/*historial.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.tipo === 'ETL' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {item.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.nombres}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.mes ? `${MESES.find(m => m.value === item.mes)?.label} ${item.año}` : item.año}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(item.estado)}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${item.progreso}%` }}
                        />
                      </div>
                      <span className="text-xs">{Math.round(item.progreso)}%</span>
                    </div>
                  </td>
                </tr>
              )) */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
