import { useState } from 'react';

interface Digitador {
  id: number;
  dni: string;
  nombres: string;
  red: string;
  estado: 'Activo' | 'Inactivo';
}

interface DigitadorForm {
  dni: string;
  nombres: string;
  apellidos: string;
  red: string;
  email: string;
  telefono: string;
  usuario: string;
  password: string;
  confirmPassword: string;
}

// Datos de ejemplo
const EJEMPLO_DIGITADORES: Digitador[] = [
  {
    id: 1,
    dni: '12345678',
    nombres: 'Juan Carlos Pérez García',
    red: 'RED_CORONEL_PORTILLO',
    estado: 'Activo'
  },
  {
    id: 2,
    dni: '87654321',
    nombres: 'María Isabel González López',
    red: 'RED_CALLERIA',
    estado: 'Activo'
  },
  {
    id: 3,
    dni: '11223344',
    nombres: 'Carlos Alberto Rodríguez',
    red: 'RED_MANANTAY',
    estado: 'Inactivo'
  },
  {
    id: 4,
    dni: '44332211',
    nombres: 'Ana Teresa Martínez',
    red: 'RED_NUEVA_REQUENA',
    estado: 'Activo'
  },
  {
    id: 5,
    dni: '55667788',
    nombres: 'Pedro Luis Sánchez',
    red: 'RED_CORONEL_PORTILLO',
    estado: 'Activo'
  }
];

const REDES = [
  { value: 'RED_CORONEL_PORTILLO', label: 'Red de Salud Coronel Portillo' },
  { value: 'RED_CALLERIA', label: 'Red Callería' },
  { value: 'RED_MANANTAY', label: 'Red Manantay' },
  { value: 'RED_NUEVA_REQUENA', label: 'Red Nueva Requena' },
];

