import { useState } from 'react';
import { NotebookPenIcon } from 'lucide-react';
import PageHeader from '../../../../core/components/PageHeader';
import { useAppBreadcrumb } from '../../../../core/hooks/useAppBreadcrumb';

interface HisData {
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  seguro: string;
  estado: string;
}

interface Atencion {
  id: number;
  numeroDocumento: string;
  edad: string;
  fechaAtencion: string;
  lote: string;
  nroPag: number;
  nroReg: number;
  condEess: string;
  condServ: string;
  peso: string;
  talla: string;
  resHb: string;
  profesional: string;
  establecimiento: string;
  digitador: string;
  atenciones: {
    tipoDiag: string;
    codigoCiex: string;
    lab1: string;
    lab2: string;
    lab3: string;
  }[];
}

// Datos de ejemplo
const EJEMPLO_PACIENTE_COMPLETO: HisData = {
  numeroDocumento: '12345678',
  nombres: 'Juan Carlos',
  apellidoPaterno: 'Pérez',
  apellidoMaterno: 'García',
  fechaNacimiento: '1985-03-15',
  genero: 'Masculino',
  telefono: '987654321',
  direccion: 'Av. Los Pinos 123',
  distrito: 'Callería',
  provincia: 'Coronel Portillo',
  departamento: 'Ucayali',
  seguro: 'SIS',
  estado: 'Activo'
};

const EJEMPLO_PACIENTE_COMPLETO_2: HisData = {
  numeroDocumento: '46902128',
  nombres: 'María Elena',
  apellidoPaterno: 'Cardenas',
  apellidoMaterno: 'Torres',
  fechaNacimiento: '1990-12-08',
  genero: 'Femenino',
  telefono: '965432178',
  direccion: 'Jr. Las Flores 456',
  distrito: 'Manantay',
  provincia: 'Coronel Portillo',
  departamento: 'Ucayali',
  seguro: 'ESSALUD',
  estado: 'Activo'
};


const EJEMPLO_PACIENTE_INCOMPLETO: HisData = {
  numeroDocumento: '94186035',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaNacimiento: '',
  genero: '',
  telefono: '',
  direccion: '',
  distrito: '',
  provincia: '',
  departamento: '',
  seguro: '',
  estado: ''
};

