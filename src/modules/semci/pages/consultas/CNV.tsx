import { useState } from 'react';
import PageHeader from '../../../../core/components/PageHeader';
import { useAppBreadcrumb } from '../../../../core/hooks/useAppBreadcrumb';
import { Baby } from 'lucide-react';

interface CNVData {
  id: number;
  cnv: string;
  numeroDocumento: string;
  apellidosNombres: string;
  eessControlPrenatal: string;
  fecha: string;
  hora: string;
  sexo: 'M' | 'F';
  peso: number;
  apgar1Min: number;
  apgar5Min: number;
  lugarNacimiento: string;
  atendioElParto: string;
  tipoParto: string;
  duracionEmbarazo: number;
  apellidosNombresMadre: string;
  profesion: string;
  colegiatura: string;
  estado: 'Registrado' | 'Pendiente' | 'Observado';
}

/*interface DatosMadre {
  numeroDocumento: string;
  apellidosNombres: string;
  eessControlPrenatal: string;
}

interface DatosNacimiento {
  fecha: string;
  hora: string;
  sexo: string;
  peso: number;
  apgar1Min: number;
  apgar5Min: number;
  lugarNacimiento: string;
}*/

/*interface DatosParto {
  atendioElParto: string;
  tipoParto: string;
  duracionEmbarazo: number;
}

interface DatosPersonalCertifica {
  apellidosNombres: string;
  profesion: string;
  colegiatura: string;
}*/

// Datos de ejemplo con nueva estructura
const cnvData: CNVData[] = [
  {
    id: 1,
    cnv: 'CNV001',
    numeroDocumento: '87654321',
    apellidosNombres: 'TORRES DÍAZ, Carmen Rosa',
    eessControlPrenatal: 'Centro de Salud Callería',
    fecha: '15/08/2023',
    hora: '08:30',
    sexo: 'F',
    peso: 3200,
    apgar1Min: 8,
    apgar5Min: 9,
    lugarNacimiento: 'Hospital Regional de Pucallpa',
    atendioElParto: 'Médico Obstetra',
    tipoParto: 'Vaginal',
    duracionEmbarazo: 39,
    apellidosNombresMadre: 'TORRES DÍAZ, Carmen Rosa',
    profesion: 'Médico Obstetra',
    colegiatura: '12345',
    estado: 'Registrado'
  },
  {
    id: 2,
    cnv: 'CNV002',
    numeroDocumento: '12345678',
    apellidosNombres: 'LÓPEZ MORALES, Rosa María',
    eessControlPrenatal: 'Centro de Salud Manantay',
    fecha: '22/07/2023',
    hora: '14:45',
    sexo: 'M',
    peso: 3400,
    apgar1Min: 9,
    apgar5Min: 10,
    lugarNacimiento: 'Centro de Salud Manantay',
    atendioElParto: 'Obstetra',
    tipoParto: 'Cesárea',
    duracionEmbarazo: 40,
    apellidosNombresMadre: 'LÓPEZ MORALES, Rosa María',
    profesion: 'Obstetra',
    colegiatura: '67890',
    estado: 'Pendiente'
  },
  {
    id: 3,
    cnv: 'CNV003',
    numeroDocumento: '45678901',
    apellidosNombres: 'RÍOS VÁSQUEZ, Ana Sofía',
    eessControlPrenatal: 'Puesto de Salud Yarinacocha',
    fecha: '08/09/2023',
    hora: '10:15',
    sexo: 'F',
    peso: 2800,
    apgar1Min: 7,
    apgar5Min: 8,
    lugarNacimiento: 'Clínica San José',
    atendioElParto: 'Médico General',
    tipoParto: 'Vaginal',
    duracionEmbarazo: 37,
    apellidosNombresMadre: 'RÍOS VÁSQUEZ, Ana Sofía',
    profesion: 'Enfermera',
    colegiatura: '11223',
    estado: 'Observado'
  },
  {
    id: 4,
    cnv: 'CNV004',
    numeroDocumento: '23456789',
    apellidosNombres: 'SILVA VARGAS, Sofía Elena',
    eessControlPrenatal: 'Centro de Salud Campo Verde',
    fecha: '12/10/2023',
    hora: '16:20',
    sexo: 'M',
    peso: 3600,
    apgar1Min: 9,
    apgar5Min: 10,
    lugarNacimiento: 'Hospital Amazónico',
    atendioElParto: 'Médico Especialista',
    tipoParto: 'Cesárea',
    duracionEmbarazo: 41,
    apellidosNombresMadre: 'SILVA VARGAS, Sofía Elena',
    profesion: 'Médico Ginecólogo',
    colegiatura: '44556',
    estado: 'Registrado'
  }
];

