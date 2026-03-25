import { useState, useEffect } from 'react';

interface ResultadoImportacion {
  exitoso: boolean;
  mensaje: string;
  archivo: string;
  tamaño: string;
  categoria: string;
  estrategia: string;
  año: string;
}

interface InformeSubido {
  id: string;
  nombre: string;
  categoria: string;
  estrategia: string;
  año: string;
  tamaño: string;
  fechaSubida: string;
  tipo: string;
  estado: 'Activo' | 'Procesando' | 'Error';
}

export default function ImportarInformes() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [categoria, setCategoria] = useState('');
  const [estrategia, setEstrategia] = useState('');
  const [año, setAño] = useState(new Date().getFullYear().toString());
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  
  // Estados para la tabla de informes
  const [informesSubidos, setInformesSubidos] = useState<InformeSubido[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [informesPorPagina] = useState(10);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstrategia, setFiltroEstrategia] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [informeAEliminar, setInformeAEliminar] = useState<InformeSubido | null>(null);
  const [pestañaActiva, setPestañaActiva] = useState<'subir' | 'lista'>('subir');

  // Opciones para los selects
  const categorias = [
    'Informes Técnicos',
    'Documentos Normativos',
    'Presentaciones',
    'Manuales',
    'Reportes Estadísticos',
    'Estudios de Investigación',
    'Protocolos',
    'Guías Clínicas',
    'Planes Operativos',
    'Otros'
  ];

  const estrategias = [
    'Salud Infantil',
    'Salud Materna',
    'Salud del Adolescente',
    'Inmunizaciones',
    'Nutrición',
    'Salud Mental',
    'Enfermedades Crónicas',
    'Prevención',
    'Vigilancia Epidemiológica',
    'Gestión de Calidad',
    'Otros'
  ];

  const extensionesPermitidas = ['.pptx', '.ppt', '.docx', '.doc', '.xlsx', '.xls', '.pdf'];

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tipo de archivo
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!extensionesPermitidas.includes(extension)) {
        alert('Tipo de archivo no permitido. Solo se permiten archivos: ' + extensionesPermitidas.join(', '));
        return;
      }

      // Verificar tamaño (máximo 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Tamaño máximo: 50MB');
        return;
      }

      setArchivo(file);
      if (!nombreArchivo) {
        setNombreArchivo(file.name.replace(/\.[^/.]+$/, "")); // Nombre sin extensión
      }
    }
  };

  const obtenerIconoArchivo = (nombreArchivo: string) => {
    const extension = nombreArchivo.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'pptx':
      case 'ppt':
        return (
          <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'docx':
      case 'doc':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'xlsx':
      case 'xls':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
    }
  };

  // Inicializar datos simulados
  useEffect(() => {
    const informesSimulados: InformeSubido[] = [
      {
        id: '1',
        nombre: 'Informe Anual de Inmunizaciones 2024',
        categoria: 'Informes Técnicos',
        estrategia: 'Inmunizaciones',
        año: '2024',
        tamaño: '2.4 MB',
        fechaSubida: '2024-12-15',
        tipo: 'pdf',
        estado: 'Activo'
      },
      {
        id: '2',
        nombre: 'Manual de Procedimientos Salud Materna',
        categoria: 'Manuales',
        estrategia: 'Salud Materna',
        año: '2024',
        tamaño: '1.8 MB',
        fechaSubida: '2024-12-10',
        tipo: 'docx',
        estado: 'Activo'
      },
      {
        id: '3',
        nombre: 'Presentación Indicadores Nutricionales',
        categoria: 'Presentaciones',
        estrategia: 'Nutrición',
        año: '2024',
        tamaño: '5.2 MB',
        fechaSubida: '2024-12-08',
        tipo: 'pptx',
        estado: 'Activo'
      },
      {
        id: '4',
        nombre: 'Protocolo Atención Salud Mental',
        categoria: 'Protocolos',
        estrategia: 'Salud Mental',
        año: '2024',
        tamaño: '1.1 MB',
        fechaSubida: '2024-12-05',
        tipo: 'pdf',
        estado: 'Activo'
      },
      {
        id: '5',
        nombre: 'Estadísticas Salud Infantil Q3',
        categoria: 'Reportes Estadísticos',
        estrategia: 'Salud Infantil',
        año: '2024',
        tamaño: '890 KB',
        fechaSubida: '2024-12-03',
        tipo: 'xlsx',
        estado: 'Procesando'
      },
      {
        id: '6',
        nombre: 'Guía Clínica Enfermedades Crónicas',
        categoria: 'Guías Clínicas',
        estrategia: 'Enfermedades Crónicas',
        año: '2024',
        tamaño: '3.7 MB',
        fechaSubida: '2024-12-01',
        tipo: 'pdf',
        estado: 'Activo'
      },
      {
        id: '7',
        nombre: 'Plan Operativo Vigilancia Epidemiológica',
        categoria: 'Planes Operativos',
        estrategia: 'Vigilancia Epidemiológica',
        año: '2024',
        tamaño: '2.1 MB',
        fechaSubida: '2024-11-28',
        tipo: 'docx',
        estado: 'Activo'
      },
      {
        id: '8',
        nombre: 'Estudio Prevención Adolescentes',
        categoria: 'Estudios de Investigación',
        estrategia: 'Salud del Adolescente',
        año: '2024',
        tamaño: '4.3 MB',
        fechaSubida: '2024-11-25',
        tipo: 'pdf',
        estado: 'Activo'
      },
      {
        id: '9',
        nombre: 'Documento Normativo Gestión Calidad',
        categoria: 'Documentos Normativos',
        estrategia: 'Gestión de Calidad',
        año: '2024',
        tamaño: '1.5 MB',
        fechaSubida: '2024-11-20',
        tipo: 'docx',
        estado: 'Error'
      },
      {
        id: '10',
        nombre: 'Informe Mensual Prevención',
        categoria: 'Informes Técnicos',
        estrategia: 'Prevención',
        año: '2024',
        tamaño: '780 KB',
        fechaSubida: '2024-11-18',
        tipo: 'pdf',
        estado: 'Activo'
      },
      {
        id: '11',
        nombre: 'Base Datos Inmunizaciones Nov',
        categoria: 'Reportes Estadísticos',
        estrategia: 'Inmunizaciones',
        año: '2024',
        tamaño: '6.1 MB',
        fechaSubida: '2024-11-15',
        tipo: 'xlsx',
        estado: 'Activo'
      },
      {
        id: '12',
        nombre: 'Presentación Resultados Nutrición',
        categoria: 'Presentaciones',
        estrategia: 'Nutrición',
        año: '2024',
        tamaño: '8.9 MB',
        fechaSubida: '2024-11-12',
        tipo: 'pptx',
        estado: 'Activo'
      }
    ];
    setInformesSubidos(informesSimulados);
  }, []);

  // Funciones para la tabla
  const informesFiltrados = informesSubidos.filter(informe => {
    const coincideBusqueda = informe.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !filtroCategoria || informe.categoria === filtroCategoria;
    const coincideEstrategia = !filtroEstrategia || informe.estrategia === filtroEstrategia;
    return coincideBusqueda && coincideCategoria && coincideEstrategia;
  });

  const totalPaginas = Math.ceil(informesFiltrados.length / informesPorPagina);
  const indiceInicio = (paginaActual - 1) * informesPorPagina;
  const indiceFin = indiceInicio + informesPorPagina;
  const informesPaginados = informesFiltrados.slice(indiceInicio, indiceFin);

  const confirmarEliminar = (informe: InformeSubido) => {
    setInformeAEliminar(informe);
    setMostrarModalEliminar(true);
  };

  const eliminarInforme = () => {
    if (informeAEliminar) {
      setInformesSubidos(prev => prev.filter(informe => informe.id !== informeAEliminar.id));
      setMostrarModalEliminar(false);
      setInformeAEliminar(null);
    }
  };

  const obtenerEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Procesando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearTamaño = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simularImportacion = async () => {
    if (!archivo || !categoria || !estrategia || !año || !nombreArchivo) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setCargando(true);
    setProgreso(0);
    setResultado(null);
    setMostrarResultado(false);

    // Simular progreso de carga
    const intervalos = [10, 30, 50, 75, 90, 100];
    const tiempos = [500, 800, 1000, 1200, 1500, 2000];

    for (let i = 0; i < intervalos.length; i++) {
      await new Promise(resolve => setTimeout(resolve, tiempos[i]));
      setProgreso(intervalos[i]);
    }

    // Simular resultado (95% exitoso)
    const exitoso = Math.random() > 0.05;
    
    const resultadoSimulado: ResultadoImportacion = {
      exitoso,
      mensaje: exitoso 
        ? `Archivo "${nombreArchivo}" importado correctamente`
        : `Error al importar "${nombreArchivo}": Formato no compatible o archivo corrupto`,
      archivo: nombreArchivo,
      tamaño: formatearTamaño(archivo.size),
      categoria,
      estrategia,
      año
    };

    // Si es exitoso, agregar a la lista de informes
    if (exitoso) {
      const nuevoInforme: InformeSubido = {
        id: Date.now().toString(),
        nombre: nombreArchivo,
        categoria,
        estrategia,
        año,
        tamaño: formatearTamaño(archivo.size),
        fechaSubida: new Date().toISOString().split('T')[0],
        tipo: archivo.name.split('.').pop()?.toLowerCase() || 'unknown',
        estado: 'Activo'
      };
      setInformesSubidos(prev => [nuevoInforme, ...prev]);
    }

    setResultado(resultadoSimulado);
    setMostrarResultado(true);
    setCargando(false);
  };

  const limpiarFormulario = () => {
    setArchivo(null);
    setCategoria('');
    setEstrategia('');
    setAño(new Date().getFullYear().toString());
    setNombreArchivo('');
    setProgreso(0);
    setResultado(null);
    setMostrarResultado(false);
    // Limpiar input file
    const fileInput = document.getElementById('archivo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Informes y Documentos
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Administra documentos técnicos, presentaciones, informes y otros archivos del sistema
        </p>
      </div>

      {/* Pestañas */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button 
              onClick={() => setPestañaActiva('subir')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                pestañaActiva === 'subir' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Subir Archivo</span>
              </div>
            </button>
            <button 
              onClick={() => setPestañaActiva('lista')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                pestañaActiva === 'lista' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Lista de Archivos ({informesSubidos.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido según pestaña activa */}
      {pestañaActiva === 'subir' ? (
        /* Panel de Subida de Archivos */
        <div className="max-w-2xl mx-auto">
          {/* Información de tipos de archivo */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
              </svg>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Tipos de archivo permitidos
              </h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Documentos:</strong> PDF, DOCX, DOC<br/>
              <strong>Presentaciones:</strong> PPTX, PPT<br/>
              <strong>Hojas de cálculo:</strong> XLSX, XLS<br/>
              <strong>Tamaño máximo:</strong> 50MB
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subir Nuevo Archivo
            </h2>
            
            <div className="space-y-4">
              {/* Selección de archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar Archivo *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="space-y-1 text-center">
                    {archivo ? (
                      <div className="flex items-center justify-center space-x-3">
                        {obtenerIconoArchivo(archivo.name)}
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {archivo.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatearTamaño(archivo.size)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                      <label htmlFor="archivo-input" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>{archivo ? 'Cambiar archivo' : 'Seleccionar archivo'}</span>
                        <input
                          id="archivo-input"
                          type="file"
                          accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls"
                          onChange={handleArchivoChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOCX, PPTX, XLSX hasta 50MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Parámetros del archivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estrategia *
                  </label>
                  <select
                    value={estrategia}
                    onChange={(e) => setEstrategia(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Seleccionar estrategia</option>
                    {estrategias.map((est) => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Año *
                  </label>
                  <select
                    value={año}
                    onChange={(e) => setAño(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year.toString()}>{year}</option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Archivo *
                  </label>
                  <input
                    type="text"
                    value={nombreArchivo}
                    onChange={(e) => setNombreArchivo(e.target.value)}
                    placeholder="Ingrese el nombre del archivo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Barra de progreso */}
              {cargando && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Importando archivo...</span>
                    <span>{progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progreso}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <button
                  onClick={limpiarFormulario}
                  disabled={cargando}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Limpiar
                </button>
                <button
                  onClick={simularImportacion}
                  disabled={cargando || !archivo || !categoria || !estrategia || !año || !nombreArchivo}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {cargando ? 'Importando...' : 'Importar'}
                </button>
              </div>
            </div>

            {/* Resultado de la importación */}
            {mostrarResultado && resultado && (
              <div className="mt-6 p-4 rounded-lg border">
                <div className={`${
                  resultado.exitoso 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700' 
                    : 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700'
                }`}>
                  <div className="flex items-center">
                    {resultado.exitoso ? (
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        resultado.exitoso 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {resultado.mensaje}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Panel de Lista de Archivos */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Header con filtros */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Archivos Subidos ({informesFiltrados.length})
            </h2>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Buscar archivos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filtroEstrategia}
                  onChange={(e) => setFiltroEstrategia(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Todas las estrategias</option>
                  {estrategias.map((est) => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estrategia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {informesPaginados.map((informe) => (
                  <tr key={informe.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {obtenerIconoArchivo(`archivo.${informe.tipo}`)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {informe.nombre}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {informe.tamaño} • {informe.año}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{informe.categoria}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{informe.estrategia}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerEstadoBadge(informe.estado)}`}>
                        {informe.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(informe.fechaSubida).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Descargar">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => confirmarEliminar(informe)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando {indiceInicio + 1} a {Math.min(indiceFin, informesFiltrados.length)} de {informesFiltrados.length} resultados
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPaginaActual(pageNumber)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            paginaActual === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {mostrarModalEliminar && informeAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmar Eliminación
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                ¿Estás seguro de que deseas eliminar el archivo <strong>"{informeAEliminar.nombre}"</strong>? 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setMostrarModalEliminar(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarInforme}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