const EJEMPLO_ATENCIONES: Atencion[] = [
  {
    id: 1,
    numeroDocumento: '94186035',
    edad: '1 D',
    fechaAtencion: '24/03/2025',
    lote: 'ACT',
    nroPag: 18,
    nroReg: 4,
    condEess: 'C',
    condServ: 'N',
    peso: '3.2',
    talla: '50',
    resHb: '',
    profesional: '00087655 (29) PLAZA SANGAMA PETRONILA',
    establecimiento: '000005556 9 DE OCTUBRE',
    digitador: '123600 RIOS MELLO ELSA NINA',
    atenciones: [
      { tipoDiag: 'D', codigoCiex: '90585', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '90744', lab1: '', lab2: '', lab3: '' }
    ]
  },
  {
    id: 2,
    numeroDocumento: '94186035',
    edad: '1 D',
    fechaAtencion: '24/03/2025',
    lote: 'X27',
    nroPag: 2,
    nroReg: 7,
    condEess: 'N',
    condServ: 'N',
    peso: '',
    talla: '',
    resHb: '',
    profesional: '00081117 (29) TOLENTINO MONZON MIRIAM LUCY',
    establecimiento: '000005556 9 DE OCTUBRE',
    digitador: '123600 RIOS MELLO ELSA NINA',
    atenciones: [
      { tipoDiag: 'D', codigoCiex: '99436', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '99436.02', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '99431', lab1: '', lab2: '', lab3: '' }
    ]
  },
  {
    id: 3,
    numeroDocumento: '94186035',
    edad: '1 D',
    fechaAtencion: '24/03/2025',
    lote: 'X53',
    nroPag: 3,
    nroReg: 6,
    condEess: 'C',
    condServ: 'C',
    peso: '',
    talla: '',
    resHb: '',
    profesional: '00087655 (29) PLAZA SANGAMA PETRONILA',
    establecimiento: '000005556 9 DE OCTUBRE',
    digitador: '123600 RIOS MELLO ELSA NINA',
    atenciones: [
      { tipoDiag: 'D', codigoCiex: '99460', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '99433', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '85018', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '99401.03', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '99401.04', lab1: '', lab2: '', lab3: '' }
    ]
  },
  {
    id: 4,
    numeroDocumento: '94186035',
    edad: '3 D',
    fechaAtencion: '27/03/2025',
    lote: 'R15',
    nroPag: 2,
    nroReg: 23,
    condEess: 'C',
    condServ: 'C',
    peso: '3.81',
    talla: '52.3',
    resHb: '',
    profesional: '40685604 (29) ALCA GAMBOA SULME',
    establecimiento: '000005556 9 DE OCTUBRE',
    digitador: '74820886 DEL AGUILA IPUSHIMA NELLY CELESTE',
    atenciones: [
      { tipoDiag: 'D', codigoCiex: 'P080', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: 'Z001', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '99381.01', lab1: 'I', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: 'Z006', lab1: '', lab2: '', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '99403.01', lab1: 'I', lab2: '', lab3: '' }
    ]
  },
  {
    id: 5,
    numeroDocumento: '46902128',
    edad: '33 A',
    fechaAtencion: '10/01/2024',
    lote: 'ACT',
    nroPag: 2,
    nroReg: 6,
    condEess: 'R',
    condServ: 'R',
    peso: '65',
    talla: '165',
    resHb: '12.5',
    profesional: '45384340 (29) CARDENAS TORRES MARIEL ANELY',
    establecimiento: '000005554 7 DE JUNIO',
    digitador: '73248684 CARTAGENA RAMOS JHONNY DANIEL',
    atenciones: [
      { tipoDiag: 'D', codigoCiex: '90749.01', lab1: 'DA', lab2: 'P39', lab3: '' },
      { tipoDiag: 'D', codigoCiex: '90749.01', lab1: 'P39', lab2: 'LA', lab3: 'TX' }
    ]
  },
  {
    id: 6,
    numeroDocumento: '12345678',
    edad: '28 A',
    fechaAtencion: '15/12/2023',
    lote: 'BCT',
    nroPag: 5,
    nroReg: 3,
    condEess: 'R',
    condServ: 'N',
    peso: '72',
    talla: '170',
    resHb: '13.2',
    profesional: '12345678 (15) RODRIGUEZ PEREZ CARLOS ALBERTO',
    establecimiento: '000001234 HOSPITAL NACIONAL',
    digitador: '87654321 GARCIA LOPEZ MARIA ELENA',
    atenciones: [
      { tipoDiag: 'P', codigoCiex: '80123.05', lab1: 'LA', lab2: 'TX', lab3: 'HB' }
    ]
  }
];

