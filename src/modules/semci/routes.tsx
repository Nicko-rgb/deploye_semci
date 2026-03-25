import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

// Lazy loading de páginas SEMCI
const Calidad = lazy(() => import('./pages/Calidad'));
const Repositorio = lazy(() => import('./pages/Repositorio'));
//const ImportarArchivos = lazy(() => import('./pages/ImportarArchivos'));
//const ImportarInformes = lazy(() => import('./pages/ImportarInformes'));
//const Digitador = lazy(() => import('./pages/Digitador'));
//const Procesar = lazy(() => import('./pages/Procesar'));
const Epidemiologia = lazy(() => import('./pages/Epidemiologia'));
const PacienteDengue = lazy(() => import('./pages/epidemiologia/PacienteDengue'));
const MapaDengue = lazy(() => import('./pages/epidemiologia/MapaDengue'));
const AnalisisEpidemiologico = lazy(() => import('./pages/AnalisisEpidemiologico'));
const ReportesOperacionales = lazy(() => import('./pages/ReportesOperacionales'));
const Materno = lazy(() => import('./pages/reportes/operacional/Materno'));
const PlanificacionFamiliar = lazy(() => import('./pages/reportes/operacional/PlanificacionFamiliar'));
const GeneralMorbilidad = lazy(() => import('./pages/reportes/operacional/GeneralMorbilidad'));
const Adolecente = lazy(() => import('./pages/reportes/operacional/Adolecente'));
const EtapaVidaNiño = lazy(() => import('./pages/reportes/operacional/EtapaVidaNiño'));
const ReportesGenerales = lazy(() => import('./pages/ReportesGenerales'));
const CoverturaVacuna = lazy(() => import('./pages/reportes/generales/CoverturaVacuna'));
const Reporte40 = lazy(() => import('./pages/reportes/generales/Reporte40'));
const Profam = lazy(() => import('./pages/reportes/generales/Profam'));
const ReportesProduccion = lazy(() => import('./pages/ReportesProduccion'));
const ProduccionDigitacion = lazy(() => import('./pages/reportes/produccion/ProduccionDigitacion'));
const ReporteProfesional = lazy(() => import('./pages/reportes/produccion/ReporteProfesional'));
const Dashboard = lazy(() => import('./pages/reportes/rrhh/Dashboard.tsx'));
const ReportesReferencias = lazy(() => import('./pages/ReportesReferencias'));
const IndicadoresFED = lazy(() => import('./pages/indicadores/IndicadoresFED'));
const Fed_2023 = lazy(() => import('./pages/indicadores/FED/Fed_2023'));
const Fed_2024 = lazy(() => import('./pages/indicadores/FED/Fed_2024'));
const Fed_2025 = lazy(() => import('./pages/indicadores/FED/Fed_2025'));
const IndicadoresGestion = lazy(() => import('./pages/indicadores/IndicadoresGestion'));
const Gestion_2023 = lazy(() => import('./pages/indicadores/gestion/gestion_2023'));
const Gestion_2025 = lazy(() => import('./pages/indicadores/gestion/gestion_2025'));
const IndicadoresSaludMental = lazy(() => import('./pages/indicadores/IndicadoresSaludMental'));
const PacienteVacunado = lazy(() => import('./pages/consultas/PacienteVacunado'));
const PadronNominal = lazy(() => import('./pages/consultas/PadronNominal'));
const CNV = lazy(() => import('./pages/consultas/CNV'));
const PersonalSalud = lazy(() => import('./pages/consultas/PersonalSalud'));
const Establecimientos = lazy(() => import('./pages/consultas/Establecimientos'));
const His = lazy(() => import('./pages/consultas/His'));
const Seguimiento = lazy(() => import('./pages/consultas/Seguimiento'));
const SeguimientoMaterno = lazy(() => import('./pages/consultas/seguimiento/SeguimientoMaterno'));
const SeguimientoNiño = lazy(() => import('./pages/consultas/seguimiento/seguimientoNiño'));
const SIS = lazy(() => import('./pages/SIS'));
const MenuIndicadoresSIS = lazy(() => import('./pages/sis/indicadores/menu'));
const MenuSeguimientos = lazy(() => import('./pages/sis/seguimientos/menu'));
const CancerUterino = lazy(() => import('./pages/sis/seguimientos/CancerUterino'));
const PresionArterial = lazy(() => import('./pages/sis/seguimientos/PresionArterial'));
const CancerCervico = lazy(() => import('./pages/sis/seguimientos/CancerCervico'));
const CancerMama = lazy(() => import('./pages/sis/seguimientos/CancerMama'));
const HipertensionDiabetes = lazy(() => import('./pages/sis/seguimientos/HipertensionDiabetes'));
const ReporteAtencionesGeneral = lazy(() => import('./pages/sis/seguimientos/ReporteAtencionesGeneral'));
const ConsultaExternaEspecialista = lazy(() => import('./pages/sis/seguimientos/ConsultaExternaEspecialista'));
const IndicadoresSIS = lazy(() => import('./pages/IndicadoresSIS')); 

