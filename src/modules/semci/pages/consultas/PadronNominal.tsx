import { useState, useMemo, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import useDebounce from '../../../../core/hooks/useDebounce';
import PageHeader from '../../../../core/components/PageHeader';
import { useAppBreadcrumb } from '../../../../core/hooks/useAppBreadcrumb';
import { ListOrdered } from 'lucide-react';

interface PadronNominalData {
  id: number;
  codPadron: string;
  cnv: string;
  dni: string;
  nombres: string;
  fechaNacimiento: string;
  edad: number;
  tipoSeguro: string;
  estRegistro: string;
  renipress: string;
  eess: string;
  microred: string;
  red: string;
  distrito: string;
  dniMama: string;
  celularMadre: string;
  dniPapa: string;
  sexo: 'M' | 'F';
  estado: 'Activo' | 'Inactivo' | 'Duplicado';
  fechaRegistro: string;
}

interface EdadEspecial {
  rango: string;
  cantidad: number;
  color: string;
  icon: string;
}

interface DashboardStats {
  edadesEspeciales: EdadEspecial[];
  edadesSimples: EdadEspecial[];
  totalNinos: number;
  distribucionSexo: {
    masculino: number;
    femenino: number;
  };
}

interface RankingItem {
  nombre: string;
  poblacion: number;
}
// Datos de ejemplo con nueva estructura
const padronNominal: PadronNominalData[] = [
  {
    id: 1,
    codPadron: 'PN001',
    cnv: 'CNV001',
    dni: '12345678',
    nombres: 'Luis Alberto Mendoza Ríos',
    fechaNacimiento: '15/03/2020',
    edad: 4,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12345',
    eess: 'C.S. Callería',
    microred: 'Callería',
    red: 'Coronel Portillo',
    distrito: 'Callería',
    dniMama: '87654321',
    celularMadre: '987654321',
    dniPapa: '11223344',
    sexo: 'M',
    estado: 'Activo',
    fechaRegistro: '16/03/2020'
  },
  {
    id: 2,
    codPadron: 'PN002',
    cnv: 'CNV002',
    dni: '23456789',
    nombres: 'María Fernanda García López',
    fechaNacimiento: '22/07/2021',
    edad: 3,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12346',
    eess: 'C.S. Manantay',
    microred: 'Manantay',
    red: 'Coronel Portillo',
    distrito: 'Manantay',
    dniMama: '87654322',
    celularMadre: '987654322',
    dniPapa: '11223345',
    sexo: 'F',
    estado: 'Activo',
    fechaRegistro: '23/07/2021'
  },
  {
    id: 3,
    codPadron: 'PN003',
    cnv: 'CNV003',
    dni: '34567890',
    nombres: 'Carlos Andrés Pérez Morales',
    fechaNacimiento: '08/11/2019',
    edad: 5,
    tipoSeguro: 'EsSalud',
    estRegistro: 'Duplicado',
    renipress: '12347',
    eess: 'C.S. Yarinacocha',
    microred: 'Masicea',
    red: 'Coronel Portillo',
    distrito: 'Masicea',
    dniMama: '87654323',
    celularMadre: '987654323',
    dniPapa: '11223346',
    sexo: 'M',
    estado: 'Duplicado',
    fechaRegistro: '09/11/2019'
  },
  {
    id: 4,
    codPadron: 'PN004',
    cnv: 'CNV004',
    dni: '45678901',
    nombres: 'Ana Sofía Rodríguez Silva',
    fechaNacimiento: '12/01/2023',
    edad: 1,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12348',
    eess: 'C.S. Campo Verde',
    microred: 'Ipari',
    red: 'Iparia',
    distrito: 'Iparia',
    dniMama: '87654324',
    celularMadre: '987654324',
    dniPapa: '11223347',
    sexo: 'F',
    estado: 'Activo',
    fechaRegistro: '13/01/2023'
  },
  {
    id: 5,
    codPadron: 'PN005',
    cnv: 'CNV005',
    dni: '56789012',
    nombres: 'Diego Alejandro Torres Vega',
    fechaNacimiento: '05/09/2022',
    edad: 2,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12349',
    eess: 'C.S. Callería',
    microred: 'Callería',
    red: 'Coronel Portillo',
    distrito: 'Callería',
    dniMama: '87654325',
    celularMadre: '987654325',
    dniPapa: '11223348',
    sexo: 'M',
    estado: 'Activo',
    fechaRegistro: '06/09/2022'
  },
  {
    id: 6,
    codPadron: 'PN006',
    cnv: 'CNV006',
    dni: '67890123',
    nombres: 'Isabella Valentina Ruiz Castro',
    fechaNacimiento: '18/04/2024',
    edad: 1,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12350',
    eess: 'C.S. Manantay',
    microred: 'Manantay',
    red: 'Coronel Portillo',
    distrito: 'Manantay',
    dniMama: '87654326',
    celularMadre: '987654326',
    dniPapa: '11223349',
    sexo: 'F',
    estado: 'Activo',
    fechaRegistro: '19/04/2024'
  },
  {
    id: 7,
    codPadron: 'PN007',
    cnv: 'CNV007',
    dni: '77890123',
    nombres: 'Valeria Nicol Vargas Guerra',
    fechaNacimiento: '20/05/2024',
    edad: 2,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12350',
    eess: 'C.S. Manantay',
    microred: 'Puruz',
    red: 'Coronel Portillo',
    distrito: 'Purus',
    dniMama: '87654326',
    celularMadre: '987654326',
    dniPapa: '11223349',
    sexo: 'F',
    estado: 'Activo',
    fechaRegistro: '21/05/2024'
  },
  {
    id: 8,
    codPadron: 'PN008',
    cnv: 'CNV008',
    dni: '87890123',
    nombres: 'Juan Peres Campos',
    fechaNacimiento: '14/06/2024',
    edad: 1,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12350',
    eess: 'C.S. Manantay',
    microred: 'Yurua',
    red: 'Coronel Portillo',
    distrito: 'Yurua',
    dniMama: '87604326',
    celularMadre: '989654326',
    dniPapa: '11223349',
    sexo: 'F',
    estado: 'Inactivo',
    fechaRegistro: '15/06/2024'
  },
  {
    id: 9,
    codPadron: 'PN009',
    cnv: 'CNV009',
    dni: '44678901',
    nombres: 'Ana Valeria Rodríguez Silva',
    fechaNacimiento: '12/07/2024',
    edad: 1,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12348',
    eess: 'C.S. Campo Verde',
    microred: 'Ipari',
    red: 'Iparia',
    distrito: 'Iparia',
    dniMama: '87654324',
    celularMadre: '987654324',
    dniPapa: '11223347',
    sexo: 'F',
    estado: 'Activo',
    fechaRegistro: '13/07/2024'
  },
  {
    id: 10,
    codPadron: 'PN0010',
    cnv: 'CNV0010',
    dni: '54789012',
    nombres: 'Diego  Torres Vega',
    fechaNacimiento: '05/08/2024',
    edad: 1,
    tipoSeguro: 'SIS',
    estRegistro: 'Registrado',
    renipress: '12349',
    eess: 'C.S. Callería',
    microred: 'Callería',
    red: 'Coronel Portillo',
    distrito: 'Callería',
    dniMama: '87654325',
    celularMadre: '987654325',
    dniPapa: '11223348',
    sexo: 'M',
    estado: 'Activo',
    fechaRegistro: '06/08/2022'
  },
];

// Datos para el dashboard estadístico
const dashboardStats: DashboardStats = {
  edadesEspeciales: [
    { rango: '0 a 28 días', cantidad: 29569, color: 'bg-blue-500', icon: '👶' },
    { rango: '0 a 5 meses', cantidad: 193944, color: 'bg-green-500', icon: '🍼' },
    { rango: '6 a 11 meses', cantidad: 190483, color: 'bg-orange-500', icon: '👶' },
    { rango: 'Niños Menores de 1 año', cantidad: 384427, color: 'bg-red-500', icon: '👶' },
    { rango: 'Niños de 1 año', cantidad: 419213, color: 'bg-blue-600', icon: '🚼' },
    { rango: 'Niños de 2 años', cantidad: 464058, color: 'bg-blue-700', icon: '🧒' },
    { rango: 'Niños de 3 años', cantidad: 506136, color: 'bg-green-600', icon: '🧒' }
  ],
  edadesSimples: [
    { rango: 'Niños de 4 años', cantidad: 500267, color: 'bg-blue-500', icon: '🧒' },
    { rango: 'Niños de 5 años', cantidad: 537407, color: 'bg-orange-500', icon: '🧒' }
  ],
  totalNinos: 2812704,
  distribucionSexo: {
    masculino: 1435855,
    femenino: 1376849
  }
};

export default function PadronNominal() {
  const breadcrumb = useAppBreadcrumb(['Padrón Nominal']);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'DNI' | 'NOMBRES' | 'DNI_MADRE'>('DNI');
  const [selectOption, setSelectOption] = useState<string>('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'busqueda'>('busqueda');
  const [activeTab, setActiveTab] = useState<'edades-especiales' | 'ranking' | 'mapa' | 'clasificacion' | 'datos'>('edades-especiales');

  const debouncedSearchTerm = useDebounce(searchTerm, 600);
  useEffect(() => {
    if (debouncedSearchTerm) {
      console.log('Realizando búsqueda con:', debouncedSearchTerm);

    }
  }, [debouncedSearchTerm, searchType]);
  const handleSearchClick = () => {
    console.log('Búsqueda manual iniciada con:', searchTerm);
  };

  // Lógica para procesar los datos del ranking
  const rankingFinal = useMemo(() => {
    const rankingPorDistrito: { [key: string]: number } = padronNominal.reduce((acc, current) => {
      acc[current.distrito] = (acc[current.distrito] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const rankingArray: RankingItem[] = Object.keys(rankingPorDistrito).map(distrito => ({
      nombre: distrito,
      poblacion: rankingPorDistrito[distrito]
    }));

    rankingArray.sort((a, b) => b.poblacion - a.poblacion);
    return rankingArray;
  }, []);

  const maxPoblacion = useMemo(() => {
    return rankingFinal.length > 0
      ? Math.max(...rankingFinal.map(item => item.poblacion))
      : 0;
  }, [rankingFinal]);

  const getHighchartsColor = (poblacion: number): string => {
    const porcentaje = (poblacion / maxPoblacion) * 100;
    if (porcentaje > 75) {
      return '#22C55E'; // verde
    } else if (porcentaje > 50) {
      return '#3B82F6'; // azul
    } else if (porcentaje > 25) {
      return '#F59E0B'; // naranja
    } else {
      return '#EF4444'; // rojo
    }
  };

  const chartData = useMemo(() => {
    return rankingFinal.map(item => ({
      y: item.poblacion,
      color: getHighchartsColor(item.poblacion)
    }));
  }, [rankingFinal, maxPoblacion]);

  const getListItemColorClass = (poblacion: number) => {
    const porcentaje = (poblacion / maxPoblacion) * 100;
    if (porcentaje > 75) {
      return 'bg-green-400 dark:bg-green-900';
    } else if (porcentaje > 50) {
      return 'bg-blue-400 dark:bg-blue-900';
    } else if (porcentaje > 25) {
      return 'bg-yellow-400 dark:bg-yellow-900';
    } else {
      return 'bg-red-400 dark:bg-red-900';
    }
  };

  const opcionesExportacion = [
    'Duplicados',
    'Otras regiones',
    'Otras redes de (distrito) de Ucayali',
    'Sin establecimientos',
    'Sin seguro',
    'Por EESS Micro Red',
    'Visitas por programa',
    'Nacidos en EsSalud',
    'Indocumentados',
  ];

  // Filtrado usando el valor debounced
  const filteredPadron = useMemo(() => {
    return padronNominal.filter(registro => {
      const matchesSearch = searchType === 'DNI'
        ? registro.dni.includes(debouncedSearchTerm)
        : searchType === 'NOMBRES'
          ? registro.nombres.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          : registro.dniMama.includes(debouncedSearchTerm);

      return matchesSearch;
    });
  }, [debouncedSearchTerm, searchType]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactivo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Duplicado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleExport = () => {
    let dataToExport;

    switch (selectOption) {
      case 'Duplicados':
        dataToExport = padronNominal.filter(registro => registro.estRegistro === 'Duplicado');
        break;
      default:
        dataToExport = filteredPadron;
        break;
    }

    const csvContent = [
      'COD.PADRON,CNV,DNI,NOMBRES,FEC.NACIMIENTO,ED,TIPO SEGURO,EST.REGISTRO,RENIPRESS,EE.SS,MICRORED,RED,DISTRITO,DNI MAMA,CELULAR MADRE,DNI PAPA',
      ...dataToExport.map(registro =>
        `${registro.codPadron},${registro.cnv},${registro.dni},${registro.nombres},${registro.fechaNacimiento},${registro.edad},${registro.tipoSeguro},${registro.estRegistro},${registro.renipress},${registro.eess},${registro.microred},${registro.red},${registro.distrito},${registro.dniMama},${registro.celularMadre},${registro.dniPapa}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `padron_nominal_${selectOption || 'general'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Tabs del Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard Estadístico - Padrón Nominal Ucayali
          </h2>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'edades-especiales', name: 'Edades Especiales', icon: '👶' },
              { id: 'ranking', name: 'Ranking por Población', icon: '📊' },
              { id: 'mapa', name: 'Mapa de Población', icon: '🗺️' },
              { id: 'clasificacion', name: 'Clasificación Municipal', icon: '🏛️' },
              { id: 'datos', name: 'Datos Poblacionales', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'edades-especiales' | 'ranking' | 'mapa' | 'clasificacion' | 'datos')}
                className={`${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'edades-especiales' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Edades Especiales */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Edades Especiales</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {dashboardStats.edadesEspeciales.map((edad, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${edad.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                            {edad.icon}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{edad.rango}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {edad.cantidad.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edades Simples y Gráfico */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Edades Simples</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {dashboardStats.edadesSimples.map((edad, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${edad.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                          {edad.icon}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{edad.rango}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {edad.cantidad.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gráfico Circular de Distribución por Sexo */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">Total de Niñ@s</h4>
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#ef4444"
                        strokeWidth="20"
                        fill="transparent"
                        strokeDasharray={`${(dashboardStats.distribucionSexo.femenino / dashboardStats.totalNinos) * 251.2} 251.2`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        fill="transparent"
                        strokeDasharray={`${(dashboardStats.distribucionSexo.masculino / dashboardStats.totalNinos) * 251.2} 251.2`}
                        strokeDashoffset={`-${(dashboardStats.distribucionSexo.femenino / dashboardStats.totalNinos) * 251.2}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {dashboardStats.totalNinos.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Femenino: {dashboardStats.distribucionSexo.femenino.toLocaleString()}
                        ({((dashboardStats.distribucionSexo.femenino / dashboardStats.totalNinos) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Masculino: {dashboardStats.distribucionSexo.masculino.toLocaleString()}
                        ({((dashboardStats.distribucionSexo.masculino / dashboardStats.totalNinos) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-600 dark:text-white mb-4">
                Ranking por Población - Distritos de Ucayali
              </h3>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Gráfico a la izquierda */}
                <div className="flex-1 dark:text-white">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: 'column',
                        backgroundColor: 'transparent'
                      },
                      title: {
                        text: 'Ranking por Población - Distritos de Ucayali',
                      },
                      xAxis: {
                        categories: rankingFinal.map(item => item.nombre),
                        title: { text: 'Distritos', style: { color: '#6B7280' } },
                        labels: { style: { color: '#6B7280' } }
                      },
                      yAxis: {
                        min: 0,
                        title: { text: 'Población', style: { color: '#6B7280' } },
                        labels: { style: { color: '#6B7280' } }
                      },
                      plotOptions: {
                        column: {
                          dataLabels: { enabled: true },
                        }
                      },
                      series: [{
                        type: 'column',
                        name: 'Población',
                        data: chartData
                      }],
                      credits: { enabled: false },
                      legend: { enabled: false }
                    }}
                  />
                </div>
                {/* Lista del ranking a la derecha */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Lista de Distritos
                  </h3>
                  <ul className="space-y-4 mt-6">
                    {rankingFinal.map((item, index) => (
                      <li
                        key={item.nombre}
                        className={`flex items-center justify-between p-4 rounded-lg shadow-sm ${getListItemColorClass(item.poblacion)}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-12 h-12 ${getListItemColorClass(item.poblacion)} rounded-lg flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 text-center`}></span>
                          <span className="text-lg font-bold text-gray-700 dark:text-gray-200 w-8 text-center">
                            {index + 1}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {item.nombre}
                          </span>
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                          {item.poblacion.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'edades-especiales' && activeTab !== 'ranking' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">En Desarrollo</h3>
              <p className="text-gray-600 dark:text-gray-400">Esta sección estará disponible próximamente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBusqueda = () => (
    <div className="space-y-6">
      {/* Formulario de búsqueda mejorado */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="flex gap-6 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="DNI"
                checked={searchType === 'DNI'}
                onChange={(e) => setSearchType(e.target.value as 'DNI' | 'NOMBRES' | 'DNI_MADRE')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">DNI NIÑ@</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="NOMBRES"
                checked={searchType === 'NOMBRES'}
                onChange={(e) => setSearchType(e.target.value as 'DNI' | 'NOMBRES' | 'DNI_MADRE')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">NOMBRES NIÑ@</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="DNI_MADRE"
                checked={searchType === 'DNI_MADRE'}
                onChange={(e) => setSearchType(e.target.value as 'DNI' | 'NOMBRES' | 'DNI_MADRE')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">DNI MADRE</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {/* Input con botón de búsqueda integrado */}
            <div className="md:col-span-2">
              <div className="flex">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    if (searchType === 'DNI' || searchType === 'DNI_MADRE') {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setSearchTerm(value);
                    } else {
                      setSearchTerm(e.target.value);
                    }
                  }}
                  placeholder={
                    searchType === 'DNI' ? "12345678" :
                      searchType === 'NOMBRES' ? "Nombres del niño/a" :
                        "DNI de la madre"
                  }
                  className="flex-1 px-4 py-3 border border-r-0 border-gray-300 dark:border-gray-600 
                             rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                             dark:bg-gray-700 dark:text-white placeholder-gray-400"
                  maxLength={searchType === 'DNI' || searchType === 'DNI_MADRE' ? 8 : undefined}
                />
                <button
                  onClick={handleSearchClick}
                  className="px-6 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 
                             border border-blue-600 flex items-center justify-center gap-2 
                             transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="md:col-span-1 lg:col-span-5 flex justify-end items-center gap-4">
              <select
                value={selectOption}
                onChange={(e) => setSelectOption(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Tipos de Exportacion</option>
                {opcionesExportacion.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
              <button
                onClick={handleExport}
                className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2 font-medium whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de búsqueda activa */}
      {debouncedSearchTerm !== searchTerm && searchTerm && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-blue-700 dark:text-blue-300">Buscando...</span>
        </div>
      )}

      {/* Tabla completa */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4">
          <h3 className="text-lg font-bold">DATOS DEL PACIENTE</h3>
          <p className="text-sm text-purple-100 mt-1">
            Mostrando {filteredPadron.length} de {padronNominal.length} registros
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">#</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">COD. PADRON</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">CNV</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">DNI</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">NOMBRES</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">FEC. NACIMIENTO</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">ED</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">TIPO SEGURO</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">EST. REGISTRO</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">RENIPRESS</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">EE.SS.</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">MICRORED</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">RED</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">DISTRITO</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">DNI MAMA</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">CELULAR MADRE</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase border border-gray-300 dark:border-gray-600">DNI PAPA</th>
              </tr>
            </thead>
            <tbody>
              {filteredPadron.map((registro, index) => (
                <tr key={registro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{index + 1}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.codPadron}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.cnv}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium">{registro.dni}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.nombres}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.fechaNacimiento}</td>
                  <td className="px-3 py-2 text-sm text-center text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.edad}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${registro.tipoSeguro === 'SIS'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                      {registro.tipoSeguro}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(registro.estado)}`}>
                      {registro.estRegistro}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.renipress}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.eess}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.microred}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.red}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.distrito}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.dniMama}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.celularMadre}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">{registro.dniPapa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="PADRON NOMINAL RENIEC"
        description="Registro nominal de niñas y niños - Ucayali"
        icon={ListOrdered}
        color="#8B5CF6"
        breadcrumb={breadcrumb}
        badge={[
          { label: 'Fuente: RENIEC' },
          { label: 'Actualizado: 09/07/2025 09:31' },
        ]}
        extra={
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('busqueda')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'busqueda'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              🔍 Buscar
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              📊 Dashboard
            </button>
          </div>
        }
      />

      {/* Contenido dinámico */}
      {currentView === 'dashboard' ? renderDashboard() : renderBusqueda()}
    </div>
  );
}
