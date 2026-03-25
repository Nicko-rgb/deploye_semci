import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBackToApp } from '../../../core/hooks/useBackToApp';

// Simulación de archivos documentarios importados
const documentos = [
  {
    id: 1,
    nombre: 'Presentación Estratégica 2024',
    tipo: 'pptx',
    estrategia: 'Salud Digital',
    categoria: 'Presentaciones',
    fechaImport: '2024-01-15',
    tamaño: '2.5 MB',
    color: 'bg-gradient-to-br from-orange-400 to-orange-600'
  },
  {
    id: 2,
    nombre: 'Manual de Procedimientos',
    tipo: 'pdf',
    estrategia: 'Gestión Calidad',
    categoria: 'Manuales',
    fechaImport: '2024-01-12',
    tamaño: '1.8 MB',
    color: 'bg-gradient-to-br from-green-400 to-green-600'
  },
  {
    id: 3,
    nombre: 'Informe Trimestral Q1',
    tipo: 'docx',
    estrategia: 'Indicadores FED',
    categoria: 'Informes',
    fechaImport: '2024-01-10',
    tamaño: '856 KB',
    color: 'bg-gradient-to-br from-blue-400 to-blue-600'
  },
  {
    id: 4,
    nombre: 'Análisis de Datos HIS',
    tipo: 'xlsx',
    estrategia: 'His Digital',
    categoria: 'Análisis',
    fechaImport: '2024-01-08',
    tamaño: '3.2 MB',
    color: 'bg-gradient-to-br from-purple-400 to-purple-600'
  },
  {
    id: 5,
    nombre: 'Guía de Usuario CNV',
    tipo: 'pdf',
    estrategia: 'Vacunación',
    categoria: 'Guías',
    fechaImport: '2024-01-05',
    tamaño: '1.2 MB',
    color: 'bg-gradient-to-br from-pink-400 to-pink-600'
  },
  {
    id: 6,
    nombre: 'Reporte Seguimiento',
    tipo: 'pptx',
    estrategia: 'Seguimiento',
    categoria: 'Reportes',
    fechaImport: '2024-01-03',
    tamaño: '4.1 MB',
    color: 'bg-gradient-to-br from-indigo-400 to-indigo-600'
  },
  {
    id: 7,
    nombre: 'Protocolo de Atención',
    tipo: 'docx',
    estrategia: 'Atención Primaria',
    categoria: 'Protocolos',
    fechaImport: '2024-01-01',
    tamaño: '678 KB',
    color: 'bg-gradient-to-br from-teal-400 to-teal-600'
  },
  {
    id: 8,
    nombre: 'Dashboard Indicadores',
    tipo: 'xlsx',
    estrategia: 'Indicadores SIS',
    categoria: 'Dashboards',
    fechaImport: '2023-12-28',
    tamaño: '2.9 MB',
    color: 'bg-gradient-to-br from-red-400 to-red-600'
  },
  {
    id: 9,
    nombre: 'Capacitación Personal',
    tipo: 'pptx',
    estrategia: 'Recursos Humanos',
    categoria: 'Capacitaciones',
    fechaImport: '2023-12-25',
    tamaño: '5.3 MB',
    color: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
  },
  {
    id: 10,
    nombre: 'Evaluación Trimestral',
    tipo: 'pdf',
    estrategia: 'Evaluación',
    categoria: 'Evaluaciones',
    fechaImport: '2023-12-22',
    tamaño: '1.5 MB',
    color: 'bg-gradient-to-br from-cyan-400 to-cyan-600'
  },
  {
    id: 11,
    nombre: 'Base de Datos Pacientes',
    tipo: 'xlsx',
    estrategia: 'Padrón Nominal',
    categoria: 'Bases de Datos',
    fechaImport: '2023-12-20',
    tamaño: '8.7 MB',
    color: 'bg-gradient-to-br from-lime-400 to-lime-600'
  },
  {
    id: 12,
    nombre: 'Implementación Sistema',
    tipo: 'docx',
    estrategia: 'Implementación',
    categoria: 'Sistemas',
    fechaImport: '2023-12-18',
    tamaño: '2.1 MB',
    color: 'bg-gradient-to-br from-emerald-400 to-emerald-600'
  }
];