export default function His() {
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const breadcrumb = useAppBreadcrumb(['HIS Digital']);
  const [codigoCiex, setCodigoCiex] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ano, setAno] = useState('2024');
  const [tipoBusqueda, setTipoBusqueda] = useState<'año' | 'rango'>('año');
  const [loading, setLoading] = useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] = useState<HisData | null>(null);
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [error, setError] = useState('');
  const [mostrarColumnasOpcionales, setMostrarColumnasOpcionales] = useState(false);
  const [mostrarDatosAdicionales, setMostrarDatosAdicionales] = useState(false);


  const tieneDatosCompletos = (paciente: HisData | null): boolean => {
    return !!(paciente && paciente.nombres && paciente.apellidoPaterno && paciente.apellidoMaterno);
  };

  const handleBuscar = async () => {
    if (!numeroDocumento.trim()) {
      setError('Por favor ingrese un número de documento');
      return;
    }

    if (numeroDocumento.length !== 8) {
      setError('El número de documento debe tener 8 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    console.log(pacienteEncontrado);

    try {

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (numeroDocumento === '12345678' || numeroDocumento === '46902128' || numeroDocumento === '94186035') {

        let paciente: HisData;
        if (numeroDocumento === '12345678') {
          paciente = EJEMPLO_PACIENTE_COMPLETO;
        } else if (numeroDocumento === '46902128') {
          paciente = EJEMPLO_PACIENTE_COMPLETO_2;
        } else {
          paciente = EJEMPLO_PACIENTE_INCOMPLETO;
        }

        setPacienteEncontrado(paciente);


        let atencionesFiltered = EJEMPLO_ATENCIONES.filter(a => a.numeroDocumento === numeroDocumento);


        if (codigoCiex.trim()) {
          atencionesFiltered = atencionesFiltered.filter(a =>
            a.atenciones.some(atencion =>
              atencion.codigoCiex.toLowerCase().includes(codigoCiex.toLowerCase())
            )
          );
        }


        if (tipoBusqueda === 'año') {

          atencionesFiltered = atencionesFiltered.filter(a => {
            const fechaAtencion = new Date(a.fechaAtencion.split('/').reverse().join('-'));
            return fechaAtencion.getFullYear().toString() === ano;
          });
        } else if (tipoBusqueda === 'rango' && (fechaInicio || fechaFin)) {

          atencionesFiltered = atencionesFiltered.filter(a => {
            const fechaAtencion = new Date(a.fechaAtencion.split('/').reverse().join('-'));
            const inicio = fechaInicio ? new Date(fechaInicio) : new Date('1900-01-01');
            const fin = fechaFin ? new Date(fechaFin) : new Date('2100-12-31');
            return fechaAtencion >= inicio && fechaAtencion <= fin;
          });
        }

        setAtenciones(atencionesFiltered);

        if (atencionesFiltered.length === 0 && (codigoCiex || (tipoBusqueda === 'rango' && (fechaInicio || fechaFin)))) {
          setError('No se encontraron atenciones con los filtros aplicados');
        }
      } else {
        setPacienteEncontrado(null);
        setAtenciones([]);
        setError('No se encontró paciente con el número de documento ingresado');
      }
    } catch {
      setError('Error al buscar paciente. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setNumeroDocumento('');
    setCodigoCiex('');
    setFechaInicio('');
    setFechaFin('');
    setTipoBusqueda('año');
    setAno('2025');
    setPacienteEncontrado(null);
    setAtenciones([]);
    setError('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="HIS Digital"
        description="Sistema de Información Hospitalaria"
        icon={NotebookPenIcon}
        color="#3B82F6"
        breadcrumb={breadcrumb}
        badge={atenciones.length > 0
          ? [{ label: `${atenciones.length} atenciones` }]
          : undefined
        }
      />

      {/* Formulario de búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {/* Tipo de Búsqueda */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            TIPO DE BÚSQUEDA POR FECHA:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="año"
                checked={tipoBusqueda === 'año'}
                onChange={(e) => setTipoBusqueda(e.target.value as 'año' | 'rango')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Buscar por año completo</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="rango"
                checked={tipoBusqueda === 'rango'}
                onChange={(e) => setTipoBusqueda(e.target.value as 'año' | 'rango')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Buscar por rango de fechas</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

          {tipoBusqueda === 'año' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AÑO:
              </label>
              <select
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          )}
          {tipoBusqueda === 'rango' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  FECHA INICIO:
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  FECHA FIN:
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              NUMERO DE DOCUMENTO: <span className="text-red-500">(*)</span>
            </label>
            <input
              type="text"
              value={numeroDocumento}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                setNumeroDocumento(value);
                setError('');
              }}
              placeholder="46902128"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              maxLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CÓDIGO CIE-X:
            </label>
            <input
              type="text"
              value={codigoCiex}
              onChange={(e) => setCodigoCiex(e.target.value)}
              placeholder="90749.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBuscar}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              Buscar
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleLimpiar}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
        {(codigoCiex || (tipoBusqueda === 'año' && ano !== '2024') || (tipoBusqueda === 'rango' && (fechaInicio || fechaFin))) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md">
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">Filtros activos:</p>
            <div className="flex flex-wrap gap-2">
              {tipoBusqueda === 'año' && ano !== '2024' && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                  Año: {ano}
                </span>
              )}
              {tipoBusqueda === 'rango' && fechaInicio && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                  Desde: {fechaInicio}
                </span>
              )}
              {tipoBusqueda === 'rango' && fechaFin && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                  Hasta: {fechaFin}
                </span>
              )}
              {codigoCiex && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                  CIE-X: {codigoCiex}
                </span>
              )}
              <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-md">
                Búsqueda: {tipoBusqueda === 'año' ? 'Por año' : 'Por rango de fechas'}
              </span>
            </div>
          </div>
        )}
      </div>
      {pacienteEncontrado && tieneDatosCompletos(pacienteEncontrado) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Datos del Paciente
              </h2>
            </div>
            <button
              onClick={() => setMostrarDatosAdicionales(!mostrarDatosAdicionales)}
              className={`px-3 py-1 text-white text-sm rounded-md flex items-center gap-1 transition-colors ${mostrarDatosAdicionales
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
              title={mostrarDatosAdicionales ? 'Ocultar información adicional' : 'Mostrar información adicional'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mostrarDatosAdicionales ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
              {mostrarDatosAdicionales ? 'Ocultar Detalles' : 'Más Detalles'}
              {!mostrarDatosAdicionales && (
                <span className="ml-1 bg-white bg-opacity-20 rounded-full px-1.5 py-0.5 text-xs font-bold">
                  +4
                </span>
              )}
            </button>
          </div>
          {mostrarDatosAdicionales && (pacienteEncontrado.seguro || pacienteEncontrado.departamento) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Número de Documento
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pacienteEncontrado.numeroDocumento}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Nombres
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pacienteEncontrado.nombres}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Apellido Paterno
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pacienteEncontrado.apellidoPaterno}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Apellido Materno
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pacienteEncontrado.apellidoMaterno}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Fecha de Nacimiento
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pacienteEncontrado.fechaNacimiento ?
                      new Date(pacienteEncontrado.fechaNacimiento).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) :
                      'No disponible'
                    }
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Género
                  </label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${pacienteEncontrado.genero === 'Masculino' ? 'bg-blue-500' :
                      pacienteEncontrado.genero === 'Femenino' ? 'bg-pink-500' : 'bg-gray-400'
                      }`}></div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {pacienteEncontrado.genero || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                {pacienteEncontrado.seguro && (
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Seguro
                    </label>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${pacienteEncontrado.seguro === 'SIS' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      pacienteEncontrado.seguro === 'ESSALUD' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                      {pacienteEncontrado.seguro}
                    </span>
                  </div>
                )}

                {pacienteEncontrado.departamento && (
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Ubicación
                    </label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {[pacienteEncontrado.distrito, pacienteEncontrado.provincia, pacienteEncontrado.departamento]
                        .filter(Boolean)
                        .join(', ')
                      }
                    </p>
                  </div>
                )}
                {pacienteEncontrado.estado && (
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Estado
                    </label>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${pacienteEncontrado.estado === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                      {pacienteEncontrado.estado}
                    </span>
                  </div>
                )}

                {pacienteEncontrado.telefono && (
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Teléfono
                    </label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {pacienteEncontrado.telefono}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          {!mostrarDatosAdicionales && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Información personal del paciente disponible</span>
              </div>
            </div>
          )}
        </div>
      )
      }
      {
        atenciones.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resultados de Búsqueda ({atenciones.length} atenciones con {atenciones.reduce((total, atencion) => total + atencion.atenciones.length, 0)} códigos de diagnóstico)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMostrarColumnasOpcionales(!mostrarColumnasOpcionales)}
                    className={`px-3 py-1 text-white text-sm rounded-md flex items-center gap-1 transition-colors ${mostrarColumnasOpcionales
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    title={mostrarColumnasOpcionales ? 'Ocultar columnas opcionales' : 'Mostrar columnas opcionales'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {mostrarColumnasOpcionales ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                    {mostrarColumnasOpcionales ? 'Ocultar Detalles' : 'Mostrar Detalles'}
                    {!mostrarColumnasOpcionales && (
                      <span className="ml-1 bg-white bg-opacity-20 rounded-full px-1.5 py-0.5 text-xs font-bold">
                        +5
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      #
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      NUMERO DOCUMENTO
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      EDAD
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      FECHA ATENCION
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      LOTE
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      NRO. PAG.
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      NRO. REG.
                    </th>
                    {mostrarColumnasOpcionales && (
                      <>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900">
                          COND. EESS.
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900">
                          COND. SERV.
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900">
                          PESO
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900">
                          TALLA
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900">
                          RES. HB
                        </th>
                      </>
                    )}
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      PROFESIONAL
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      ESTABLECIMIENTO
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      DIGITADOR
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                      ATENCIONES
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {atenciones.map((atencion, index) => (
                    <tr key={atencion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        {atencion.numeroDocumento}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        {atencion.edad}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        {atencion.fechaAtencion}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-center">
                        <span className="px-1 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-xs font-medium">
                          {atencion.lote}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-center">
                        <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                          {atencion.nroPag}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 text-center">
                        <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                          {atencion.nroReg}
                        </span>
                      </td>
                      {mostrarColumnasOpcionales && (
                        <>
                          <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900 text-center">
                            {atencion.condEess}
                          </td>
                          <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900 text-center">
                            {atencion.condServ}
                          </td>
                          <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900 text-center">
                            {atencion.peso}
                          </td>
                          <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900 text-center">
                            {atencion.talla}
                          </td>
                          <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900 text-center">
                            {atencion.resHb}
                          </td>
                        </>
                      )}
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        {atencion.profesional}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        {atencion.establecimiento}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        {atencion.digitador}
                      </td>
                      <td className="text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-600">
                                <th className="px-2 py-1 text-left font-medium text-orange-700 dark:text-orange-300 border-r border-gray-300 dark:border-gray-500">
                                  Tip. Diag
                                </th>
                                <th className="px-2 py-1 text-left font-medium text-blue-700 dark:text-blue-300 border-r border-gray-300 dark:border-gray-500">
                                  Código CIEX
                                </th>
                                <th className="px-2 py-1 text-left font-medium text-green-700 dark:text-green-300 border-r border-gray-300 dark:border-gray-500">
                                  Lab
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {atencion.atenciones.map((subAtencion, subIndex) => (
                                <tr key={subIndex} className={subIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                  <td className="px-2 py-1 border-r border-gray-300 dark:border-gray-500 text-center">
                                    <span className="px-1 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-xs font-medium">
                                      {subAtencion.tipoDiag}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1 border-r border-gray-300 dark:border-gray-500 text-center">
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                      {subAtencion.codigoCiex}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1 border-r border-gray-300 dark:border-gray-500 text-center">
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      {subAtencion.lab1 || '-'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
      {
        !loading && atenciones.length === 0 && !error && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Instrucciones de Uso</h3>
                <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Seleccione el tipo de búsqueda: por año completo o por rango de fechas</li>
                  <li>• Ingrese el número de documento del paciente (8 dígitos)</li>
                  <li>• <strong>Búsqueda por año:</strong> Seleccione el año para filtrar todas las atenciones de ese año</li>
                  <li>• <strong>Búsqueda por rango:</strong> Especifique fecha de inicio y/o fecha fin para un período específico</li>
                  <li>• Opcionalmente, filtre también por código CIE-X</li>
                  <li>• Para pruebas, use los documentos: <strong>94186035</strong>, <strong>46902128</strong> o <strong>12345678</strong></li>
                  <li>• Use "Limpiar Filtros" para resetear todos los campos</li>
                </ul>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