export default function CNV() {
  const breadcrumb = useAppBreadcrumb(['CNV']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'busqueda' | 'reporte' | 'exportar'>('busqueda');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<CNVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedRed, setSelectedRed] = useState<string | null>(null);

  const [selectedMicrored, setSelectedMicrored] = useState<string | null>(null);

  const [selectedExportYear, setSelectedExportYear] = useState('---');
  const [selectedExportMonth, setSelectedExportMonth] = useState('---');
  const [selectedExportRed, setSelectedExportRed] = useState('---');

  const mainTableData = [
    { id: 1, name: 'Coronel Portillo', monthlyData: Array(12 * 6).fill(0), totalData: [6611, 16, 3, 97, 8, 0, 6735] },
    { id: 2, name: 'Federico Basadre', monthlyData: Array(12 * 6).fill(0), totalData: [1240, 158, 0, 2, 5, 0, 1189] },
    { id: 3, name: 'Atalaya', monthlyData: Array(12 * 6).fill(0), totalData: [1024, 158, 0, 2, 5, 0, 1189] },
    { id: 4, name: 'Aguaytia', monthlyData: Array(12 * 6).fill(0), totalData: [1024, 158, 0, 2, 5, 0, 1189] },
    { id: 5, name: 'No pertenece a ninguna red', monthlyData: Array(12 * 6).fill(0), totalData: [1024, 158, 0, 2, 5, 0, 1189] },
  ];

  const microRedData = [
    { id: 1, name: 'Yarinacocha', monthlyData: Array(12 * 6).fill(0), totalData: [2145, 12, 1, 45, 5, 0, 2208] },
    { id: 2, name: 'Manantay', monthlyData: Array(12 * 6).fill(0), totalData: [1560, 4, 0, 21, 2, 0, 1587] },
  ];

  const establishmentData = [
    { id: 1, name: 'CS Yarinacocha', monthlyData: Array(12 * 6).fill(0), totalData: [1000, 5, 1, 20, 1, 0, 1027] },
    { id: 2, name: 'CS 9 de Octubre', monthlyData: Array(12 * 6).fill(0), totalData: [500, 2, 0, 10, 0, 0, 512] },
    { id: 3, name: 'PS San Fernando', monthlyData: Array(12 * 6).fill(0), totalData: [350, 5, 0, 5, 0, 0, 360] },
  ];
  const handleRowClick = (redName: string) => {

    setSelectedRed(selectedRed === redName ? null : redName);
    setSelectedMicrored(null);
  };

  const handleMicroredRowClick = (microredName: string) => {
    setSelectedMicrored(selectedMicrored === microredName ? null : microredName);
  };

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const handleBuscar = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingrese el DNI de la madre');
      return;
    }

    if (searchTerm.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    setPacienteEncontrado(null);

    try {

      await new Promise(resolve => setTimeout(resolve, 1000));

      const paciente = cnvData.find(p => p.numeroDocumento === searchTerm);

      if (paciente) {
        setPacienteEncontrado(paciente);
      } else {
        setError('No se encontró registro con el DNI ingresado');
      }
    } catch {
      setError('Error al buscar registro. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };


  const years1 = ['---', '2024', '2025', '2026'];
  const months = ['---', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const reds = ['---', 'CORONEL PORTILLO', 'FEDERICO BASADRE', 'ATALAYA', 'AGUAYTIA', 'NO PERTENECE A NINGUNA RED'];

  const handleExport = () => {

    const filteredData = cnvData.filter(registro => {
      const registroYear = registro.fecha.substring(0, 4);
      const registroMonth = new Date(registro.fecha).toLocaleString('es-ES', { month: 'long' }).toUpperCase();

      return (
        registroYear === selectedExportYear &&
        registroMonth === selectedExportMonth
      );
    });


    const csvContent = [
      'CNV,Nº de Documento,Apellidos y Nombres,EESS Control Prenatal,Fecha,Hora,Sexo,Peso,Apgar 1 Min,Apgar 5 Min,Lugar de Nacimiento,Atendio el Parto,Tipo de Parto,Duración del Embarazo,Apellidos y Nombres Madre,Profesión,Colegiatura',
      ...filteredData.map(registro =>
        `${registro.cnv},${registro.numeroDocumento},${registro.apellidosNombres},${registro.eessControlPrenatal},${registro.fecha},${registro.hora},${registro.sexo},${registro.peso},${registro.apgar1Min},${registro.apgar5Min},${registro.lugarNacimiento},${registro.atendioElParto},${registro.tipoParto},${registro.duracionEmbarazo},${registro.apellidosNombresMadre},${registro.profesion},${registro.colegiatura}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cnv_hechos_vitales_${selectedExportYear}_${selectedExportMonth}_${selectedExportRed}.csv`;
    link.click();
  };


  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="CNV - Hechos Vitales RENIEC"
        description="Certificado de Nacido Vivo - Registro de partos y nacimientos"
        icon={Baby}
        color="#EC4899"
        breadcrumb={breadcrumb}
        badge={[
          { label: 'Fuente: Hechos Vitales - RENIEC' },
          { label: 'Actualizado: 07/08/2024 16:52' },
        ]}
      />

      {/* Tabs principales */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-0" aria-label="Tabs">
            {[
              { id: 'busqueda', name: '🔍 Búsqueda', active: selectedTab === 'busqueda' },
              { id: 'reporte', name: '📊 Reporte', active: selectedTab === 'reporte' },
              { id: 'exportar', name: '📁 Exportar Padrón', active: selectedTab === 'exportar' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as 'busqueda' | 'reporte' | 'exportar')}
                className={`px-6 py-3 font-medium text-sm border-r border-gray-200 dark:border-gray-700 ${tab.active
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'busqueda' && (
            <div className="space-y-6">
              {/* Formulario de búsqueda */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    DNI MADRE:
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setSearchTerm(value);
                        setError('');
                      }}
                      placeholder="Ingrese DNI de la madre"
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      maxLength={8}
                    />
                    <button
                      onClick={handleBuscar}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                      {loading ? (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                      Buscar
                    </button>
                  </div>

                  {error && (
                    <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
                      <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resultado de búsqueda */}
              {pacienteEncontrado && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-lg">
                    <h3 className="text-lg font-bold">RESULTADO DE BÚSQUEDA</h3>
                  </div>

                  {/* Tabla de datos completa */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th colSpan={4} className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-blue-100 dark:bg-blue-900">
                              DATOS DE LA MADRE
                            </th>
                            <th colSpan={7} className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-green-100 dark:bg-green-900">
                              DATOS DEL NACIMIENTO
                            </th>
                            <th colSpan={3} className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-yellow-100 dark:bg-yellow-900">
                              DATOS DEL PARTO
                            </th>
                            <th colSpan={3} className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-purple-100 dark:bg-purple-900">
                              DATOS DEL PERSONAL QUE CERTIFICA EL NACIMIENTO
                            </th>
                          </tr>
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">CNV</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Nº de Documento</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Apellidos y Nombres</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">EESS Control Prenatal</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Fecha</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Hora</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Sexo</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Peso</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Apgar 1 Min</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Apgar 5 Min</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Lugar de Nacimiento</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Atendio el Parto</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Tipo de Parto</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Duración del Embarazo</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Apellidos y Nombres</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Profesión</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">Colegiatura</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium">{pacienteEncontrado.cnv}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.numeroDocumento}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium">{pacienteEncontrado.apellidosNombres}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.eessControlPrenatal}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.fecha}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.hora}</td>
                            <td className="px-3 py-3 text-sm text-center text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${pacienteEncontrado.sexo === 'F'
                                ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                {pacienteEncontrado.sexo}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.peso}g</td>
                            <td className="px-3 py-3 text-sm text-center text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.apgar1Min}</td>
                            <td className="px-3 py-3 text-sm text-center text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.apgar5Min}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.lugarNacimiento}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.atendioElParto}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${pacienteEncontrado.tipoParto === 'Vaginal'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                }`}>
                                {pacienteEncontrado.tipoParto}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-center text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.duracionEmbarazo} sem</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.apellidosNombresMadre}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.profesion}</td>
                            <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{pacienteEncontrado.colegiatura}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {!loading && !pacienteEncontrado && !error && (
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Instrucciones de Búsqueda</h3>
                      <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Ingrese el DNI de la madre (8 dígitos)</li>
                        <li>• Para pruebas, use los documentos: <strong>87654321</strong>, <strong>12345678</strong>, <strong>45678901</strong> o <strong>23456789</strong></li>
                        <li>• Los datos mostrados incluyen información del nacimiento, parto y personal certificador</li>
                        <li>• Haga clic en "Buscar" para consultar los registros de hechos vitales</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'reporte' && (
            <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Datos Mensuales
                </h3>
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                    Seleccionar Año:
                  </label>
                  <select
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-600 dark:border-gray-600">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-gray-400 dark:bg-gray-700">#</th>
                        <th rowSpan={2} className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-red-400 dark:bg-gray-700">RED</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-400 dark:bg-green-800">ENE</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-400 dark:bg-yellow-800">FEB</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-400 dark:bg-green-800">MAR</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-400 dark:bg-yellow-800">ABR</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-400 dark:bg-green-800">MAY</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-400 dark:bg-yellow-800">JUN</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-400 dark:bg-green-800">JUL</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-400 dark:bg-yellow-800">AGO</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-400 dark:bg-green-800">SEP</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-400 dark:bg-yellow-800">OCT</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-400 dark:bg-green-800">NOV</th>
                        <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-400 dark:bg-yellow-800">DIC</th>
                        <th colSpan={7} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-blue-400 dark:bg-blue-800">TOTAL</th>
                      </tr>
                      <tr>
                        {Array.from({ length: 12 }).flatMap((_, monthIndex) => [
                          <th key={`mes-${monthIndex}-1`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PI</th>,
                          <th key={`mes-${monthIndex}-2`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PD</th>,
                          <th key={`mes-${monthIndex}-3`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PCT</th>,
                          <th key={`mes-${monthIndex}-4`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PO</th>,
                          <th key={`mes-${monthIndex}-5`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PVP</th>,
                          <th key={`mes-${monthIndex}-6`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PNC</th>,
                        ])}
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PI</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PD</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PCT</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PO</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PVP</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PNC</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mainTableData.map((red) => (
                        <tr
                          key={red.id}
                          onClick={() => handleRowClick(red.name)}
                          className={`cursor-pointer ${selectedRed === red.name ? 'bg-blue-100 dark:bg-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">{red.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">{red.name}</td>
                          {red.monthlyData.map((data, i) => (
                            <td key={i} className="px-2 py-2 text-sm text-center text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">
                              {data}
                            </td>
                          ))}
                          {red.totalData.map((total, i) => (
                            <td key={`total-${i}`} className="px-2 py-2 text-sm text-center font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">
                              {total}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedRed && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    PARTOS ATENDIDOS POR MICROREDES DE LA RED {selectedRed?.toUpperCase()}
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-600 dark:border-gray-600">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th rowSpan={2} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-gray-300 dark:bg-gray-700">#</th>
                            <th rowSpan={2} className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-red-300 dark:bg-gray-700">MICRORED</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-300 dark:bg-green-800">ENE</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-300 dark:bg-yellow-800">FEB</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-300 dark:bg-green-800">MAR</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-300 dark:bg-yellow-800">ABR</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-300 dark:bg-green-800">MAY</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-300 dark:bg-yellow-800">JUN</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-300 dark:bg-green-800">JUL</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-300 dark:bg-yellow-800">AGO</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-300 dark:bg-green-800">SEP</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-300 dark:bg-yellow-800">OCT</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-300 dark:bg-green-800">NOV</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-300 dark:bg-yellow-800">DIC</th>
                            <th colSpan={7} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-blue-300 dark:bg-blue-800">TOTAL</th>
                          </tr>
                          <tr>
                            {Array.from({ length: 12 }).flatMap((_, monthIndex) => [
                              <th key={`mes-${monthIndex}-1`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PI</th>,
                              <th key={`mes-${monthIndex}-2`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PD</th>,
                              <th key={`mes-${monthIndex}-3`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PCT</th>,
                              <th key={`mes-${monthIndex}-4`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PO</th>,
                              <th key={`mes-${monthIndex}-5`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PVP</th>,
                              <th key={`mes-${monthIndex}-6`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PNC</th>,
                            ])}
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PI</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PD</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PCT</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PO</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PVP</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PNC</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {microRedData.map((microred) => (
                            <tr
                              key={microred.id}
                              onClick={() => handleMicroredRowClick(microred.name)}
                              className={`cursor-pointer ${selectedMicrored === microred.name ? 'bg-blue-100 dark:bg-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                            >
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">{microred.id}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">{microred.name}</td>
                              {microred.monthlyData.map((data, i) => (
                                <td key={i} className="px-2 py-2 text-sm text-center text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">
                                  {data}
                                </td>
                              ))}
                              {microred.totalData.map((total, i) => (
                                <td key={`total-${i}`} className="px-2 py-2 text-sm text-center font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">
                                  {total}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedMicrored && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    PARTOS ATENDIDOS POR ESTABLECIMIENTOS DE LA MICRORED {selectedMicrored?.toUpperCase()}
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-600 dark:border-gray-600">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th rowSpan={2} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">#</th>
                            <th rowSpan={2} className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-red-200 dark:bg-gray-700">ESTABLECIMIENTO</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-200 dark:bg-green-800">ENE</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-200 dark:bg-yellow-800">FEB</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-200 dark:bg-green-800">MAR</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-200 dark:bg-yellow-800">ABR</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-200 dark:bg-green-800">MAY</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-200 dark:bg-yellow-800">JUN</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-200 dark:bg-green-800">JUL</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-200 dark:bg-yellow-800">AGO</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-200 dark:bg-green-800">SEP</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-200 dark:bg-yellow-800">OCT</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-green-200 dark:bg-green-800">NOV</th>
                            <th colSpan={6} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-yellow-200 dark:bg-yellow-800">DIC</th>
                            <th colSpan={7} className="px-4 py-2 text-center text-xs font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600 bg-blue-200 dark:bg-blue-800">TOTAL</th>
                          </tr>
                          <tr>
                            {Array.from({ length: 12 }).flatMap((_, monthIndex) => [
                              <th key={`mes-${monthIndex}-1`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PI</th>,
                              <th key={`mes-${monthIndex}-2`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PD</th>,
                              <th key={`mes-${monthIndex}-3`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PCT</th>,
                              <th key={`mes-${monthIndex}-4`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PO</th>,
                              <th key={`mes-${monthIndex}-5`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PVP</th>,
                              <th key={`mes-${monthIndex}-6`} className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">PNC</th>,
                            ])}
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PI</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PD</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PCT</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PO</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PVP</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">T-PNC</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase border border-gray-600 dark:border-gray-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {establishmentData.map((establishment) => (
                            <tr key={establishment.id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">{establishment.id}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">{establishment.name}</td>
                              {establishment.monthlyData.map((data, i) => (
                                <td key={i} className="px-2 py-2 text-sm text-center text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">
                                  {data}
                                </td>
                              ))}
                              {establishment.totalData.map((total, i) => (
                                <td key={`total-${i}`} className="px-2 py-2 text-sm text-center font-bold text-gray-900 dark:text-white border border-gray-600 dark:border-gray-600">
                                  {total}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-500 dark:bg-blue-800 text-white px-4 py-2 flex items-center">
                  <span className="font-bold">LEYENDA DE TIPOS DE PARTO</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <span className="w-12 h-12 bg-blue-400 dark:bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 text-center">
                      🏬
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">PI: Parto Institucional</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Realizado en establecimientos de salud</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-12 h-12 bg-green-400 dark:bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 text-center">
                      🏠
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">PD: Parto Domiciliario</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Realizado en domicilio</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-12 h-12 bg-yellow-400 dark:bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 text-center">
                      💼
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">PCT: Parto en Centro de Trabajo</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Ocurrido en lugar laboral</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-12 h-12 bg-blue-400 dark:bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-red-600">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 
                            0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                      </svg>

                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">PO: Parto en Otro Lugar</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Lugares no especificados</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-12 h-12 bg-green-400 dark:bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 text-center">
                      🛣️
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">PVP: Parto en Vía Pública</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Ocurrido en calles o caminos</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-12 h-12 bg-yellow-400 dark:bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 text-center">
                      ❓
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">PNC: Parto No Clasificado</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Sin información del lugar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedTab === 'exportar' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exportar Padrón de Hechos Vitales</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Seleccione los filtros para exportar los registros de hechos vitales en formato CSV</p>


                <div className="flex justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">AÑO:</label>
                    <select
                      value={selectedExportYear}
                      onChange={(e) => setSelectedExportYear(e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {years1.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">MES:</label>
                    <select
                      value={selectedExportMonth}
                      onChange={(e) => setSelectedExportMonth(e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">RED:</label>
                    <select
                      value={selectedExportRed}
                      onChange={(e) => setSelectedExportRed(e.target.value)}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {reds.map(red => (
                        <option key={red} value={red}>{red}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-800 flex items-center gap-2 font-medium mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar
                </button>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    El archivo incluirá {cnvData.filter(registro => {
                      const registroYear = registro.fecha.substring(0, 4);
                      const registroMonth = new Date(registro.fecha).toLocaleString('es-ES', { month: 'long' }).toUpperCase();
                      return (
                        registroYear === selectedExportYear &&
                        registroMonth === selectedExportMonth

                      );
                    }).length} registros filtrados.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