const SemciRoutes = () => {
  return (
    <Routes>
      {/* Configuración y Gestión */}
      {/* <Route path="settings/importar" element={<ImportarArchivos />} />
      <Route path="settings/importar-informes" element={<ImportarInformes />} /> 
      <Route path="settings/digitador" element={<Digitador />} />
      <Route path="settings/procesar" element={<Procesar />} /> */}
      
      {/* Módulos principales */}
      <Route path="repositorio" element={<Repositorio />} /> 
      <Route path="calidad" element={<Calidad />} />
      
      {/* Epidemiología */}
      <Route path="epidemiologia" element={<Epidemiologia />} />
      <Route path="epidemiologia/paciente-dengue" element={<PacienteDengue />} />
      <Route path="epidemiologia/mapa-dengue" element={<MapaDengue />} />
      <Route path="epidemiologia/analisis" element={<AnalisisEpidemiologico />} />
      
      {/* Reportes Operacionales */}
      <Route path="reportes/operacionales" element={<ReportesOperacionales />} />
      <Route path="reportes/operacionales/materno" element={<Materno />} />
      <Route path="reportes/operacionales/planificacion-familiar" element={<PlanificacionFamiliar />} />
      <Route path="reportes/operacionales/general-morbilidad" element={<GeneralMorbilidad />} />
      <Route path="reportes/operacionales/adolecente" element={<Adolecente />} />
      <Route path="reportes/operacionales/etapa-vida-niño" element={<EtapaVidaNiño />} />
      
      {/* Reportes Generales */}
      <Route path="reportes/generales" element={<ReportesGenerales />} />
      <Route path="reportes/generales/covertura-vacuna" element={<CoverturaVacuna />} />
      <Route path="reportes/generales/reporte-40" element={<Reporte40 />} />
      <Route path="reportes/generales/profam" element={<Profam />} />
      
      {/* Reportes Producción */}
      <Route path="reportes/produccion" element={<ReportesProduccion />} />
      <Route path="reportes/produccion/produccion-digitacion" element={<ProduccionDigitacion />} />
      <Route path="reportes/produccion/reporte-profesional" element={<ReporteProfesional />} />
      <Route path="reportes/referencias" element={<ReportesReferencias />} />

      {/* Reporte RRHH */}
      <Route path='reportes/rrhh' element={<Dashboard />} />
      
      {/* Indicadores */}
      <Route path="indicadores/fed" element={<IndicadoresFED />} />
      <Route path="indicadores/fed/fed_2023" element={<Fed_2023 />} />
      <Route path="indicadores/fed/fed_2024" element={<Fed_2024 />} />
      <Route path="indicadores/fed/fed_2025" element={<Fed_2025 />} />
      <Route path="indicadores/gestion" element={<IndicadoresGestion />} />
      <Route path="indicadores/gestion/gestion_2023" element={<Gestion_2023 />} />
      <Route path="indicadores/gestion/gestion_2025" element={<Gestion_2025 />} />
      <Route path="indicadores/salud-mental" element={<IndicadoresSaludMental />} />
      
      {/* SIS */}
      <Route path="sis" element={<SIS />} />
      <Route path="sis/indicadores-sis" element={<IndicadoresSIS />} />
      <Route path="sis/indicadores" element={<MenuIndicadoresSIS />} />
      <Route path="sis/seguimientos" element={<MenuSeguimientos />} />
      <Route path="sis/seguimiento/cancer-uterino" element={<CancerUterino />} />
      <Route path="sis/seguimiento/presion-arterial" element={<PresionArterial />} />
      <Route path="sis/seguimiento/cancer-cervico" element={<CancerCervico />} />
      <Route path="sis/seguimiento/cancer-mama" element={<CancerMama />} />
      <Route path="sis/seguimiento/hipertension-diabetes" element={<HipertensionDiabetes />} />
      <Route path="sis/seguimiento/reporte-atenciones-general" element={<ReporteAtencionesGeneral />} />
      <Route path="sis/seguimiento/consulta-externa-especialista" element={<ConsultaExternaEspecialista />} />
      
      {/* Consultas */}
      <Route path="consultas/paciente-vacunado" element={<PacienteVacunado />} />
      <Route path="consultas/padron-nominal" element={<PadronNominal />} />
      <Route path="consultas/cnv" element={<CNV />} />
      <Route path="consultas/personal-salud" element={<PersonalSalud />} />
      <Route path="consultas/establecimientos" element={<Establecimientos />} />
      <Route path="consultas/his" element={<His />} />
      <Route path="consultas/seguimiento" element={<Seguimiento />} />
      <Route path="consultas/seguimiento/seguimiento-materno" element={<SeguimientoMaterno />} />
      <Route path="consultas/seguimiento/seguimiento-niño" element={<SeguimientoNiño />} />
    </Routes>
  );
};

export default SemciRoutes;
