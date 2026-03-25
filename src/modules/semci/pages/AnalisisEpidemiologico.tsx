import * as React from 'react';
import * as XLSX from 'xlsx';
import Highcharts from 'highcharts';
import { Link } from 'react-router-dom';
import HighchartsReact from 'highcharts-react-official';
//import { anios, redes } from '../utils/accesories';
import { accessoriesService, type microredes } from '../../settings/services/accessoriesService';
import { boletinEpiService, type EdasAcuosa, type EdasDesintericas, type Iras, type IrasTable } from '../services/BoletinEpiService';

interface FiltrosAnalisis {
  anio: string;
  semanaEpidemiologica: string;
  codigo_red: string;
  codigo_microred: string;
}


export default function AnalisisEpidemiologico() {
  const [datosGraficoEDAS, setDatosGraficoEDAS] = React.useState<EdasAcuosa[]>([]);
  const [datosGraficoEDASDisenteria, setDatosGraficoEDASDisenteria] = React.useState<EdasDesintericas[]>([]);
  const [datosGraficoIRAS, setDatosGraficoIRAS] = React.useState<Iras[]>([]);
  const [tablaMicrorredes, setTablaMicrorredes] = React.useState<IrasTable[]>([]);
  const [microredes, setMicroredes] = React.useState<microredes[]>([]);

  // Datos de muestra para Dengue
  const datosDengueHistorico = {
    años: ['2021', '2022', '2023', '2024', '2025'],
    confirmados: [
      [60, 35, 12, 8, 5, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [10, 8, 5, 3, 2, 1, 1, 1, 12, 15, 8, 5, 3, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [30, 45, 65, 85, 105, 125, 135, 120, 95, 75, 55, 45, 35, 25, 20, 15, 12, 10, 8, 5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [8, 5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 22, 25, 28, 15, 8, 5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    probables: [
      [20, 15, 8, 5, 3, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [5, 3, 2, 1, 1, 1, 1, 1, 8, 10, 5, 3, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [50, 70, 90, 110, 130, 150, 170, 140, 110, 85, 65, 45, 35, 25, 20, 15, 12, 10, 8, 5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [8, 5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [12, 8, 5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 35, 40, 45, 25, 15, 8, 5, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    defunciones: [308, 330, 1825, 30, 136]
  };

  const datosDengue2025 = {
    confirmados: [1, 1, 1, 2, 2, 4, 3, 4, 5, 1, 7, 3, 3, 1, 1, 3, 1, 4, 3, 1, 1, 1, 17, 21, 20, 11, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    probables: [0, 1, 1, 2, 2, 2, 4, 5, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 17, 21, 20, 11, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };

  const datosZonasEpidemia = [
    { zona: 'Zona Alarma', color: '#00BFFF', datos: Array(52).fill(0).map((_, i) => i < 25 ? Math.random() * 180 : 0) },
    { zona: 'Zona Segura', color: '#90EE90', datos: Array(52).fill(0).map((_, i) => i < 25 ? Math.random() * 110 : 0) },
    { zona: 'Zona Éxito', color: '#FFD700', datos: Array(52).fill(0).map((_, i) => i < 25 ? Math.random() * 20 : 0) },
    { zona: 'Casos', color: '#D3D3D3', datos: [1, 3, 4, 6, 8, 10, 12, 15, 17, 20, 22, 25, 27, 21, 18, 15, 12, 10, 8, 6, 4, 3, 32, 21, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
  ];

  const datosDistrito = [
    { distrito: 'CALLERIA', confirmados: 45, probables: 35 },
    { distrito: 'MANANTAY', confirmados: 25, probables: 20 },
    { distrito: 'MASISEA', confirmados: 0, probables: 8 },
    { distrito: 'IPARIA', confirmados: 0, probables: 8 }
  ];

  const datosEdad = [
    { grupo: '0 a 11 Etapa Niño', confirmados: 25, probables: 20, masculino: 0, femenino: 0 },
    { grupo: '12 a 17 Etapa Adolescente', confirmados: 8, probables: 11, masculino: 0, femenino: 0 },
    { grupo: '18 a 29 Etapa Joven', confirmados: 16, probables: 11, masculino: 0, femenino: 0 },
    { grupo: '30 a 59 Etapa Adulto', confirmados: 20, probables: 15, masculino: 0, femenino: 0 },
    { grupo: '60 + Adulto Mayor', confirmados: 5, probables: 5, masculino: 62, femenino: 74 }
  ];

  const tablaDengueData = [
    {
      microrred: '09 DE OCTUBRE',
      eess: 'NUEVA MAGDALENA',
      sinSignos: 318,
      conSignosGrave: 0,
      confirmado: 18,
      probable: 267,
      descartado: 0,
      total: 318,
      porcentaje: 42.06,
      tiaX10000: 13.99,
      defunciones: 0
    },
    // ... más datos de ejemplo
  ];

  // Datos de muestra para Febriles
  const datosFebriles2025 = Array.from({ length: 52 }, (_, i) => {
    const semana = i + 1;
    if (semana <= 25) {
      // Datos para las primeras 25 semanas con picos
      if (semana >= 10 && semana <= 14) return Math.floor(Math.random() * 200) + 800; // Pico principal
      if (semana >= 18 && semana <= 22) return Math.floor(Math.random() * 150) + 550; // Segundo pico
      return Math.floor(Math.random() * 300) + 300;
    }
    return 0;
  });

  const datosFebriles2023 = Array.from({ length: 52 }, (_, i) => {
    const semana = i + 1;
    if (semana >= 18 && semana <= 22) return Math.floor(Math.random() * 200) + 750; // Pico 2023
    if (semana >= 45 && semana <= 50) return Math.floor(Math.random() * 100) + 400; // Pico final
    return Math.floor(Math.random() * 200) + 200;
  });

  const datosFebriles2024 = Array.from({ length: 52 }, (_, i) => {
    const semana = i + 1;
    if (semana >= 12 && semana <= 15) return Math.floor(Math.random() * 150) + 850; // Pico principal 2024
    if (semana >= 45 && semana <= 50) return Math.floor(Math.random() * 200) + 600; // Pico final 2024
    return Math.floor(Math.random() * 200) + 250;
  });

  const tablaFebrilesData = [
    { microrred: '9 DE OCTUBRE', menorUno: 712, uno4: 2343, cinco9: 1223, diez19: 980, veinte59: 1112, mayor60: 194, total: 6564, porcentaje: 53.06 },
    { microrred: 'IPARIA', menorUno: 11, uno4: 32, cinco9: 12, diez19: 19, veinte59: 12, mayor60: 5, total: 36, porcentaje: 0.29 },
    { microrred: 'MASISEA', menorUno: 79, uno4: 319, cinco9: 172, diez19: 151, veinte59: 177, mayor60: 41, total: 939, porcentaje: 7.59 },
    { microrred: 'SAN FERNANDO', menorUno: 524, uno4: 1729, cinco9: 865, diez19: 706, veinte59: 821, mayor60: 136, total: 4781, porcentaje: 38.65 },
    { microrred: 'YURUA', menorUno: 0, uno4: 0, cinco9: 0, diez19: 0, veinte59: 0, mayor60: 0, total: 0, porcentaje: 0.00 }
  ];

  const totalFebrilesGeneral = {
    menorUno: 1326,
    uno4: 4423,
    cinco9: 2272,
    diez19: 1856,
    veinte59: 2122,
    mayor60: 371,
    total: 12370,
    porcentaje: 100.00
  };
  const [filtros, setFiltros] = React.useState<FiltrosAnalisis>({
    anio: new Date().getFullYear().toString(),
    semanaEpidemiologica: '3',
    codigo_red: '',
    codigo_microred: ''
  });

  const [tabActiva, setTabActiva] = React.useState('edas');
  const [dropdownAbierto, setDropdownAbierto] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAbierto(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (id: string) => {
    setDropdownAbierto(dropdownAbierto === id ? null : id);
  };

  // Funciones de exportación usando html2canvas y jsPDF
  const exportarGraficoPNG = async (elementId: string, filename: string) => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Error exportando PNG:', error);
    }
  };

  const exportarGraficoJPEG = async (elementId: string, filename: string) => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `${filename}.jpeg`;
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
      }
    } catch (error) {
      console.error('Error exportando JPEG:', error);
    }
  };

  // Datos simulados

  const semanasEpidemiologicas = Array.from({ length: 53 }, (_, i) => (i + 1).toString());

  const handleInputChange = (field: keyof FiltrosAnalisis, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Configuraciones de Highcharts para los gráficos
  const opcionesGraficoEDAS: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: 600,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Casos de EDAS acuosas por los 15 primeros EE.SS.',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: datosGraficoEDAS.map(item => item.nombre_establecimiento),
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Número de casos',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    tooltip: {
      valueSuffix: ' casos'
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        }
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullscreen',
            'printChart',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'separator',
            'downloadCSV',
            'downloadXLS',
            'separator',
            'viewData'
          ]
        }
      },
      filename: `EDAS_Acuosas_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`
    },
    series: [{
      name: 'Casos',
      type: 'bar',
      data: datosGraficoEDAS.map(item => Number(item.total)),
      color: '#3B82F6'
    }]
  };

  const opcionesGraficoEDASDisenteria: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: 600,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Casos de EDAS disentéricas por los 15 primeros EE.SS.',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: datosGraficoEDASDisenteria.map(item => item.nombre_establecimiento),
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Número de casos',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    tooltip: {
      valueSuffix: ' casos'
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        }
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullscreen',
            'printChart',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'separator',
            'downloadCSV',
            'downloadXLS',
            'separator',
            'viewData'
          ]
        }
      },
      filename: `EDAS_Disentericas_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`
    },
    series: [{
      name: 'Casos',
      type: 'bar',
      data: datosGraficoEDASDisenteria.map(item => Number(item.total)),
      color: '#EF4444'
    }]
  };

  const opcionesGraficoIRAS: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: 500,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Casos de IRAS por los 10 primeros EE.SS.',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: datosGraficoIRAS.map(item => item.nombre_establecimiento),
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Número de casos',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    tooltip: {
      valueSuffix: ' casos'
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        }
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullscreen',
            'printChart',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'separator',
            'downloadCSV',
            'downloadXLS',
            'separator',
            'viewData'
          ]
        }
      },
      filename: `IRAS_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`
    },
    series: [{
      name: 'Casos',
      type: 'bar',
      data: datosGraficoIRAS.map(item => Number(item.total)),
      color: '#F97316'
    }]
  };

  // Configuraciones de gráficos para Dengue
  const opcionesDengueHistorico: Highcharts.Options = {
    chart: {
      type: 'column',
      height: 500,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Casos de Dengue Notificados - Histórico por Semanas Epidemiológicas',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: Array.from({ length: 52 }, (_, i) => `${i + 1}`),
      title: {
        text: 'Semanas Epidemiológicas / Años'
      },
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yAxis: {
      min: 0,
      max: 250,
      title: {
        text: 'Nº de Casos Notificados'
      },
      plotLines: datosDengueHistorico.años.map((año, index) => ({
        color: '#cccccc',
        width: 1,
        value: (index + 1) * 52,
        label: {
          text: año,
          align: 'center',
          style: {
            color: '#666666'
          }
        }
      }))
    },
    tooltip: {
      shared: true,
      valueSuffix: ' casos'
    },
    plotOptions: {
      column: {
        grouping: false,
        shadow: false,
        borderWidth: 0
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'top',
      backgroundColor: 'transparent'
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      filename: `Dengue_Historico_${filtros.anio}`
    },
    series: [{
      name: 'Confirmados',
      type: 'column',
      data: datosDengueHistorico.confirmados.flat(),
      color: '#DC2626'
    }, {
      name: 'Probables',
      type: 'column',
      data: datosDengueHistorico.probables.flat(),
      color: '#1E40AF'
    }]
  };

  const opcionesDengue2025: Highcharts.Options = {
    chart: {
      type: 'column',
      height: 400,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Dengue 2025 - Casos por Semana Epidemiológica',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: Array.from({ length: 52 }, (_, i) => `${i + 1}`),
      title: {
        text: 'Semanas Epidemiológicas'
      }
    },
    yAxis: {
      min: 0,
      max: 25,
      title: {
        text: 'Ntro de Casos'
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' casos'
    },
    plotOptions: {
      column: {
        grouping: true,
        shadow: false,
        borderWidth: 0
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'top'
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      filename: 'Dengue_2025'
    },
    series: [{
      name: 'Confirmados',
      type: 'column',
      data: datosDengue2025.confirmados,
      color: '#DC2626'
    }, {
      name: 'Probables',
      type: 'column',
      data: datosDengue2025.probables,
      color: '#1E40AF'
    }]
  };

  const opcionesZonasEpidemia: Highcharts.Options = {
    chart: {
      type: 'area',
      height: 400,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Zona de Epidemia - 2025',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: Array.from({ length: 52 }, (_, i) => `${i + 1}`),
      title: {
        text: 'Semanas Epidemiológicas'
      }
    },
    yAxis: {
      min: 0,
      max: 250,
      title: {
        text: 'Casos Notificados'
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' casos'
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666'
        }
      }
    },
    legend: {
      align: 'left',
      verticalAlign: 'top',
      x: 100,
      y: 20,
      floating: true,
      backgroundColor: 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      filename: 'Zona_Epidemia_2025'
    },
    series: datosZonasEpidemia.map(zona => ({
      name: zona.zona,
      type: 'area',
      data: zona.datos,
      color: zona.color
    }))
  };

  const opcionesDistrito: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: 300,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Casos de Dengue Notificados por Distrito - 2024',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: datosDistrito.map(item => item.distrito),
      title: {
        text: null
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      },
      labels: {
        overflow: 'justify'
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' casos'
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: false
        }
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'top'
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      filename: 'Dengue_Distritos_2024'
    },
    series: [{
      name: 'Probables',
      type: 'bar',
      data: datosDistrito.map(item => item.probables),
      color: '#1E40AF'
    }, {
      name: 'Confirmados',
      type: 'bar',
      data: datosDistrito.map(item => item.confirmados),
      color: '#DC2626'
    }]
  };

  const opcionesEdad: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: 300,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Casos por Grupo de Edad',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: datosEdad.map(item => item.grupo),
      title: {
        text: null
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' casos'
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        }
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'top'
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      filename: 'Dengue_Grupos_Edad'
    },
    series: [{
      name: 'Confirmados',
      type: 'bar',
      data: datosEdad.map(item => item.confirmados),
      color: '#DC2626'
    }, {
      name: 'Probables',
      type: 'bar',
      data: datosEdad.map(item => item.probables),
      color: '#1E40AF'
    }]
  };

  // Configuraciones de gráficos para Febriles
  const opcionesFebriles: Highcharts.Options = {
    chart: {
      type: 'line',
      height: 500,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Casos Acumulados de Febriles por Años',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: Array.from({ length: 52 }, (_, i) => `${i + 1}`),
      title: {
        text: 'Semanas Epidemiológicas'
      },
      labels: {
        style: {
          fontSize: '10px'
        }
      }
    },
    yAxis: {
      min: 0,
      max: 1200,
      title: {
        text: 'Casos Acumulados'
      },
      plotLines: [{
        color: '#cccccc',
        width: 1,
        value: 0
      }]
    },
    tooltip: {
      shared: true,
      valueSuffix: ' casos'
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: false
        },
        enableMouseTracking: true
      },
      column: {
        grouping: false,
        shadow: false,
        borderWidth: 0
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'top',
      backgroundColor: 'transparent'
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      filename: `Febriles_Comparativo_${filtros.anio}`
    },
    series: [{
      name: '2025',
      type: 'column',
      data: datosFebriles2025,
      color: '#90EE90'
    }, {
      name: '2023',
      type: 'line',
      data: datosFebriles2023,
      color: '#1E40AF',
      marker: {
        enabled: false
      }
    }, {
      name: '2024',
      type: 'line',
      data: datosFebriles2024,
      color: '#DC2626',
      marker: {
        enabled: false
      }
    }]
  };

  const descargarTablaMicrorredExcel = () => {
    const datos = tablaMicrorredes.map(row => ({
      'Microred': row.nom_microred,
      'IRAS < 2m': row.ira_m2,
      'IRAS 2 a 11m': row.ira_2_11,
      'IRAS 1 a 4a': row.ira_1_4a,
      'Neumonía 2 a 11m': row.ngr_2_11,
      'Neumonía 1 a 4a': row.ngr_1_4a,
      'SOB/ASMA < 2a': row.sob_2a,
      'SOB/ASMA 2 a 4a': row.sob_2_4a,
      'Defunciones': 0,
      'Total General': row.total
    }));

    // Agregar fila de totales
    datos.push({
      'Microred': 'TOTAL GENERAL',
      'IRAS < 2m': tablaMicrorredes.reduce((sum, row) => sum + Number(row.ira_m2), 0),
      'IRAS 2 a 11m': tablaMicrorredes.reduce((sum, row) => sum + Number(row.ira_2_11), 0),
      'IRAS 1 a 4a': tablaMicrorredes.reduce((sum, row) => sum + Number(row.ira_1_4a), 0),
      'Neumonía 2 a 11m': tablaMicrorredes.reduce((sum, row) => sum + Number(row.ngr_2_11), 0),
      'Neumonía 1 a 4a': tablaMicrorredes.reduce((sum, row) => sum + Number(row.ngr_1_4a), 0),
      'SOB/ASMA < 2a': tablaMicrorredes.reduce((sum, row) => sum + Number(row.sob_2a), 0),
      'SOB/ASMA 2 a 4a': tablaMicrorredes.reduce((sum, row) => sum + Number(row.sob_2_4a), 0),
      'Defunciones': tablaMicrorredes.reduce((sum) => sum + 0, 0),
      'Total General': tablaMicrorredes.reduce((sum, row) => sum + row.total, 0)
    });

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IRAS por Microrredes');
    XLSX.writeFile(wb, `IRAS_Microrredes_${filtros.anio}_Semana${filtros.semanaEpidemiologica}.xlsx`);
  };

  /*const descargarTablaEstablecimientosExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tablaEstablecimientos.map(item => ({
      'Establecimiento de Salud': item.establecimiento,
      'EDAS': item.edas,
      'IRAS': item.iras,
      'Total': item.total
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Poblacionales');
    XLSX.writeFile(wb, `Datos_Poblacionales_${filtros.anio}_Semana${filtros.semanaEpidemiologica}.xlsx`);
  };*/

  const tabs = [
    { id: 'edas', label: '📊 EDAS', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
    { id: 'iras', label: '📊 IRAS', icon: 'M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2v-10z' },
    { id: 'dengue', label: '🗺️ Dengue', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' },
    { id: 'febriles', label: '🏥 Febriles', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z' },
    { id: 'vif', label: '📋 Violencia Familiar', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z' },
    { id: 'tbc', label: '📋 TBC', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6z' }
  ];

  const obtenerMicroredes = async (codigo_red: string) => {
    if (codigo_red !== '') {
      const datos = await accessoriesService.getMicroredesByCodigoRed(codigo_red);
      setMicroredes(datos);
    }
    else {
      setMicroredes([]);
    }
  };

  const obtenerInformacionBoletinEpi = async () => {
    if (tabActiva === 'edas') {
      const resultEdasAcuosa = await boletinEpiService.getEdasAcuosa(
        Number(filtros.anio),
        Number(filtros.semanaEpidemiologica),
        filtros.codigo_red !== '' ? filtros.codigo_red : undefined,
        filtros.codigo_microred !== '' ? filtros.codigo_microred : undefined);

      setDatosGraficoEDAS(resultEdasAcuosa);

      const resultEdasDisentericas = await boletinEpiService.getEdasDisentericas(
        Number(filtros.anio),
        Number(filtros.semanaEpidemiologica),
        filtros.codigo_red !== '' ? filtros.codigo_red : undefined,
        filtros.codigo_microred !== '' ? filtros.codigo_microred : undefined);

      setDatosGraficoEDASDisenteria(resultEdasDisentericas);
    } else {
      if (tabActiva === 'iras') {
        const resultIras = await boletinEpiService.getIras(
          Number(filtros.anio),
          Number(filtros.semanaEpidemiologica),
          filtros.codigo_red !== '' ? filtros.codigo_red : undefined,
          filtros.codigo_microred !== '' ? filtros.codigo_microred : undefined);

        setDatosGraficoIRAS(resultIras);

        const resultIrasTable = await boletinEpiService.getIrasTable(
          Number(filtros.anio),
          Number(filtros.semanaEpidemiologica),
          filtros.codigo_red !== '' ? filtros.codigo_red : undefined,
          filtros.codigo_microred !== '' ? filtros.codigo_microred : undefined);

        setTablaMicrorredes(resultIrasTable);
      }
    }

  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header con gradiente púrpura similar a la imagen */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-800 text-white rounded-lg shadow-lg p-6 flex items-center justify-between">

        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Dashboard Boletín Estadístico - EPIDEMIOLOGIA
              </h1>
              <p className="text-purple-100 mt-1">
                Fecha de Actualización: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {/* Botón de inicio, se empuja al lado derecho */}
        <Link to="/home/epidemiologia" className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
          <div className="flex items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </Link>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros Globales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filtros de Análisis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Año
              </label>
              <select
                value={filtros.anio}
                onChange={(e) => handleInputChange('anio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {/*anios()?.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))*/}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semana Epidemiológica
              </label>
              <select
                value={filtros.semanaEpidemiologica}
                onChange={(e) => handleInputChange('semanaEpidemiologica', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {semanasEpidemiologicas.map(semana => (
                  <option key={semana} value={semana}>Semana {semana}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Red de Salud
              </label>
              <select
                value={filtros.codigo_red}
                onChange={(e) => { handleInputChange('codigo_red', e.target.value); obtenerMicroredes(e.target.value) }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">---</option>
                {/*redes.map(red => (
                  <option key={red.codigo_red} value={red.codigo_red}>{red.nombre_red}</option>
                ))*/}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Microred
              </label>
              <select
                value={filtros.codigo_microred}
                onChange={(e) => handleInputChange('codigo_microred', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">---</option>
                {microredes?.map(microred => (
                  <option key={Number(microred.codigo_microred)} value={microred.codigo_microred}>{microred.nom_microred}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Botón de búsqueda */}
          <div className="flex justify-center mt-6">
            <button
              type="button"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
              onClick={obtenerInformacionBoletinEpi}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Buscar
            </button>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${tabActiva === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg p-6">
          {/* Pestaña EDAS */}
          {tabActiva === 'edas' && (
            <div className="space-y-8">
              {/* Gráficos de barras horizontales de EDAS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Casos de EDAS acuosas por los 15 primeros EE.SS */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                  {/* Dropdown de exportación */}
                  <div className="flex justify-end mb-4" ref={dropdownRef}>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('edas-acuosas')}
                        className="inline-flex items-center p-2 text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        title="Opciones de exportación"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {dropdownAbierto === 'edas-acuosas' && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                exportarGraficoPNG('grafico-edas-acuosas', `EDAS_Acuosas_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`);
                                setDropdownAbierto(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <span className="mr-3">📸</span>
                              Descargar PNG
                            </button>
                            <button
                              onClick={() => {
                                exportarGraficoJPEG('grafico-edas-acuosas', `EDAS_Acuosas_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`);
                                setDropdownAbierto(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <span className="mr-3">📸</span>
                              Descargar JPEG
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div id="grafico-edas-acuosas">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={opcionesGraficoEDAS}
                    />
                  </div>
                </div>

                {/* Casos de EDAS disentéricas por los 15 primeros EE.SS */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                  {/* Dropdown de exportación */}
                  <div className="flex justify-end mb-4">
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('edas-disentericas')}
                        className="inline-flex items-center p-2 text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        title="Opciones de exportación"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {dropdownAbierto === 'edas-disentericas' && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                exportarGraficoPNG('grafico-edas-disentericas', `EDAS_Disentericas_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`);
                                setDropdownAbierto(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <span className="mr-3">📸</span>
                              Descargar PNG
                            </button>
                            <button
                              onClick={() => {
                                exportarGraficoJPEG('grafico-edas-disentericas', `EDAS_Disentericas_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`);
                                setDropdownAbierto(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <span className="mr-3">📸</span>
                              Descargar JPEG
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div id="grafico-edas-disentericas">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={opcionesGraficoEDASDisenteria}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña IRAS */}
          {tabActiva === 'iras' && (
            <div className="space-y-8">
              {/* Gráfico de barras horizontales de IRAS */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                {/* Dropdown de exportación */}
                <div className="flex justify-end mb-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('iras')}
                      className="inline-flex items-center p-2 text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      title="Opciones de exportación"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {dropdownAbierto === 'iras' && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              exportarGraficoPNG('grafico-iras', `IRAS_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`);
                              setDropdownAbierto(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <span className="mr-3">📸</span>
                            Descargar PNG
                          </button>
                          <button
                            onClick={() => {
                              exportarGraficoJPEG('grafico-iras', `IRAS_${filtros.anio}_Semana${filtros.semanaEpidemiologica}`);
                              setDropdownAbierto(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <span className="mr-3">📸</span>
                            Descargar JPEG
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div id="grafico-iras">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={opcionesGraficoIRAS}
                  />
                </div>
              </div>

              {/* Tabla de microrredes IRAS */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      IRAS por Microrredes y Grupos de Edad
                    </h4>
                    <button
                      onClick={descargarTablaMicrorredExcel}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Descargar Excel</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                          MICRORREDES
                        </th>
                        <th colSpan={3} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                          IRAS
                        </th>
                        <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                          NEUMONÍA
                        </th>
                        <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                          SOB/ASMA
                        </th>
                        <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                          DEF.
                        </th>
                        <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          TOTAL
                        </th>
                      </tr>
                      <tr>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          &lt;2m
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          2 a 11m
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          1 a 4a
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          2 a 11m
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          1 a 4a
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          &lt;2a
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          2 a 4a
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {tablaMicrorredes.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                            {row.nom_microred}
                          </td>
                          {/* IRAS */}
                          <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                            {row.ira_m2}
                          </td>
                          <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                            {row.ira_2_11}
                          </td>
                          <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                            {row.ira_1_4a}
                          </td>
                          {/* NEUMONÍA */}
                          <td className="px-2 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                            {row.ngr_2_11}
                          </td>
                          <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                            {row.ngr_1_4a}
                          </td>
                          {/* SOB/ASMA */}
                          <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                            {row.sob_2a}
                          </td>
                          <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                            {row.sob_2_4a}
                          </td>
                          {/* DEF */}
                          <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                            0
                          </td>
                          {/* TOTAL */}
                          <td className="px-2 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                            {row.total}
                          </td>
                        </tr>
                      ))}
                      {/* Fila de totales */}
                      <tr className="bg-gray-100 dark:bg-gray-600 font-semibold">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                          TOTAL GEN.
                        </td>
                        {/* IRAS Totales */}
                        <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {tablaMicrorredes.reduce((sum, row) => sum + Number(row.ira_m2), 0)}
                        </td>
                        <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {tablaMicrorredes.reduce((sum, row) => sum + Number(row.ira_2_11), 0)}
                        </td>
                        <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {tablaMicrorredes.reduce((sum, row) => sum + Number(row.ira_1_4a), 0)}
                        </td>
                        {/* NEUMONÍA Totales */}
                        <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {tablaMicrorredes.reduce((sum, row) => sum + Number(row.ngr_2_11), 0)}
                        </td>
                        <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {tablaMicrorredes.reduce((sum, row) => sum + Number(row.ngr_1_4a), 0)}
                        </td>
                        {/* SOB/ASMA Totales */}
                        <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {tablaMicrorredes.reduce((sum, row) => sum + Number(row.sob_2a), 0)}
                        </td>
                        <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {tablaMicrorredes.reduce((sum, row) => sum + Number(row.sob_2_4a), 0)}
                        </td>
                        {/* DEF Total */}
                        <td className="px-2 py-3 text-center text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                          {tablaMicrorredes.reduce((sum) => sum + 0, 0)}
                        </td>
                        {/* TOTAL GENERAL */}
                        <td className="px-2 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                          {tablaMicrorredes.reduce((sum, row) => sum + Number(row.total), 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Dengue */}
          {tabActiva === 'dengue' && (
            <div className="space-y-8">
              {/* Gráfico histórico de dengue */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                <div className="flex justify-end mb-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('dengue-historico')}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Exportar</span>
                    </button>
                    {dropdownAbierto === 'dengue-historico' && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                        <div className="py-1">
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                            Descargar PNG
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                            Descargar PDF
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                            Descargar Excel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div id="grafico-dengue-historico">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={opcionesDengueHistorico}
                  />
                </div>
              </div>

              {/* Grid de gráficos de 2025 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico Dengue 2025 */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                  <div id="grafico-dengue-2025">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={opcionesDengue2025}
                    />
                  </div>
                </div>

                {/* Gráfico Zonas de Epidemia */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                  <div id="grafico-zonas-epidemia">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={opcionesZonasEpidemia}
                    />
                  </div>
                </div>
              </div>

              {/* Grid de gráficos demográficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico por Distrito */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                  <div id="grafico-distrito">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={opcionesDistrito}
                    />
                  </div>
                </div>

                {/* Gráfico por Edad */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                  <div id="grafico-edad">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={opcionesEdad}
                    />
                  </div>
                  {/* Información adicional de género */}
                  <div className="mt-4 flex justify-center items-center space-x-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                        </svg>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">62</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">45.59%</div>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-4">
                      <div className="text-center font-bold text-lg text-gray-900 dark:text-white">Total Casos</div>
                      <div className="text-center text-2xl font-bold text-gray-900 dark:text-white">136</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                        </svg>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">74</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">54.41%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de microrredes dengue */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notificación de Casos de Dengue por Microrredes
                    </h3>
                    <button
                      onClick={() => {
                        // Función para descargar tabla en Excel
                        const ws = XLSX.utils.json_to_sheet(tablaDengueData);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Dengue_Microrredes');
                        XLSX.writeFile(wb, `Dengue_Microrredes_${filtros.anio}.xlsx`);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Descargar Excel</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          MICRORRED
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          EE.SS.
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600" colSpan={3}>
                          CLASIFICACIÓN DE CASOS
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600" colSpan={3}>
                          TIPO DE DIAGNÓSTICO
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          TOTAL GENERAL
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          %
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          TIA X 10000 Mil Hab.
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          DEF.
                        </th>
                      </tr>
                      <tr>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"></th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"></th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          SIN SIGNOS
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          CON SIGNOS GRAVE
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          CONFIRMADO
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          PROBABLE
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          DESCARTADO
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"></th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"></th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"></th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      <tr>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          09 DE OCTUBRE
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          NUEVA MAGDALENA
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          318
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          0
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          18
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          267
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          0
                        </td>
                        <td className="px-3 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600">
                          318
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          42.06
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          13.99
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          0
                        </td>
                      </tr>
                      {/* Fila de total */}
                      <tr className="bg-gray-100 dark:bg-gray-600 font-semibold">
                        <td className="px-3 py-3 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600" colSpan={2}>
                          TOTAL GENERAL
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          756
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          0
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          52
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          84
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          202
                        </td>
                        <td className="px-3 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600">
                          756
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          100.00
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          140.86
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          0
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Febriles */}
          {tabActiva === 'febriles' && (
            <div className="space-y-8">
              {/* Gráfico de líneas de febriles */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                <div className="flex justify-end mb-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('febriles-export')}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Exportar</span>
                    </button>
                    {dropdownAbierto === 'febriles-export' && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                        <div className="py-1">
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                            Descargar PNG
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                            Descargar PDF
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                            Descargar Excel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div id="grafico-febriles">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={opcionesFebriles}
                  />
                </div>
              </div>

              {/* Tabla de febriles por microrredes */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Casos de Febriles por Microrredes y Grupos de Edad
                    </h3>
                    <button
                      onClick={() => {
                        // Función para descargar tabla en Excel
                        const ws = XLSX.utils.json_to_sheet([
                          ...tablaFebrilesData,
                          {
                            microrred: 'TOTAL GENERAL',
                            menorUno: totalFebrilesGeneral.menorUno,
                            uno4: totalFebrilesGeneral.uno4,
                            cinco9: totalFebrilesGeneral.cinco9,
                            diez19: totalFebrilesGeneral.diez19,
                            veinte59: totalFebrilesGeneral.veinte59,
                            mayor60: totalFebrilesGeneral.mayor60,
                            total: totalFebrilesGeneral.total,
                            porcentaje: totalFebrilesGeneral.porcentaje
                          }
                        ]);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Febriles_Microrredes');
                        XLSX.writeFile(wb, `Febriles_Microrredes_${filtros.anio}.xlsx`);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Descargar Excel</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          Microrred
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          &lt; 1 Año
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          1 a 4 años
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          5 a 9 años
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          10 a 19 años
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          20 a 59 años
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          &gt; 60 años
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          TOTAL
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {tablaFebrilesData.map((row, index) => (
                        <tr key={index} className={row.microrred === 'YURUA' ? 'bg-gray-50 dark:bg-gray-600' : ''}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                            {row.microrred}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                            {row.menorUno.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                            {row.uno4.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                            {row.cinco9.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                            {row.diez19.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                            {row.veinte59.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                            {row.mayor60.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600">
                            {row.total.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                            {row.porcentaje.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Fila de total */}
                      <tr className="bg-gray-100 dark:bg-gray-600 font-semibold">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          TOTAL GENERAL
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          {totalFebrilesGeneral.menorUno.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          {totalFebrilesGeneral.uno4.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          {totalFebrilesGeneral.cinco9.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          {totalFebrilesGeneral.diez19.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          {totalFebrilesGeneral.veinte59.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          {totalFebrilesGeneral.mayor60.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600">
                          {totalFebrilesGeneral.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                          {totalFebrilesGeneral.porcentaje.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pestañas placeholder para otras secciones */}
          {(tabActiva === 'vif' || tabActiva === 'tbc') && (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H5a2 2 0 01-2-2m0 0V5a2 2 0 012-2h2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Próximamente
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Esta sección estará disponible en futuras actualizaciones
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
