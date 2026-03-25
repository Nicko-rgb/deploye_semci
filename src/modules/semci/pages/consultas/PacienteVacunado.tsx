import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBackToApp } from '../../../../core/hooks/useBackToApp';

interface VacunaAplicada {
  tipo: string;
  dosis: string;
  vacuna: string;
  lote: string;
  fecha: string;
  edad: string;
  establecimiento: string;
  vacunador: string;
}

interface PacienteVacunadoData {
  documento: string;
  nombres: string;
  genero: string;
  fechaNacimiento: string;
  vacunas: VacunaAplicada[];
}

// Datos de ejemplo actualizados
const pacientesVacunados: PacienteVacunadoData[] = [
  {
    documento: '46902128',
    nombres: 'CARLOS CLEMENTE VASQUEZ CISNEROS',
    genero: 'MASCULINO',
    fechaNacimiento: '28/10/1990',
    vacunas: [
      {
        tipo: 'VACUNA REGULAR',
        dosis: 'Dosis única',
        vacuna: 'Vacuna contra la Influenza Adultos (Trivalente)',
        lote: '',
        fecha: '30/04/2025',
        edad: '34A, 6M, 2D',
        establecimiento: '7 DE JUNIO',
        vacunador: 'PUMA FLORES EVELYN ALESSANDRA'
      },
      {
        tipo: 'VACUNA COVID',
        dosis: '1° Dosis refuerzo',
        vacuna: 'PFIZER',
        lote: 'GM6363',
        fecha: '10/01/2024',
        edad: '33A, 2M, 13D',
        establecimiento: '7 DE JUNIO',
        vacunador: 'CARDENAS TORRES MARIEL ANELY'
      }
    ]
  },
  {
    documento: '12345678',
    nombres: 'MARIA ELENA RODRIGUEZ SILVA',
    genero: 'FEMENINO',
    fechaNacimiento: '15/03/1985',
    vacunas: [
      {
        tipo: 'VACUNA COVID',
        dosis: '2° Dosis',
        vacuna: 'PFIZER',
        lote: 'BN1234',
        fecha: '20/06/2023',
        edad: '38A, 3M, 5D',
        establecimiento: 'HOSPITAL NACIONAL',
        vacunador: 'LOPEZ GARCIA JUAN CARLOS'
      }
    ]
  },
  {
    documento: '87654321',
    nombres: 'PEDRO ANTONIO LOPEZ MORALES',
    genero: 'MASCULINO',
    fechaNacimiento: '08/11/1992',
    vacunas: [
      {
        tipo: 'VACUNA REGULAR',
        dosis: 'Dosis única',
        vacuna: 'Hepatitis B',
        lote: 'HB001',
        fecha: '15/05/2023',
        edad: '30A, 6M, 7D',
        establecimiento: 'CENTRO DE SALUD CALLERIA',
        vacunador: 'GARCIA PEREZ ANA SOFIA'
      }
    ]
  }
];

export default function PacienteVacunado() {
  const backLink = useBackToApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'DNI' | 'NOMBRES'>('DNI');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<PacienteVacunadoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuscar = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingrese un texto para buscar');
      return;
    }

    if (searchType === 'DNI' && searchTerm.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    setPacienteEncontrado(null);

    try {
      // Simular búsqueda en la API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paciente = pacientesVacunados.find(p => {
        if (searchType === 'DNI') {
          return p.documento === searchTerm;
        } else {
          return p.nombres.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });

      if (paciente) {
        setPacienteEncontrado(paciente);
      } else {
        setError('No se encontró paciente con los datos ingresados');
      }
    } catch {
      setError('Error al buscar paciente. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  /*const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento.split('/').reverse().join('-'));
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      return edad - 1;
    }
    return edad;
  };*/

  return (
    <div className="space-y-6">
      {/* Header con diseño mejorado */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6  flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">PACIENTES VACUNADOS CONTRA LA COVID-19 Y REGULAR</h1>
            <p className="text-blue-100">Fuente: HIS MINSA - Actualizado al 02/07/2025</p>
          </div>
        </div>
        {/* Botón de inicio, se empuja al lado derecho */}
          <Link to={backLink} className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
            <div className="flex items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
              </svg>

            </div>
          </Link>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        ≡ Buscar pacientes vacunados contra la COVID-19 y REGULAR - Ucayali
      </div>

      {/* Formulario de búsqueda mejorado */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="flex gap-6 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="DNI"
                checked={searchType === 'DNI'}
                onChange={(e) => setSearchType(e.target.value as 'DNI' | 'NOMBRES')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">DNI</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="NOMBRES"
                checked={searchType === 'NOMBRES'}
                onChange={(e) => setSearchType(e.target.value as 'DNI' | 'NOMBRES')}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">NOMBRES Y APELLIDOS</span>
            </label>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Texto a Buscar: <span className="text-red-500">(*)</span>
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  if (searchType === 'DNI') {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setSearchTerm(value);
                  } else {
                    setSearchTerm(e.target.value);
                  }
                  setError('');
                }}
                placeholder={searchType === 'DNI' ? "46902128" : "Nombres y apellidos"}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                maxLength={searchType === 'DNI' ? 8 : undefined}
              />
            </div>
            <div className="flex items-end">
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
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Datos del paciente */}
      {pacienteEncontrado && (
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 text-center">
            <h2 className="text-xl font-bold mb-4">DATOS DEL PACIENTE</h2>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-lg"><strong>Nro. Documento:</strong> {pacienteEncontrado.documento}</p>
              <p className="text-lg"><strong>Nombres:</strong> {pacienteEncontrado.nombres}</p>
              <p><strong>Género:</strong> {pacienteEncontrado.genero}</p>
              <p><strong>Fecha Nacimiento:</strong> {pacienteEncontrado.fechaNacimiento}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de vacunas */}
      {pacienteEncontrado && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-4">
            <h3 className="text-lg font-bold">INFORMACION DE VACUNAS APLICADAS</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                    TIPO DE VACUNA
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                    DOSIS
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                    VACUNA APLICADA
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                    LOTE
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                    FECHA
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                    EDAD
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                    ESTABLECIMIENTO
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600">
                    VACUNADOR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {pacienteEncontrado.vacunas.map((vacuna, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${vacuna.tipo === 'VACUNA COVID'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                        {vacuna.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                      {vacuna.dosis}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                      {vacuna.vacuna}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${vacuna.lote
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'text-gray-400'
                        }`}>
                        {vacuna.lote || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                      {vacuna.fecha}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                      {vacuna.edad}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                      {vacuna.establecimiento}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                      {vacuna.vacunador}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      {!loading && !pacienteEncontrado && !error && (
        <div className="bg-blue-50 dark:bg-blue-600 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Instrucciones de Uso</h3>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Seleccione el tipo de búsqueda: DNI o Nombres y Apellidos</li>
                <li>• Ingrese el texto a buscar según el tipo seleccionado</li>
                <li>• Para DNI: Ingrese exactamente 8 dígitos</li>
                <li>• Para nombres: Puede usar nombres parciales</li>
                <li>• Para pruebas, use los documentos: <strong>46902128</strong>, <strong>12345678</strong> o <strong>87654321</strong></li>
                <li>• Haga clic en "Buscar" para consultar el historial de vacunación</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
