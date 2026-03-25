import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
//import { redes } from '../../utils/accesories';
import { accessoriesService } from '../../../settings/services/accessoriesService';
import type { microredes, establecimientos } from '../../../settings/services/accessoriesService';
//import useDebounce from '../../hooks/useDebounce';
import { useBackToApp } from '../../../../core/hooks/useBackToApp';

interface PersonalSaludData {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  apellidosNombres: string;
  profesion: string;
  nroColegatura: string;
  condicionLaboral: string;
  redMicroRedEstablecimiento: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: PersonalSaludData[];
}

export default function PersonalSalud() {
  const backLink = useBackToApp();
  //const [allPersonal, setAllPersonal] = useState<PersonalSaludData[]>([]);
  const [filteredPersonal, setFilteredPersonal] = useState<PersonalSaludData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRed, setSelectedRed] = useState<string>('');
  const [selectedMicrored, setSelectedMicrored] = useState<string>('');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<string>('');
  const [searchDocumento, setSearchDocumento] = useState<string>('');
  const [searchNombres, setSearchNombres] = useState<string>('');

  
  //const debouncedSearchDocumento = useDebounce(searchDocumento, 3000);
  //const debouncedSearchNombres = useDebounce(searchNombres, 3000);

  // URL base del API
  const API_BASE_URL = 'http://localhost:3000/api/v2';

  // Estado para controlar si se han cargado datos
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Estados para las opciones de los selectores dinámicos
  //const [redesOptions, setRedesOptions] = useState<string[]>([]);
  const [microredesOptions, setMicroredesOptions] = useState<microredes[]>([]);
  const [establecimientosOptions, setEstablecimientosOptions] = useState<establecimientos[]>([]);

  // Cargar redes al montar el componente
  /*useEffect(() => {
    const loadRedes = () => {
      const redesList = redes.map(r => r.nombre_red);
      setRedesOptions(redesList);
    };
    loadRedes();
  }, []);*/

  // Cargar microredes cuando cambia la red seleccionada
  useEffect(() => {
    const loadMicroredes = async () => {
      if (selectedRed) {
        try {
          const microredesData = await accessoriesService.getMicroredesByNombreRed(selectedRed);
          setMicroredesOptions(microredesData);
          setSelectedMicrored(''); // Reset microred
          setEstablecimientosOptions([]); // Reset establecimientos
        } catch (error) {
          console.error('Error cargando microredes:', error);
        }
      }
    };
    loadMicroredes();
  }, [selectedRed]);

  // Cargar establecimientos cuando cambia la microred seleccionada
  useEffect(() => {
    const loadEstablecimientos = async () => {
      if (selectedRed && selectedMicrored) {
        try {
          const establecimientosData = await accessoriesService.getEstablecimientosByNombreRedMicroRed(selectedRed, selectedMicrored);
          setEstablecimientosOptions(establecimientosData);
          setSelectedEstablecimiento(''); // Reset establecimiento
        } catch (error) {
          console.error('Error cargando establecimientos:', error);
        }
      }
    };
    loadEstablecimientos();
  }, [selectedRed, selectedMicrored]);

  // Función para el botón buscar
  const handleSearch = async () => {
    if (!selectedRed) {
      alert('Por favor selecciona al menos una Red para buscar.');
      return;
    }

    try {
      setLoading(true);

      // Obtener códigos de red, microred y establecimiento
      //const redCode = redes.find(r => r.nombre_red === selectedRed)?.codigo_red;
      const microredCode = microredesOptions.find(m => m.nom_microred === selectedMicrored)?.codigo_microred;
      const establecimientoCode = establecimientosOptions.find(e => e.nombre_establecimiento === selectedEstablecimiento)?.codigo_unico;

      const response = await axios.get<ApiResponse>(
        `${API_BASE_URL}/personal-salud`,
        {
          params: {
            red: /*redCode ||*/ '',
            microred: microredCode || '',
            establecimiento: establecimientoCode || '',
            numeroDocumento: searchDocumento || '',
            nombreApellido: searchNombres || ''
          }
        }
      );

      if (response.data.success) {
        //setAllPersonal(response.data.data);
        setFilteredPersonal(response.data.data);
        setHasLoadedData(true);
        console.log('Filtros aplicados:', {
          selectedRed,
          selectedMicrored,
          selectedEstablecimiento,
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

  // Función para filtrar localmente por documento y nombres
  /*const applyLocalFilters = () => {
    let filtered = allPersonal;

    if (debouncedSearchDocumento.trim()) {
      filtered = filtered.filter(persona =>
        persona.numeroDocumento.toLowerCase().includes(debouncedSearchDocumento.toLowerCase())
      );
    }

    if (debouncedSearchNombres.trim()) {
      filtered = filtered.filter(persona =>
        persona.apellidosNombres.toLowerCase().includes(debouncedSearchNombres.toLowerCase())
      );
    }

    setFilteredPersonal(filtered);
  };*/

  // Función para manejar cambios en inputs
  const handleInputChange = (setter: (value: string) => void, value: string) => {
    setter(value);
  };

  // useEffect para aplicar filtros locales cuando cambian los inputs de búsqueda con debounce
  /*useEffect(() => {
    if (hasLoadedData) {
      applyLocalFilters();
    }
  }, [debouncedSearchDocumento, debouncedSearchNombres, allPersonal]);*/


  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-10 h-10 mx-auto " fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='white'>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">PERSONAL DE SALUD</h1>
              <p className="text-blue-100">Fuente: HISMINSA - Actualizado al 22/08/2025 08:04:46</p>
            </div>
          </div>
          <div className="flex gap-3 items-center justify-between">
            <Link to={backLink} className=" text-white hover:text-gray-300 transition-colors duration-200">
              <div className="items-center justify-between p-3 bg-white bg-opacity-20 rounded-lg">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
                </svg>
              </div>
            </Link>
          </div>

        </div>
      </div>


      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Red:
            </label>
            <select
              value={selectedRed}
              onChange={(e) => setSelectedRed(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">---</option>
              {/*redesOptions.map((red) => (
                <option key={red} value={red}>
                  {red}
                </option>
              ))*/}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Micro Red:
            </label>
            <select
              value={selectedMicrored}
              onChange={(e) => setSelectedMicrored(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">---</option>
              {microredesOptions.map((microred) => (
                <option key={microred.nom_microred} value={microred.nom_microred}>
                  {microred.nom_microred}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Establecimiento:
            </label>
            <select
              value={selectedEstablecimiento}
              onChange={(e) => setSelectedEstablecimiento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">---</option>
              {establecimientosOptions.map((establecimiento) => (
                <option key={establecimiento.nombre_establecimiento} value={establecimiento.nombre_establecimiento}>
                  {establecimiento.nombre_establecimiento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              &nbsp;
            </label>
            <button
              onClick={handleSearch}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>

        {/* Segunda fila de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Numero de Documento:
            </label>
            <input
              type="text"
              value={searchDocumento}
              onChange={(e) => handleInputChange(setSearchDocumento, e.target.value)}
              placeholder="Escribe el Número de Documento para buscar"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombres y Apellidos
            </label>
            <input
              type="text"
              value={searchNombres}
              onChange={(e) => handleInputChange(setSearchNombres, e.target.value)}
              placeholder="Escribe el nombre y apellido para buscar"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Selecciona filtros para buscar personal de salud
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Elige una Red, Microred y/o Establecimiento para obtener la lista del personal de salud.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Tipo Doc.
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Número de Doc.
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Apellidos y Nombres
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Profesión
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Nro. Colegatura
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Condición Laboral
                </th>
                <th className="px-3 py-2 text-left text-xs font-light text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Red/Micro Red/Establecimiento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPersonal.map((persona, index) => (
                <tr key={`${persona.id}-${index}`} className="even:bg-white dark:even:bg-gray-800 dark:even:text-white odd:bg-gray-700 odd:text-white dark:odd:bg-white dark:odd:text-gray-800">
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {persona.tipoDocumento}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {persona.numeroDocumento}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {persona.apellidosNombres}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {persona.profesion}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {persona.nroColegatura}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {persona.condicionLaboral}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {persona.redMicroRedEstablecimiento}
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