export default function Digitador() {
  const [digitadores, setDigitadores] = useState<Digitador[]>(EJEMPLO_DIGITADORES);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Activo' | 'Inactivo'>('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [errors, setErrors] = useState<Partial<DigitadorForm>>({});

  const [formData, setFormData] = useState<DigitadorForm>({
    dni: '',
    nombres: '',
    apellidos: '',
    red: '',
    email: '',
    telefono: '',
    usuario: '',
    password: '',
    confirmPassword: ''
  });

  const itemsPorPagina = 10;

  // Filtrar digitadores
  const digitadoresFiltrados = digitadores.filter(digitador => {
    const matchBusqueda = busqueda === '' || 
      digitador.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      digitador.dni.includes(busqueda);
    const matchEstado = filtroEstado === 'Todos' || digitador.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(digitadoresFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const digitadoresPaginados = digitadoresFiltrados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const handleInputChange = (field: keyof DigitadorForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DigitadorForm> = {};

    if (!formData.dni) newErrors.dni = 'DNI es requerido';
    else if (formData.dni.length !== 8) newErrors.dni = 'DNI debe tener 8 dígitos';
    else if (digitadores.some(d => d.dni === formData.dni && d.id !== editingId)) {
      newErrors.dni = 'DNI ya existe';
    }

    if (!formData.nombres) newErrors.nombres = 'Nombres es requerido';
    if (!formData.apellidos) newErrors.apellidos = 'Apellidos es requerido';
    if (!formData.red) newErrors.red = 'Red es requerida';
    if (!formData.email) newErrors.email = 'Email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono) newErrors.telefono = 'Teléfono es requerido';
    if (!formData.usuario) newErrors.usuario = 'Usuario es requerido';
    
    if (!editingId) {
      if (!formData.password) newErrors.password = 'Contraseña es requerida';
      else if (formData.password.length < 6) newErrors.password = 'Contraseña debe tener al menos 6 caracteres';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmar contraseña es requerido';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingId) {
        // Editar digitador existente
        setDigitadores(prev => prev.map(d => 
          d.id === editingId 
            ? { ...d, dni: formData.dni, nombres: `${formData.nombres} ${formData.apellidos}`, red: formData.red }
            : d
        ));
        alert('Digitador actualizado exitosamente');
      } else {
        // Crear nuevo digitador
        const nuevoDigitador: Digitador = {
          id: Math.max(...digitadores.map(d => d.id)) + 1,
          dni: formData.dni,
          nombres: `${formData.nombres} ${formData.apellidos}`,
          red: formData.red,
          estado: 'Activo'
        };
        setDigitadores(prev => [...prev, nuevoDigitador]);
        alert('Digitador creado exitosamente');
      }
      
      handleCloseModal();
      setPaginaActual(1);
    } catch {
      alert('Error al guardar digitador');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (digitador: Digitador) => {
    const [nombres, ...apellidos] = digitador.nombres.split(' ');
    setEditingId(digitador.id);
    setFormData({
      dni: digitador.dni,
      nombres: nombres || '',
      apellidos: apellidos.join(' ') || '',
      red: digitador.red,
      email: '', // En producción, esto vendría de la API
      telefono: '', // En producción, esto vendría de la API
      usuario: '', // En producción, esto vendría de la API
      password: '',
      confirmPassword: ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDigitadores(prev => prev.map(d => 
        d.id === id 
          ? { ...d, estado: d.estado === 'Activo' ? 'Inactivo' : 'Activo' }
          : d
      ));
    } catch {
      alert('Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      dni: '',
      nombres: '',
      apellidos: '',
      red: '',
      email: '',
      telefono: '',
      usuario: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'Activo' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getRedLabel = (redValue: string) => {
    const red = REDES.find(r => r.value === redValue);
    return red ? red.label : redValue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Digitadores
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra los digitadores del sistema
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Digitador
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar por nombre o DNI
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Buscar digitador..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as 'Todos' | 'Activo' | 'Inactivo')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Todos">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {digitadoresFiltrados.length} digitadores
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  N°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Red
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {digitadoresPaginados.map((digitador, index) => (
                <tr key={digitador.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {indiceInicio + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {digitador.dni}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {digitador.nombres}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getRedLabel(digitador.red)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(digitador.estado)}`}>
                      {digitador.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(digitador)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(digitador.id)}
                      className={`${
                        digitador.estado === 'Activo' 
                          ? 'text-red-600 hover:text-red-900 dark:text-red-400' 
                          : 'text-green-600 hover:text-green-900 dark:text-green-400'
                      }`}
                    >
                      {digitador.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {indiceInicio + 1} a {Math.min(indiceInicio + itemsPorPagina, digitadoresFiltrados.length)} de {digitadoresFiltrados.length} resultados
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {paginaActual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar digitador */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Editar Digitador' : 'Nuevo Digitador'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    DNI *
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.dni ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="12345678"
                    maxLength={8}
                  />
                  {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Red *
                  </label>
                  <select
                    value={formData.red}
                    onChange={(e) => handleInputChange('red', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.red ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Seleccionar red</option>
                    {REDES.map(red => (
                      <option key={red.value} value={red.value}>{red.label}</option>
                    ))}
                  </select>
                  {errors.red && <p className="text-red-500 text-sm mt-1">{errors.red}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.nombres ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Juan Carlos"
                  />
                  {errors.nombres && <p className="text-red-500 text-sm mt-1">{errors.nombres}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.apellidos ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Pérez García"
                  />
                  {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="usuario@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="987654321"
                  />
                  {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={formData.usuario}
                    onChange={(e) => handleInputChange('usuario', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.usuario ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="nombre_usuario"
                  />
                  {errors.usuario && <p className="text-red-500 text-sm mt-1">{errors.usuario}</p>}
                </div>

                {!editingId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                          errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Mínimo 6 caracteres"
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmar Contraseña *
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Repita la contraseña"
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {editingId ? 'Actualizar' : 'Crear'} Digitador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
