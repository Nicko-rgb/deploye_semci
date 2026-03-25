import * as React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as XLSX from 'xlsx';
import { seguimientosService } from '../../../services/sis/seguimientosService';

interface FiltrosConsultaExterna {
    lote: string;
    fecha_ini: string;
    fecha_fin: string;
    microred: string;
    codigo_unico: string;
    dni_profesional: string;
}

interface DatosConsultaExterna {
    tipo_fua: string;
    nro_fua: number;
    lote: number;
    correlativo: string;
    fecha_atencion: string;
    nombre_establecimiento: string;
    micro_red: string;
    red: string;
    codigo_renaes: string;
    paciente: string;
    doc_paciente: string;
    fecha_nacimiento_paciente: string;
    profesion_responsable: string;
    doc_profesional: string;
    nombre_profesional: string;
}

const ConsultaExternaEspecialista: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    const [filtros, setFiltros] = React.useState<FiltrosConsultaExterna>({
        lote: '25',
        fecha_ini: `${currentYear}-01-01`,
        fecha_fin: `${currentYear}-12-31`,
        microred: '',
        codigo_unico: '',
        dni_profesional: '',
    });

    const [datos, setDatos] = React.useState<DatosConsultaExterna[]>([]);
    const [cargando, setCargando] = React.useState(false);
    const [mostrarGraficos, setMostrarGraficos] = React.useState(false);
    const [paginaActual, setPaginaActual] = React.useState(1);
    const registrosPorPagina = 50;

    // Estados para catálogos
    const [microRedes, setMicroRedes] = React.useState<Array<{ nombre: string }>>([]);
    const [cargandoMicroRedes, setCargandoMicroRedes] = React.useState(false);
    const [establecimientos, setEstablecimientos] = React.useState<Array<{ codigoUnico: string; nombre: string }>>([]);
    const [cargandoEstablecimientos, setCargandoEstablecimientos] = React.useState(false);

    // Cargar catálogo de microredes al montar el componente
    React.useEffect(() => {
        const cargarMicroRedes = async () => {
            setCargandoMicroRedes(true);
            try {
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
        };
        cargarMicroRedes();
    }, []);

    // Cargar establecimientos cuando cambia la microred seleccionada
    React.useEffect(() => {
        const cargarEstablecimientos = async () => {
            setCargandoEstablecimientos(true);
            try {
                const response = await seguimientosService.getEstablecimientos(filtros.microred);
                const establecimientos = Array.isArray(response) ? response : [];
                setEstablecimientos(establecimientos);
                console.log('✅ Establecimientos cargados:', establecimientos.length, 'para microred:', filtros.microred || 'todas');
            } catch (error) {
                console.error('❌ Error al cargar establecimientos:', error);
                setEstablecimientos([]);
            } finally {
                setCargandoEstablecimientos(false);
            }
        };
        cargarEstablecimientos();
    }, [filtros.microred]);

    const buscarDatos = async () => {
        setCargando(true);
        setMostrarGraficos(false);
        try {
            console.log('🔍 Filtros a enviar:', filtros);
            const response = await seguimientosService.getConsultaExternaEspecialista(filtros);
            console.log('✅ Respuesta recibida:', response);
            setDatos(response.items || []);
            setMostrarGraficos(true);
            setPaginaActual(1);
        } catch (error: any) {
            console.error('❌ Error completo:', error);
            console.error('❌ Error response:', error?.response);
            console.error('❌ Error message:', error?.message);
            const errorMsg = error?.response?.data?.detail || error?.message || 'Error al cargar datos';
            alert(`Error al cargar datos: ${errorMsg}`);
        } finally {
            setCargando(false);
        }
    };

    // Calcular estadísticas
    const pacientesUnicos = React.useMemo(() => {
        const pacientes = new Set(datos.map(d => d.doc_paciente));
        return pacientes.size;
    }, [datos]);

    const establecimientosUnicos = React.useMemo(() => {
        const establecimientos = new Set(datos.map(d => d.nombre_establecimiento));
        return establecimientos.size;
    }, [datos]);

    const profesionalesUnicos = React.useMemo(() => {
        const profesionales = new Set(datos.map(d => d.doc_profesional));
        return profesionales.size;
    }, [datos]);

    // Estadísticas por establecimiento
    const estadisticasEstablecimientos = React.useMemo(() => {
        const conteo: { [key: string]: number } = {};
        datos.forEach(d => {
            const est = d.nombre_establecimiento || 'Sin Establecimiento';
            conteo[est] = (conteo[est] || 0) + 1;
        });
        return Object.entries(conteo)
            .map(([nombre, total]) => ({ nombre, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }, [datos]);

    // Estadísticas por MicroRed
    const estadisticasMicroRed = React.useMemo(() => {
        const conteo: { [key: string]: number } = {};
        datos.forEach(d => {
            const mr = d.micro_red || 'Sin MicroRed';
            conteo[mr] = (conteo[mr] || 0) + 1;
        });
        return Object.entries(conteo)
            .map(([nombre, total]) => ({ nombre, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }, [datos]);

    // Estadísticas por profesión
    const estadisticasProfesion = React.useMemo(() => {
        const conteo: { [key: string]: number } = {};
        datos.forEach(d => {
            const prof = d.profesion_responsable || 'Sin Profesión';
            conteo[prof] = (conteo[prof] || 0) + 1;
        });
        return Object.entries(conteo)
            .map(([nombre, total]) => ({ nombre, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }, [datos]);

    // Estadísticas por nombre de profesional
    const estadisticasProfesionales = React.useMemo(() => {
        const conteo: { [key: string]: number } = {};
        datos.forEach(d => {
            const nombre = d.nombre_profesional || 'Sin Nombre';
            conteo[nombre] = (conteo[nombre] || 0) + 1;
        });
        return Object.entries(conteo)
            .map(([nombre, total]) => ({ nombre, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }, [datos]);

    // Paginación
    const datosPaginados = React.useMemo(() => {
        const inicio = (paginaActual - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        return datos.slice(inicio, fin);
    }, [datos, paginaActual]);

    const totalPaginas = Math.ceil(datos.length / registrosPorPagina);

    // Exportar a Excel
    const exportarAExcel = () => {
        try {
            const datosExportar = datos.map(item => ({
                'Tipo FUA': item.tipo_fua,
                'N° FUA': item.nro_fua,
                'Lote': item.lote,
                'Correlativo': item.correlativo,
                'Fecha Atención': item.fecha_atencion,
                'Establecimiento': item.nombre_establecimiento,
                'MicroRed': item.micro_red,
                'Red': item.red,
                'Código RENAES': item.codigo_renaes,
                'Paciente': item.paciente,
                'DNI Paciente': item.doc_paciente,
                'Fecha Nacimiento': item.fecha_nacimiento_paciente,
                'Profesión': item.profesion_responsable,
                'DNI Profesional': item.doc_profesional,
                'Nombre Profesional': item.nombre_profesional
            }));

            const ws = XLSX.utils.json_to_sheet(datosExportar);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Consulta Externa');
            XLSX.writeFile(wb, `consulta_externa_especialista_lote${filtros.lote}_${filtros.fecha_ini}_${filtros.fecha_fin}.xlsx`);
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Error al exportar los datos');
        }
    };

    // Gráficos
    const opcionesGraficoEstablecimientos: Highcharts.Options = {
        chart: { type: 'bar', height: 400 },
        title: { text: 'Top 10 Establecimientos' },
        xAxis: {
            categories: estadisticasEstablecimientos.map(e => e.nombre),
            title: { text: null }
        },
        yAxis: {
            min: 0,
            title: { text: 'Número de Consultas' }
        },
        series: [{
            type: 'bar',
            name: 'Consultas',
            data: estadisticasEstablecimientos.map(e => e.total),
            color: '#6366f1'
        }],
        plotOptions: {
            bar: {
                dataLabels: { enabled: true }
            }
        },
        credits: { enabled: false },
        legend: { enabled: false }
    };

    const opcionesGraficoMicroRed: Highcharts.Options = {
        chart: { type: 'column', height: 400 },
        title: { text: 'Top 10 MicroRedes' },
        xAxis: {
            categories: estadisticasMicroRed.map(d => d.nombre),
            title: { text: null }
        },
        yAxis: {
            min: 0,
            title: { text: 'Número de Consultas' }
        },
        series: [{
            type: 'column',
            name: 'Consultas',
            data: estadisticasMicroRed.map(d => d.total),
            color: '#8b5cf6'
        }],
        plotOptions: {
            column: {
                dataLabels: { enabled: true }
            }
        },
        credits: { enabled: false },
        legend: { enabled: false }
    };

    const opcionesGraficoProfesion: Highcharts.Options = {
        chart: { type: 'pie', height: 400 },
        title: { text: 'Top 10 Profesiones' },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}%'
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Consultas',
            data: estadisticasProfesion.map(p => ({
                name: p.nombre,
                y: p.total
            }))
        }],
        credits: { enabled: false }
    };

    const opcionesGraficoProfesionales: Highcharts.Options = {
        chart: { type: 'column', height: 400 },
        title: { text: 'Top 10 Profesionales' },
        xAxis: {
            categories: estadisticasProfesionales.map(p => p.nombre),
            title: { text: null },
            labels: {
                rotation: -45,
                style: { fontSize: '10px' }
            }
        },
        yAxis: {
            min: 0,
            title: { text: 'Número de Atenciones' }
        },
        series: [{
            type: 'column',
            name: 'Atenciones',
            data: estadisticasProfesionales.map(p => p.total),
            color: '#10b981'
        }],
        plotOptions: {
            column: {
                dataLabels: { enabled: true }
            }
        },
        credits: { enabled: false },
        legend: { enabled: false }
    };

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
            {/* Header con botón Volver */}
            <div className='bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white'>
                <div className='w-full px-4 sm:px-6 lg:px-8 py-6'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div className='p-2 bg-white/10 rounded-lg'>
                                <svg className='w-8 h-8' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
                                </svg>
                            </div>
                            <div>
                                <h1 className='text-2xl font-bold'>Consulta Externa (Médico Especialista)</h1>
                                <p className='text-indigo-100 text-sm'>Seguimiento de Consultas Externas - SIS</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.history.back()}
                            className='flex items-center gap-2 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                            </svg>
                            Volver
                        </button>
                    </div>
                </div>
            </div>

            <div className='w-full px-4 sm:px-6 lg:px-8 py-8'>
                {/* Filtros de Búsqueda */}
                <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                    <h2 className='text-xl font-bold mb-4 text-gray-800 dark:text-white'>
                        🔍 Filtros de Búsqueda
                    </h2>
                    
                    {/* Primera fila de filtros */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Lote <span className='text-red-500'>*</span>
                            </label>
                            <input 
                                type='number' 
                                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                placeholder='25'
                                value={filtros.lote} 
                                onChange={(e) => setFiltros({...filtros, lote: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Fecha Inicial
                            </label>
                            <input 
                                type='date' 
                                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                value={filtros.fecha_ini} 
                                onChange={(e) => setFiltros({...filtros, fecha_ini: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Fecha Final
                            </label>
                            <input 
                                type='date' 
                                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                value={filtros.fecha_fin} 
                                onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                MicroRed
                            </label>
                            <select 
                                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                value={filtros.microred} 
                                onChange={(e) => setFiltros({...filtros, microred: e.target.value, codigo_unico: ''})}
                                disabled={cargandoMicroRedes}
                            >
                                <option value=''>Todas las microredes</option>
                                {microRedes.map(mr => (
                                    <option key={mr.nombre} value={mr.nombre}>
                                        {mr.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Segunda fila de filtros */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Establecimiento
                            </label>
                            <select 
                                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                value={filtros.codigo_unico} 
                                onChange={(e) => setFiltros({...filtros, codigo_unico: e.target.value})}
                                disabled={cargandoEstablecimientos}
                            >
                                <option value=''>Todos los establecimientos</option>
                                {establecimientos.map(est => (
                                    <option key={est.codigoUnico} value={est.codigoUnico}>
                                        {est.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                DNI Profesional
                            </label>
                            <input 
                                type='text' 
                                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                placeholder='DNI del profesional'
                                value={filtros.dni_profesional} 
                                onChange={(e) => setFiltros({...filtros, dni_profesional: e.target.value})} 
                            />
                        </div>

                        <div className='flex items-end'>
                            <button 
                                onClick={buscarDatos} 
                                disabled={cargando} 
                                className='w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2'
                            >
                                {cargando ? (
                                    <>
                                        <svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                        </svg>
                                        <span>Buscando...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                                        </svg>
                                        <span>Buscar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                {mostrarGraficos && (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6'>
                            {/* Total Registros */}
                            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Total Registros</p>
                                        <p className='text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2'>{datos.length}</p>
                                    </div>
                                    <div className='p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full'>
                                        <svg className='w-8 h-8 text-indigo-600 dark:text-indigo-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Pacientes Únicos */}
                            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Pacientes Únicos</p>
                                        <p className='text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2'>{pacientesUnicos}</p>
                                    </div>
                                    <div className='p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full'>
                                        <svg className='w-8 h-8 text-purple-600 dark:text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Establecimientos */}
                            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Establecimientos</p>
                                        <p className='text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2'>{establecimientosUnicos}</p>
                                    </div>
                                    <div className='p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full'>
                                        <svg className='w-8 h-8 text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Profesionales */}
                            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Profesionales</p>
                                        <p className='text-3xl font-bold text-green-600 dark:text-green-400 mt-2'>{profesionalesUnicos}</p>
                                    </div>
                                    <div className='p-3 bg-green-100 dark:bg-green-900/30 rounded-full'>
                                        <svg className='w-8 h-8 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gráficos */}
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
                            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                                <HighchartsReact highcharts={Highcharts} options={opcionesGraficoEstablecimientos} />
                            </div>
                            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                                <HighchartsReact highcharts={Highcharts} options={opcionesGraficoMicroRed} />
                            </div>
                            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                                <HighchartsReact highcharts={Highcharts} options={opcionesGraficoProfesion} />
                            </div>
                            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                                <HighchartsReact highcharts={Highcharts} options={opcionesGraficoProfesionales} />
                            </div>
                        </div>

                        {/* Tabla de Datos */}
                        <div className='mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-bold text-gray-800 dark:text-white'>
                                    Datos Nominales ({datos.length} registros)
                                </h3>
                                <button
                                    onClick={exportarAExcel}
                                    className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors'
                                >
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                    </svg>
                                    Exportar a Excel
                                </button>
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                                    <thead className='bg-gray-50 dark:bg-gray-700'>
                                        <tr>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Tipo FUA</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>N° FUA</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Fecha</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Paciente</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>DNI Paciente</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Establecimiento</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>MicroRed</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Profesión</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Nombre Prof.</th>
                                            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>DNI Prof.</th>
                                        </tr>
                                    </thead>
                                    <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                                        {datosPaginados.map((dato, index) => (
                                            <tr key={index} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                                                <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap'>{dato.tipo_fua}</td>
                                                <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300'>{dato.nro_fua}</td>
                                                <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300'>{dato.fecha_atencion}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-300'>{dato.paciente}</td>
                                                <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300'>{dato.doc_paciente}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-300'>{dato.nombre_establecimiento}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-300'>{dato.micro_red}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-300'>{dato.profesion_responsable}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-300'>{dato.nombre_profesional}</td>
                                                <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300'>{dato.doc_profesional}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className='flex justify-between items-center mt-4'>
                                <div className='text-sm text-gray-700 dark:text-gray-300'>
                                    Mostrando {((paginaActual - 1) * registrosPorPagina) + 1} a {Math.min(paginaActual * registrosPorPagina, datos.length)} de {datos.length} registros
                                </div>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                        disabled={paginaActual === 1}
                                        className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors'
                                    >
                                        Anterior
                                    </button>
                                    <span className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg'>
                                        Página {paginaActual} de {totalPaginas}
                                    </span>
                                    <button
                                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                        disabled={paginaActual === totalPaginas}
                                        className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors'
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConsultaExternaEspecialista;