// Tipos de archivo con sus iconos SVG
const tiposArchivo = {
  pptx: {
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.5 7v10l11-5-11-5zM6.5 7v10l1.5-5-1.5-5zM13 12l3-1.5v3L13 12z" />
      </svg>
    ),
    label: 'PowerPoint'
  },
  pdf: {
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    ),
    label: 'PDF'
  },
  docx: {
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    ),
    label: 'Word'
  },
  xlsx: {
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    ),
    label: 'Excel'
  }
};

// Tipos para los filtros
interface FiltrosRepositorio {
  busqueda: string;
  tipo: string;
  estrategia: string;
  categoria: string;
}

// Función para filtrar documentos
const filtrarDocumentos = (docs: typeof documentos, filtros: FiltrosRepositorio) => {
  return docs.filter(doc => {
    if (filtros.busqueda && !doc.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) {
      return false;
    }
    if (filtros.tipo && doc.tipo !== filtros.tipo) {
      return false;
    }
    if (filtros.estrategia && doc.estrategia !== filtros.estrategia) {
      return false;
    }
    if (filtros.categoria && doc.categoria !== filtros.categoria) {
      return false;
    }
    return true;
  });
};

export default function Repositorio() {
  const backLink = useBackToApp();
  const [documentosFiltrados, setDocumentosFiltrados] = useState(documentos);
  const [filtros, setFiltros] = useState<FiltrosRepositorio>({
    busqueda: '',
    tipo: '',
    estrategia: '',
    categoria: ''
  });

  // Obtener valores únicos para los filtros
  const estrategiasUnicas = [...new Set(documentos.map(doc => doc.estrategia))];
  const categoriasUnicas = [...new Set(documentos.map(doc => doc.categoria))];
  const tiposUnicos = [...new Set(documentos.map(doc => doc.tipo))];

  useEffect(() => {
    const resultados = filtrarDocumentos(documentos, filtros);
    setDocumentosFiltrados(resultados);
  }, [filtros]);

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      tipo: '',
      estrategia: '',
      categoria: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700  flex items-center justify-between">
        <div className='flex items-center justify-between'>
          <div className="px-6 py-4 items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Repositorio de Documentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona y visualiza todos los documentos importados al sistema
            </p>
          </div>

        </div>
        <Link to={backLink} className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
          <div className="flex items-center justify-between p-3 ">
            <svg className="w-12 h-12  dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='black'>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar documentos..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
            />
          </div>

          {/* Filtro por tipo */}
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filtros.tipo}
            onChange={(e) => handleFiltroChange('tipo', e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo.toUpperCase()}</option>
            ))}
          </select>

          {/* Filtro por estrategia */}
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filtros.estrategia}
            onChange={(e) => handleFiltroChange('estrategia', e.target.value)}
          >
            <option value="">Todas las estrategias</option>
            {estrategiasUnicas.map(estrategia => (
              <option key={estrategia} value={estrategia}>{estrategia}</option>
            ))}
          </select>

          {/* Filtro por categoría */}
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filtros.categoria}
            onChange={(e) => handleFiltroChange('categoria', e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categoriasUnicas.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          {/* Botón limpiar filtros */}
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {documentosFiltrados.length} de {documentos.length} documentos
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
              Ver todos
            </button>
            <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Recientes
            </button>
          </div>
        </div>

        {/* Grid de documentos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documentosFiltrados.map((documento) => (
            <div
              key={documento.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer group"
            >
              {/* Header colorido */}
              <div className={`${documento.color} p-4 relative`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tiposArchivo[documento.tipo as keyof typeof tiposArchivo]?.icon}
                    <span className="text-white font-medium text-sm">
                      {tiposArchivo[documento.tipo as keyof typeof tiposArchivo]?.label}
                    </span>
                  </div>
                  <button className="text-white hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
                    </svg>
                  </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {documento.nombre}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-medium">Estrategia:</span>
                    <span>{documento.estrategia}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-medium">Categoría:</span>
                    <span>{documento.categoria}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="font-medium">Tamaño:</span>
                    <span>{documento.tamaño}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Importado: {new Date(documento.fechaImport).toLocaleDateString('es-ES')}</span>
                    <div className="flex gap-2">
                      <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {documentosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta ajustar los filtros o buscar con otros términos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
