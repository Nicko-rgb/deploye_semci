import * as React from 'react';
//import { anios, meses, redes } from '../../../../core/utils/accesories';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as XLSX from 'xlsx';
import { seguimientosService } from '../../../services/sis/seguimientosService';

interface FiltrosReporte {
  anio: string;
  mes: string;
  nombre_red: string;
  codigo_unico: string;
  microred: string;
  dni_profesional: string;
  q_profesional: string;
  id_profesion: string;
  especialidad_like: string;
  id_servicio: string;
  lote: string;
}

interface DatosAtencion {
  mes: string;
  total_atenciones: number;
  total_pacientes: number;
}

interface DatosEstadisticas {
  total_general: number;
  promedio_mensual: number;
  mes_mayor_atencion: string;
  mes_menor_atencion: string;
}

interface Establecimiento {
  codigoUnico: string;
  nombre: string;
  red: string;
}

/*interface Profesional {
  dni: string;
  nombre: string;
  profesion: string;
}*/

interface Profesion {
  idProfesion: number;
  descripcion: string;
}

const ReporteAtencionesGeneral: React.FC = () => {
    // const listaMeses = meses();
    // const listaAnios = anios();
    // const listaRedes = redes;

    const [filtros, setFiltros] = React.useState<FiltrosReporte>({
        anio: new Date().getFullYear().toString(),
        mes: '',
        nombre_red: '',
        codigo_unico: '',
        microred: '',
        dni_profesional: '',
        q_profesional: '',
        id_profesion: '',
        especialidad_like: '',
        id_servicio: '',
        lote: '25',
    });
    const [datosAtenciones, setDatosAtenciones] = React.useState<DatosAtencion[]>([]);
    const [estadisticas, setEstadisticas] = React.useState<DatosEstadisticas>({
        total_general: 0,
        promedio_mensual: 0,
        mes_mayor_atencion: '',
        mes_menor_atencion: ''
    });
    const [cargando, setCargando] = React.useState<boolean>(false);
    
    // Estados para los catálogos
    const [microRedes, setMicroRedes] = React.useState<Array<{ nombre: string }>>([]);
    const [cargandoMicroRedes, setCargandoMicroRedes] = React.useState<boolean>(false);
    const [establecimientos, setEstablecimientos] = React.useState<Establecimiento[]>([]);
    //const [profesionales, setProfesionales] = React.useState<Profesional[]>([]);
    const [profesiones, setProfesiones] = React.useState<Profesion[]>([]);
    const [cargandoCatalogos, setCargandoCatalogos] = React.useState<boolean>(false);

    // Estados para estadísticas de gráficos
    const [estadisticasGraficos, setEstadisticasGraficos] = React.useState<any>(null);
    const [cargandoEstadisticas, setCargandoEstadisticas] = React.useState<boolean>(false);

    // Función para cargar catálogo de microredes
    const cargarMicroRedes = React.useCallback(async () => {
        try {
            setCargandoMicroRedes(true);
            const response = await seguimientosService.getMicroRedes();
            const microRedes = Array.isArray(response) ? response : [];
            setMicroRedes(microRedes);
            console.log('✅ MicroRedes cargadas:', microRedes.length);
        } catch (error) {
            console.error('❌ Error al cargar microredes:', error);
            setMicroRedes([]);
        } finally {
            setCargandoMicroRedes(false);
        }
    }, []);

    // Función para cargar catálogos
    const cargarCatalogos = React.useCallback(async () => {
        try {
            setCargandoCatalogos(true);
            const [estabs, profes] = await Promise.all([
                seguimientosService.getEstablecimientos(filtros.microred),
                seguimientosService.getProfesiones()
            ]);
            console.log('📦 Establecimientos cargados:', estabs.length, 'para microred:', filtros.microred || 'todas');
            // getEstablecimientos ya retorna un array directamente
            setEstablecimientos(Array.isArray(estabs) ? estabs : []);
            //setProfesionales(Array.isArray(profs) ? profs : []);
            setProfesiones(Array.isArray(profes) ? profes : []);
        } catch (error) {
            console.error('❌ Error al cargar catálogos:', error);
            setEstablecimientos([]);
            //setProfesionales([]);
            setProfesiones([]);
        } finally {
            setCargandoCatalogos(false);
        }
    }, [filtros.anio, filtros.microred]);

    // Función para cargar datos (NO usar useCallback con filtros)
    const cargarDatos = async () => {
        try {
            setCargando(true);
            
            // Llamar al servicio para obtener datos reales con todos los filtros
            const response = await seguimientosService.getReporteAtencionesGeneral(filtros);
            
            // Los datos vienen en response.items
            const datos: DatosAtencion[] = response.items || [];
            setDatosAtenciones(datos);
            
            // Calcular estadísticas
            if (datos.length > 0) {
                const total = datos.reduce((sum, d) => sum + d.total_atenciones, 0);
                const promedio = Math.round(total / datos.length);
                const maxAtencion = datos.reduce((max, d) => d.total_atenciones > max.total_atenciones ? d : max);
                const minAtencion = datos.reduce((min, d) => d.total_atenciones < min.total_atenciones ? d : min);
                
                setEstadisticas({
                    total_general: total,
                    promedio_mensual: promedio,
                    mes_mayor_atencion: maxAtencion.mes,
                    mes_menor_atencion: minAtencion.mes
                });
            } else {
                setEstadisticas({
                    total_general: 0,
                    promedio_mensual: 0,
                    mes_mayor_atencion: '-',
                    mes_menor_atencion: '-'
                });
            }
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar los datos. Por favor, inténtelo de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    // Función para cargar estadísticas de gráficos
    const cargarEstadisticas = async () => {
        try {
            setCargandoEstadisticas(true);
            console.log('🔍 Cargando estadísticas con filtros:', filtros);
            const stats = await seguimientosService.getEstadisticasAtenciones(filtros);
            console.log('✅ Estadísticas cargadas:', stats);
            setEstadisticasGraficos(stats);
        } catch (error) {
            console.error('❌ Error al cargar estadísticas:', error);
        } finally {
            setCargandoEstadisticas(false);
        }
    };

    // Efecto para cargar microredes al montar (solo una vez)
    React.useEffect(() => {
        cargarMicroRedes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Efecto para cargar catálogos cuando cambia la microred
    React.useEffect(() => {
        cargarCatalogos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.microred, filtros.anio]);

    // Configuración del gráfico de barras
    const opcionesGraficoBarras: Highcharts.Options = {
        chart: {
            type: 'column',
            height: 400,
        },
        title: {
            text: 'Atenciones por Mes',
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: datosAtenciones.map(d => d.mes),
            title: {
                text: 'Meses'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Número de Atenciones'
            }
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [
            {
                name: 'Total Atenciones',
                type: 'column',
                data: datosAtenciones.map(d => d.total_atenciones),
                color: '#10b981'
            },
            {
                name: 'Total Pacientes',
                type: 'column',
                data: datosAtenciones.map(d => d.total_pacientes),
                color: '#3b82f6'
            }
        ],
        credits: {
            enabled: false
        }
    };

    // Configuración del gráfico de líneas
    const opcionesGraficoLineas: Highcharts.Options = {
        chart: {
            type: 'line',
            height: 400,
        },
        title: {
            text: 'Tendencia de Atenciones',
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: datosAtenciones.map(d => d.mes),
            title: {
                text: 'Meses'
            }
        },
        yAxis: {
            title: {
                text: 'Cantidad'
            }
        },
        series: [
            {
                name: 'Atenciones',
                type: 'line',
                data: datosAtenciones.map(d => d.total_atenciones),
                color: '#10b981',
                marker: {
                    enabled: true,
                    radius: 4
                }
            },
            {
                name: 'Pacientes',
                type: 'line',
                data: datosAtenciones.map(d => d.total_pacientes),
                color: '#3b82f6',
                marker: {
                    enabled: true,
                    radius: 4
                }
            }
        ],
        credits: {
            enabled: false
        }
    };

    // Gráfico Top 10 Establecimientos (Barras horizontales)
    const opcionesGraficoEstablecimientos: Highcharts.Options = {
        chart: {
            type: 'bar',
            height: 400,
        },
        title: {
            text: 'Top 10 Establecimientos',
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: estadisticasGraficos?.establecimientos?.map((e: any) => e.nombre?.substring(0, 20) || 'Sin nombre') || [],
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Atenciones',
                align: 'high'
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: 'Atenciones',
            type: 'bar',
            data: estadisticasGraficos?.establecimientos?.map((e: any) => e.total) || [],
            color: '#3b82f6'
        }],
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        }
    };

    // Gráfico Top 10 Diagnósticos (Barras verticales)
    const opcionesGraficoDiagnosticos: Highcharts.Options = {
        chart: {
            type: 'column',
            height: 400,
        },
        title: {
            text: 'Top 10 Diagnósticos (Dx)',
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: estadisticasGraficos?.diagnosticos?.map((d: any) => d.codigo) || [],
            title: {
                text: 'Código CIE-10'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Cantidad'
            }
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true
                },
                colorByPoint: true
            }
        },
        series: [{
            name: 'Diagnósticos',
            type: 'column',
            data: estadisticasGraficos?.diagnosticos?.map((d: any) => d.total) || []
        }],
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        }
    };

    // Gráfico Top 10 Especialidades (Barras verticales)
    const opcionesGraficoEspecialidades: Highcharts.Options = {
        chart: {
            type: 'column',
            height: 400,
        },
        title: {
            text: 'Top 10 Especialidades',
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: estadisticasGraficos?.especialidades?.map((e: any) => e.nombre?.substring(0, 15) || 'Sin especialidad') || [],
            title: {
                text: 'Especialidad'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Atenciones'
            }
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true
                },
                colorByPoint: true
            }
        },
        series: [{
            name: 'Atenciones',
            type: 'column',
            data: estadisticasGraficos?.especialidades?.map((e: any) => e.total) || []
        }],
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        }
    };

    // Gráfico Profesionales (Dona/Pie)
    const opcionesGraficoProfesionales: Highcharts.Options = {
        chart: {
            type: 'pie',
            height: 450,
        },
        title: {
            text: 'Profesionales (participación de atenciones)',
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        plotOptions: {
            pie: {
                innerSize: '50%', // Hace que sea tipo dona
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)'
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Atenciones',
            type: 'pie',
            data: estadisticasGraficos?.profesionales?.map((p: any) => ({
                name: p.nombre?.substring(0, 30) || '(sin ficha)',
                y: p.total
            })) || []
        }],
        credits: {
            enabled: false
        }
    };

    // Función para exportar a Excel
    const exportarExcel = () => {
        const datosParaExportar = datosAtenciones.map(d => ({
            'Mes': d.mes,
            'Total Atenciones': d.total_atenciones,
            'Total Pacientes': d.total_pacientes
        }));

        const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Atenciones');
        
        // Agregar hoja de estadísticas
        const estadisticasData = [
            { 'Indicador': 'Total General de Atenciones', 'Valor': estadisticas.total_general },
            { 'Indicador': 'Promedio Mensual', 'Valor': estadisticas.promedio_mensual },
            { 'Indicador': 'Mes con Mayor Atención', 'Valor': estadisticas.mes_mayor_atencion },
            { 'Indicador': 'Mes con Menor Atención', 'Valor': estadisticas.mes_menor_atencion }
        ];
        const worksheetEstadisticas = XLSX.utils.json_to_sheet(estadisticasData);
        XLSX.utils.book_append_sheet(workbook, worksheetEstadisticas, 'Estadísticas');

        XLSX.writeFile(workbook, `ReporteAtencionesGeneral_${filtros.anio}.xlsx`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Reporte de Atenciones General - SIS
                                </h1>
                                <p className="text-green-100 text-sm">
                                    Sistema de Información en Salud
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Volver</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="container mx-auto px-4 py-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                            </svg>
                            Filtros de Búsqueda
                        </div>
                        {cargando && (
                            <span className="text-sm text-green-600 flex items-center">
                                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cargando datos...
                            </span>
                        )}
                    </h2>
                    {/* Primera fila: Año, Lote, MicroRed, Establecimiento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Año */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Año <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={filtros.anio}
                                onChange={(e) => setFiltros({ ...filtros, anio: e.target.value })}
                            >
                                {/* {listaAnios.map((anio: string) => (
                                    <option key={anio} value={anio}>{anio}</option>
                                ))} */}
                            </select>
                        </div>

                        {/* Lote */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lote</label>
                            <input
                                type="number"
                                placeholder="25"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={filtros.lote}
                                onChange={(e) => setFiltros({ ...filtros, lote: e.target.value })}
                            />
                        </div>

                        {/* MicroRed */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">MicroRed</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={filtros.microred}
                                onChange={(e) => setFiltros({ ...filtros, microred: e.target.value, codigo_unico: '' })}
                                disabled={cargandoMicroRedes}
                            >
                                <option value="">Todas las microredes</option>
                                {microRedes.map(mr => (
                                    <option key={mr.nombre} value={mr.nombre}>
                                        {mr.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Establecimiento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Establecimiento</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={filtros.codigo_unico}
                                onChange={(e) => setFiltros({ ...filtros, codigo_unico: e.target.value })}
                                disabled={cargandoCatalogos}
                            >
                                <option value="">Todos los establecimientos</option>
                                {establecimientos.slice(0, 100).map((est: Establecimiento) => (
                                    <option key={est.codigoUnico} value={est.codigoUnico}>
                                        {est.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Segunda fila: DNI Profesional, Mes, Red, Especialidad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* DNI Profesional */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DNI Profesional</label>
                            <input
                                type="text"
                                placeholder="DNI"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                value={filtros.dni_profesional}
                                onChange={(e) => setFiltros({ ...filtros, dni_profesional: e.target.value })}
                            />
                        </div>

                        {/* Mes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mes</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={filtros.mes}
                                onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
                            >
                                <option value="">Todos los meses</option>
                                {/* {listaMeses.map((mes: any) => (
                                    <option key={mes.mes} value={mes.mes.toString()}>
                                        {mes.nombre}
                                    </option>
                                ))} */}
                            </select>
                        </div>

                        {/* Red */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Red de Salud</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={filtros.nombre_red}
                                onChange={(e) => setFiltros({ ...filtros, nombre_red: e.target.value })}
                            >
                                <option value="">Todas las redes</option>
                                {/* {listaRedes.map((red: any) => (
                                    <option key={red.codigo_red} value={red.nombre_red}>
                                        {red.nombre_red}
                                    </option>
                                ))} */}
                            </select>
                        </div>

                        {/* Especialidad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Especialidad</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={filtros.id_profesion}
                                onChange={(e) => setFiltros({ ...filtros, id_profesion: e.target.value })}
                                disabled={cargandoCatalogos}
                            >
                                <option value="">Todas las especialidades</option>
                                {profesiones.slice(0, 100).map((prof: Profesion) => (
                                    <option key={prof.idProfesion} value={prof.idProfesion}>
                                        {prof.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tercera fila: Servicio, Profesional (nombre), y Botón Buscar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Servicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Servicio (p.ej. 024)</label>
                            <input
                                type="text"
                                placeholder="Código servicio"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                value={filtros.id_servicio}
                                onChange={(e) => setFiltros({ ...filtros, id_servicio: e.target.value })}
                            />
                        </div>

                        {/* Profesional (búsqueda) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profesional (nombre)</label>
                            <input
                                type="text"
                                placeholder="Buscar profesional"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                value={filtros.q_profesional}
                                onChange={(e) => setFiltros({ ...filtros, q_profesional: e.target.value })}
                            />
                        </div>

                        {/* Espacio vacío */}
                        <div></div>

                        {/* Botón Buscar */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    cargarDatos();
                                    cargarEstadisticas();
                                }}
                                disabled={cargando}
                                className="w-full px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                            >
                                {cargando ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Buscar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Total General */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500 dark:border-green-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Atenciones</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                                    {estadisticas.total_general.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Promedio Mensual */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500 dark:border-blue-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Promedio Mensual</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                                    {estadisticas.promedio_mensual.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Mes Mayor Atención */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500 dark:border-yellow-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Mayor Atención</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                                    {estadisticas.mes_mayor_atencion}
                                </p>
                            </div>
                            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Mes Menor Atención */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500 dark:border-red-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Menor Atención</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                                    {estadisticas.mes_menor_atencion}
                                </p>
                            </div>
                            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de Exportar */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={exportarExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Exportar a Excel</span>
                    </button>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Gráfico de Barras */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <HighchartsReact highcharts={Highcharts} options={opcionesGraficoBarras} />
                    </div>

                    {/* Gráfico de Líneas */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <HighchartsReact highcharts={Highcharts} options={opcionesGraficoLineas} />
                    </div>
                </div>

                {/* Gráficos Estadísticos */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Estadísticas Generales</h3>
                </div>
                
                {cargandoEstadisticas ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center mb-6">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando estadísticas...</p>
                    </div>
                ) : estadisticasGraficos && estadisticasGraficos.establecimientos ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Top 10 Establecimientos */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <HighchartsReact highcharts={Highcharts} options={opcionesGraficoEstablecimientos} />
                        </div>

                        {/* Top 10 Diagnósticos */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <HighchartsReact highcharts={Highcharts} options={opcionesGraficoDiagnosticos} />
                        </div>

                        {/* Top 10 Especialidades */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <HighchartsReact highcharts={Highcharts} options={opcionesGraficoEspecialidades} />
                        </div>

                        {/* Profesionales (Dona) */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <HighchartsReact highcharts={Highcharts} options={opcionesGraficoProfesionales} />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center mb-6">
                        <p className="text-gray-500">No hay datos estadísticos disponibles</p>
                        <p className="text-sm text-gray-400 mt-2">Estado: {estadisticasGraficos ? 'Datos cargados pero vacíos' : 'Sin datos'}</p>
                    </div>
                )}

                {/* Tabla de Datos */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Detalle de Atenciones por Mes</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Mes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Total Atenciones
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Total Pacientes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {datosAtenciones.map((dato, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {dato.mes}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {dato.total_atenciones.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {dato.total_pacientes.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReporteAtencionesGeneral;
