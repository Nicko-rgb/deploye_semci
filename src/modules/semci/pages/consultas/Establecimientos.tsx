import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
//import { redes } from '../../utils/accesories';
import { accessoriesService } from '../../../settings/services/accessoriesService';
import { useBackToApp } from '../../../../core/hooks/useBackToApp';

// Interface para el establecimiento
interface EstablecimientoDetallado {
  id_establecimiento: number;
  nombre_establecimiento: string;
  codigo_red: string;
  nom_red: string;
  codigo_microred: string;
  nom_microred: string;
  codigo_unico: string;
  provincia: string;
  distrito: string;
  categoria_establecimiento: string;
}
// Interface para la respuesta del API
interface ApiResponse {
  success: boolean;
  message: string;
  data: EstablecimientoDetallado[];
}

export default function Establecimientos() {
  const backLink = useBackToApp();
  const [filteredEstablecimientos, setFilteredEstablecimientos] = useState<EstablecimientoDetallado[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRed, setSelectedRed] = useState<string>('');
  const [selectedMicrored, setSelectedMicrored] = useState<string>('');

  // URL base del API
  const API_BASE_URL = 'http://localhost:3000/api/v1';

  // Estado para controlar si se han cargado datos
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Estados para las opciones de los selectores
  //const [redesOptions, setRedesOptions] = useState<{codigo: string, nombre: string}[]>([]);
  const [microredesOptions, setMicroredesOptions] = useState<{codigo: string, nombre: string}[]>([]);
  const [loadingMicroredes, setLoadingMicroredes] = useState(false);

  // Cargar redes al montar el componente
  /*useEffect(() => {
    setRedesOptions(redes.map(red => ({ codigo: red.codigo_red, nombre: red.nombre_red })));
  }, []);*/

  // Cargar microredes cuando se selecciona una red
  useEffect(() => {
    const loadMicroredes = async () => {
      if (selectedRed) {
        setLoadingMicroredes(true);
        try {
          const microredes = await accessoriesService.getMicroredesByCodigoRed(selectedRed);
          setMicroredesOptions(microredes.map(m => ({ codigo: m.codigo_microred, nombre: m.nom_microred })));
        } catch (error) {
          console.error('Error cargando microredes:', error);
          setMicroredesOptions([]);
        } finally {
          setLoadingMicroredes(false);
        }
      } else {
        setMicroredesOptions([]);
      }
    };

    loadMicroredes();
  }, [selectedRed]);

  // Limpiar microred seleccionada cuando cambia la red
  useEffect(() => {
    setSelectedMicrored('');
  }, [selectedRed]);

  // Función para el botón buscar
  const handleSearch = async () => {
    // Validar que al menos uno de los filtros esté seleccionado
    if (!selectedRed && !selectedMicrored) {
      alert('Por favor selecciona al menos una Red o Microred para buscar.');
      return;
    }
    try {
      setLoading(true);

      const response = await axios.get<ApiResponse>(
        `${API_BASE_URL}/establecimientos-detallados`,
        {
          params: {
            codigo_red: selectedRed || '',
            codigo_microred: selectedMicrored || ''
          }
        }
      );
      if (response.data.success) {
        setFilteredEstablecimientos(response.data.data);
        setHasLoadedData(true);
        console.log('Filtros aplicados:', {
          selectedRed,
          selectedMicrored,
          resultados: response.data.data.length
        });
      }
    } catch (error) {
      console.error('Error aplicando filtros:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };
  // Exportar a Excel
  const handleExport = () => {
    // Preparar datos para Excel
    const excelData = filteredEstablecimientos.map(est => ({
      'ID_ESTABLECIMIENTO': est.id_establecimiento,
      'CODIGO_UNICO': est.codigo_unico,
      'NOMBRE_ESTABLECIMIENTO': est.nombre_establecimiento,
      'CODIGO_MICRORED': est.codigo_microred,
      'MICRORED': est.nom_microred,
      'CODIGO_RED': est.codigo_red,
      'RED': est.nom_red,
      'PROVINCIA': est.provincia,
      'DISTRITO': est.distrito,
      'CATEGORIA': est.categoria_establecimiento
    }));

    // Crear libro de trabajo y hoja
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Establecimientos');

    // Generar archivo Excel y descargar
    XLSX.writeFile(workbook, `establecimientos_salud_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Establecimientos de Salud
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Directorio y gestión de establecimientos de salud de la red
          </p>
        </div>
        <Link to={backLink} className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
          <svg className="w-12 h-12 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='black'>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
          </svg>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Red
            </label>
            <select
              value={selectedRed}
              onChange={(e) => setSelectedRed(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">---</option>
              {/* {redesOptions.map((red) => (
                <option key={red.codigo} value={red.codigo}>
                  {red.nombre}
                </option>
              ))} */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Microred
            </label>
            <select
              value={selectedMicrored}
              onChange={(e) => setSelectedMicrored(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loadingMicroredes}
            >
              <option value="">
                {loadingMicroredes ? 'Cargando...' : '---'}
              </option>
              {microredesOptions.map((microred) => (
                <option key={microred.codigo} value={microred.codigo}>
                  {microred.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <button
              onClick={handleSearch}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exportar
            </label>
            <button
              onClick={handleExport}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Mensaje inicial, Loading o Tabla */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-lg">Cargando...</div>
        </div>
      ) : !hasLoadedData ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Selecciona filtros para buscar establecimientos
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Elige una Red y Microred para obtener la lista de establecimientos de salud.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  ID_ESTABLECIMIENTO
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  CODIGO_UNICO
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  NOMBRE_ESTABLECIMIENTO
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  CODIGO_MICRORED
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  MICRORED
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  CODIGO_RED
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  RED
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  PROVINCIA
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  DISTRITO
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  CATEGORIA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEstablecimientos.map((establecimiento) => (
                <tr key={establecimiento.id_establecimiento} className="even:bg-white dark:even:bg-gray-800 dark:even:text-white odd:bg-gray-700 odd:text-white dark:odd:bg-white dark:odd:text-gray-800 ">
                  <td className="px-3 py-2 whitespace-nowrap text-sm ">
                    {establecimiento.id_establecimiento}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.codigo_unico}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.nombre_establecimiento}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.codigo_microred}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.nom_microred}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.codigo_red}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.nom_red}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.provincia}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.distrito}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {establecimiento.categoria_establecimiento}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
