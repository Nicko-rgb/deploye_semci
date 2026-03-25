import * as React from 'react';
import { userService, type User, type CreateUserData, type UserProps } from '../services/userService';
import { documentTypes } from '../../../core/utils/accesories';
import { accessoriesService, type establecimientos, type microredes, type Module
  , type SubModule, type Permission
 } from '../services/accessoriesService';

import { commonService } from '../../../modules/recursos-humanos/services/commonService';
import type { ChangeEvent } from '../../../core/utils/interfaces';
import Swal from 'sweetalert2';
import type { ProfessionItem } from '../../recursos-humanos';
import useDebounce from '../../../core/hooks/useDebounce';


const formDataInitial: User = {
  userId: 0,
  username: '',
  firstName: '',
  paternalSurname: '',
  maternalSurname: '',
  email: '',
  phone: '',
  documentType: '',
  documentNumber: '',
  gender: '',
  profesionId: '',
  diresa: '',
  codigoRed: '',
  codigoMicrored: '',
  codigoUnico: '',
  isActive: true,
  role: ''
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = React.useState<UserProps[]>([]);
  const [filtroEstado, setFiltroEstado] = React.useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [busqueda, setBusqueda] = React.useState('');
  const debouncedBusqueda = useDebounce(busqueda, 500);
  const [mostrarFormulario, setMostrarFormulario] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'info' | 'roles' | 'permisos' | 'establecimientos'>('info');

  // Estados para paginación
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(false);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);

  // Estados para el formulario extendido
  const [formData, setFormData] = React.useState<User>(formDataInitial);

  // Estados adicionales para la funcionalidad de búsqueda por DNI
  const [buscandoDNI, setBuscandoDNI] = React.useState(false);
  const [dniBuscado, setDniBuscado] = React.useState(false);
  const [userAlreadyExists, setUserAlreadyExists] = React.useState(false);

  // Estados para manejo de errores y loading
  const [isCreatingUser, setIsCreatingUser] = React.useState(false);
  
  // Estados para modo edición
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<number | null>(null);
  const [loadingUserData, setLoadingUserData] = React.useState(false);

  // Configuración de Toast para notificaciones
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  // Estados para el sistema de pasos
  const [currentStep, setCurrentStep] = React.useState(1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [stepValidation, setStepValidation] = React.useState({
    step1: false,
    step2: false,
    step3: false
  });

  // Estados para relaciones
  //const [selectedRol, setSelectedRol] = React.useState<number | null>(null);
  const [selectedPermisos, setSelectedPermisos] = React.useState<number[]>([]);
  const [selectedModulos, setSelectedModulos] = React.useState<number[]>([]);
  
  const [selectedSubmodulos, setSelectedSubmodulos] = React.useState<number[]>([]);
  
  // Estado para permisos específicos por submódulo (array de permissionIds)
  const [submoduloPermissions, setSubmoduloPermissions] = React.useState<Record<number, number[]>>({});
  
  // Estado para permisos específicos por módulo sin submódulos (array de permissionIds)
  const [moduloPermissions, setModuloPermissions] = React.useState<Record<number, number[]>>({});

  const [password, setPassword] = React.useState('');
  const [redes, setRedes] = React.useState<any[]>([]);
  const [microredes, setMicroredes] = React.useState<microredes[]>([]);
  const [establecimientos, setEstablecimientos] = React.useState<establecimientos[]>([]);
  const [profesiones, setProfesiones] = React.useState<ProfessionItem[]>([]);

  const [applications, setApplications] = React.useState<any[]>([]);
  const [modules, setModules] = React.useState<Module[]>([]);
  const [submodules, setSubmodules] = React.useState<SubModule[]>([]);
  
  // Estados para aplicaciones seleccionadas y permisos de módulos sin submódulos
  const [selectedApplications, setSelectedApplications] = React.useState<number[]>([]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  
  // Estado para rastrear módulos que no tienen submódulos
  const [modulosWithoutSubmodules, setModulosWithoutSubmodules] = React.useState<number[]>([]);

  // Función para obtener usuarios del servidor
  const fetchUsuarios = React.useCallback(async () => {
    setLoading(true);
    try {
      const isActive = filtroEstado === 'todos' ? undefined : filtroEstado === 'activo';
      const search = debouncedBusqueda.trim() || undefined;
      
      const response = await userService.getUsers(currentPage, itemsPerPage, search, isActive);
      
      if (response.success) {
        setUsuarios(response.data);
        setTotalUsers(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Toast.fire({
        icon: "error",
        title: "Error al cargar usuarios"
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedBusqueda, filtroEstado]);

  // Cargar usuarios cuando cambian los filtros o la página
  React.useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  React.useEffect(() => {
    obtenerProfesiones();
    getRedes();
    getApplication();
    getPermissions();
  }, []);

  const getRedes = async () => {
    const datos = await accessoriesService.getRedesByCodigoDisa();
    setRedes(datos);
  }

  const obtenerMicroredes = async (codigo_red: string) => {
    if(codigo_red !== ''){
      const datos = await accessoriesService.getMicroredesByCodigoRed(codigo_red);
      setMicroredes(datos);
    }
    else{
      setMicroredes([]);
    }
  };

  const obtenerEstablecimientos = async (codigo_microred: string) => {
    if((formData.codigoRed !== '' && formData.codigoRed !== undefined) && codigo_microred !== ''){
      const datos = await accessoriesService.getEstablecimientosByCodigoRedMicroRed(formData.codigoRed, codigo_microred);
      setEstablecimientos(datos);
    }
    else{
      setEstablecimientos([]);
    }
  };

  const obtenerProfesiones = async () => {
    const datos = await commonService.getProfessions();
    if (datos.success) {
      setProfesiones(datos.data || []);
    } 
  };

  const getApplication = async () => {
    const datos = await accessoriesService.getApplications();
    setApplications(datos);
  }

  const getPermissions = async () => {
    const datos = await accessoriesService.getPermission();
    setPermissions(datos);
  }

  const obtenerSubModulosByModuloId = async (moduloId: number, skipPermissionsInit = false) => {
    const datos = await accessoriesService.getSubModulesByModule(moduloId);
    if (datos.length > 0) {
      // Acumular submódulos en lugar de reemplazar
      setSubmodules(prev => {
        // Filtrar submódulos existentes del mismo módulo para evitar duplicados
        const sinDuplicados = prev.filter(sub => sub.moduleId !== moduloId);
        // Agregar los nuevos submódulos
        return [...sinDuplicados, ...datos];
      });
      // Remover el módulo de la lista de módulos sin submódulos si estaba
      setModulosWithoutSubmodules(prev => prev.filter(id => id !== moduloId));
    } else {
      // El módulo no tiene submódulos, marcarlo y mostrar permisos directamente
      setModulosWithoutSubmodules(prev => 
        prev.includes(moduloId) ? prev : [...prev, moduloId]
      );
      // Solo inicializar permisos del módulo si no estamos en modo edición
      if (!skipPermissionsInit) {
        initializeModuloPermissions(moduloId);
      }
    }
  }

  const searchUser = async () => {
    try {
      if (formData.documentType && formData.documentNumber) {
        setBuscandoDNI(true);
        
        const result = await userService.getUserByDocument(formData.documentType, formData.documentNumber);
        
        // Verificar si el usuario ya existe en el sistema
        if (result?.code === 'USER_ALREADY_EXISTS' || result?.canRegister === false) {
          setDniBuscado(false);
          setUserAlreadyExists(true);
          
          // Limpiar los campos del formulario que se autocompletarían
          setFormData(prev => ({
            ...prev,
            firstName: '',
            paternalSurname: '',
            maternalSurname: '',
          }));
          
          // Mostrar error indicando que el usuario ya existe
          Toast.fire({
            icon: "error",
            title: result.message || "El usuario ya existe en el sistema"
          });
          return;
        }
        
        if (result?.success && result?.data && Object.keys(result.data).length > 0) {
          setDniBuscado(true);
          setUserAlreadyExists(false);
          
          // Mapear los campos según el formato de respuesta
          // El backend puede devolver campos en español (RENIEC) o en inglés (usuario/padrón)
          const data = result.data;
          const firstName = data.firstName ?? data.nombres ?? '';
          const paternalSurname = data.paternalSurname ?? data.apellidoPaterno ?? '';
          const maternalSurname = data.maternalSurname ?? data.apellidoMaterno ?? '';
          const documentNumber = data.documentNumber ?? data.numeroDocumento ?? formData.documentNumber;
          
          // Actualizar el formulario preservando los campos existentes
          setFormData(prev => ({
            ...prev,
            firstName,
            paternalSurname,
            maternalSurname,
            documentNumber,
          }));
          
          // Mostrar mensaje según la fuente de datos
          Toast.fire({
            icon: "success",
            title: result.message || "Datos encontrados"
          });
        } else {
          setDniBuscado(false);
          
          // Mostrar warning con Toast
          Toast.fire({
            icon: "warning",
            title: result?.message || "No se encontró información con el documento proporcionado"
          });
        }
      }
    } catch (error: any) {
      console.error('Error searching user:', error);
      setDniBuscado(false);
      
      // Extraer mensaje de error de la respuesta del backend
      const errorResponse = error?.response?.data;
      
      // Verificar si el error es porque el usuario ya existe
      if (errorResponse?.code === 'USER_ALREADY_EXISTS' || errorResponse?.canRegister === false) {
        setUserAlreadyExists(true);
        
        // Limpiar los campos del formulario
        setFormData(prev => ({
          ...prev,
          firstName: '',
          paternalSurname: '',
          maternalSurname: '',
        }));
        
        Toast.fire({
          icon: "error",
          title: errorResponse.message || "El usuario ya existe en el sistema"
        });
      } else if (errorResponse?.message) {
        // Mostrar el mensaje de error del backend
        Toast.fire({
          icon: "error",
          title: errorResponse.message
        });
      } else {
        // Error de conexión genérico
        Toast.fire({
          icon: "error",
          title: "Error de conexión - Verifique su internet"
        });
      }
    } finally {
      setBuscandoDNI(false);
    }
  };

  // Cálculos de paginación (ahora vienen del servidor)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers);

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Función para cambiar filtros (resetea a página 1)
  const handleFilterChange = (newBusqueda?: string, newEstado?: string) => {
    if (newBusqueda !== undefined) {
      setBusqueda(newBusqueda);
      // Solo resetear página cuando cambia el término de búsqueda (el debounce se encargará del fetch)
      if (currentPage !== 1) setCurrentPage(1);
    }
    if (newEstado !== undefined) {
      setFiltroEstado(newEstado as 'todos' | 'activo' | 'inactivo');
      setCurrentPage(1);
    }
  };

  const toggleEstadoUsuario = async (userId: number, currentStatus: boolean) => {
    try {
      // Llamar al servicio para cambiar el estado
      await userService.toggleUserStatus(userId, !currentStatus);
      
      // Actualizar el estado local inmediatamente para mejor UX
      setUsuarios(prev => prev.map(u => 
        u.userId === userId ? { ...u, isActive: !currentStatus } : u
      ));
      
      Toast.fire({
        icon: "success",
        title: `Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      Toast.fire({
        icon: "error",
        title: "Error al cambiar estado del usuario"
      });
    }
  };

  function handleChange(event: ChangeEvent) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  // Funciones de validación para cada paso
  const validateStep1 = () => {
    // En modo edición, la contraseña es opcional (solo si se quiere cambiar)
    const passwordValid = isEditMode ? (password.length === 0 || password.length >= 6) : password.length >= 6;
    
    const step1Valid = 
      formData.documentType && 
      formData.documentNumber && 
      formData.firstName && 
      formData.paternalSurname && 
      formData.email && 
      formData.profesionId && 
      formData.gender &&
      passwordValid;
    
    setStepValidation(prev => ({ ...prev, step1: Boolean(step1Valid) }));
    return Boolean(step1Valid);
  };

  const validateStep2 = () => {
    // Verificar que hay al menos un módulo seleccionado
    const hasSelectedModules = selectedModulos.length > 0;
    
    // Verificar permisos para módulos sin submódulos
    const modulosSinSubmodulos = selectedModulos.filter(modId => modulosWithoutSubmodules.includes(modId));
    const hasModuloPermissions = modulosSinSubmodulos.length === 0 || modulosSinSubmodulos.some(modId => {
      const permisos = moduloPermissions[modId];
      return permisos && permisos.length > 0;
    });
    
    // Si hay submódulos seleccionados, verificar que tengan al menos un permiso
    const hasSubmodulePermissions = selectedSubmodulos.length === 0 || selectedSubmodulos.some(subId => {
      const permisos = submoduloPermissions[subId];
      return permisos && permisos.length > 0;
    });
    
    const step2Valid = hasSelectedModules && (hasModuloPermissions || hasSubmodulePermissions);
    setStepValidation(prev => ({ ...prev, step2: step2Valid }));
    return step2Valid;
  };

  const validateStep3 = () => {
    // El paso 3 es solo confirmación, siempre es válido si se llegó aquí
    const step3Valid = true;
    setStepValidation(prev => ({ ...prev, step3: step3Valid }));
    return step3Valid;
  };

  // Navegación entre pasos
  const nextStep = () => {
    let canProceed = false;

    console.log('Validaciones:', stepValidation);
    
    if (currentStep === 1) {
      canProceed = validateStep1();
      if (canProceed) {
        setCompletedSteps(prev => [...prev.filter(s => s !== 1), 1]);
      }
    } else if (currentStep === 2) {
      canProceed = validateStep2();
      if (canProceed) {
        setCompletedSteps(prev => [...prev.filter(s => s !== 2), 2]);
      }
    } else if (currentStep === 3) {
      canProceed = validateStep3();
      if (canProceed) {
        setCompletedSteps(prev => [...prev.filter(s => s !== 3), 3]);
      }
    }

    if (canProceed && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // Solo permitir ir a pasos ya completados o al siguiente paso disponible
    if (step === 1 || completedSteps.includes(step - 1) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  // Funciones para manejar permisos de submódulos
  const handleSubmoduloPermissionChange = (submoduloId: number, permissionId: number, isChecked: boolean) => {
    setSubmoduloPermissions(prev => {
      const currentPermissions = prev[submoduloId] || [];
      
      if (isChecked) {
        // Agregar el permiso si no existe
        return {
          ...prev,
          [submoduloId]: [...currentPermissions, permissionId]
        };
      } else {
        // Remover el permiso
        return {
          ...prev,
          [submoduloId]: currentPermissions.filter(id => id !== permissionId)
        };
      }
    });
  };

  const initializeSubmoduloPermissions = (submoduloId: number) => {
    if (!submoduloPermissions[submoduloId]) {
      // Inicializar con el primer permiso activo (lectura por defecto si existe)
      const lecturaPermiso = permissions.find(p => p.action === 'read' && p.isActive);
      setSubmoduloPermissions(prev => ({
        ...prev,
        [submoduloId]: lecturaPermiso ? [lecturaPermiso.permissionId] : []
      }));
    }
  };

  // Funciones para manejar permisos de módulos sin submódulos
  const handleModuloPermissionChange = (moduloId: number, permissionId: number, isChecked: boolean) => {
    setModuloPermissions(prev => {
      const currentPermissions = prev[moduloId] || [];
      
      if (isChecked) {
        // Agregar el permiso si no existe
        return {
          ...prev,
          [moduloId]: [...currentPermissions, permissionId]
        };
      } else {
        // Remover el permiso
        return {
          ...prev,
          [moduloId]: currentPermissions.filter(id => id !== permissionId)
        };
      }
    });
  };

  const initializeModuloPermissions = (moduloId: number) => {
    if (!moduloPermissions[moduloId]) {
      // Inicializar con el primer permiso activo (lectura por defecto si existe)
      const lecturaPermiso = permissions.find(p => p.action === 'read' && p.isActive);
      setModuloPermissions(prev => ({
        ...prev,
        [moduloId]: lecturaPermiso ? [lecturaPermiso.permissionId] : []
      }));
    }
  };

  // Función para obtener módulos por aplicación y actualizar estado
  const obtenerModulosByApplicationId = async (applicationId: number) => {
    const datos = await accessoriesService.getModulesByApplication(applicationId);
    // Acumular módulos en lugar de reemplazar
    setModules(prev => {
      // Filtrar módulos existentes de la misma aplicación para evitar duplicados
      const modulosOtrasApps = prev.filter(mod => (mod as any).applicationId !== applicationId);
      // Agregar applicationId a los nuevos módulos para poder filtrarlos después
      const modulosConAppId = datos.map(mod => ({ ...mod, applicationId }));
      return [...modulosOtrasApps, ...modulosConAppId];
    });
  };

  // Verificar si un módulo tiene submódulos
  const hasSubmodules = (moduloId: number): boolean => {
    return !modulosWithoutSubmodules.includes(moduloId);
  };

  const handleNuevoUsuario = () => {
    setMostrarFormulario(true);
    setActiveTab('info');
    // Resetear modo edición
    setIsEditMode(false);
    setEditingUserId(null);
    // Resetear sistema de pasos
    setCurrentStep(1);
    setCompletedSteps([]);
    setStepValidation({ step1: false, step2: false, step3: false });
    // Resetear formulario
    setFormData(formDataInitial);
    setPassword('');
    // Resetear estados de búsqueda
    setBuscandoDNI(false);
    setDniBuscado(false);
    setUserAlreadyExists(false);
    // Resetear estados
    setIsCreatingUser(false);
    // Resetear selecciones
    setSelectedPermisos([]); // Sin permisos por defecto
    setSelectedModulos([]); // Sin módulos por defecto
    setSelectedSubmodulos([]); // Sin submódulos por defecto
    setSelectedApplications([]); // Sin aplicaciones por defecto
    setModuloPermissions({}); // Limpiar permisos de módulos
    setSubmoduloPermissions({}); // Limpiar permisos de submódulos
    setModulosWithoutSubmodules([]); // Limpiar estado de módulos sin submódulos
    setModules([]); // Limpiar módulos
    setSubmodules([]); // Limpiar submódulos
  };

  const handleEditarUsuario = async (userId: number) => {
    setLoadingUserData(true);
    setMostrarFormulario(true);
    setIsEditMode(true);
    setEditingUserId(userId);
    setActiveTab('info');
    setCurrentStep(1);
    setCompletedSteps([]);
    setStepValidation({ step1: false, step2: false, step3: false });
    setPassword('');
    
    try {
      const response = await userService.getUserById(userId);
      
      if (response.success && response.data) {
        const userData = response.data;
        
        // Mapear datos del usuario al formulario
        setFormData({
          userId: userData.userId,
          username: userData.username || '',
          firstName: userData.firstName || '',
          paternalSurname: userData.paternalSurname || '',
          maternalSurname: userData.maternalSurname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          documentType: userData.documentType || '',
          documentNumber: userData.documentNumber || '',
          gender: userData.gender || '',
          profesionId: String(userData.profesionId || ''),
          diresa: userData.diresa || '',
          codigoRed: userData.codigoRed || '',
          codigoMicrored: userData.codigoMicrored || '',
          codigoUnico: userData.codigoUnico || '',
          isActive: userData.isActive ?? true,
          role: userData.role || '',
        });
        
        // Cargar microredes y establecimientos si hay valores
        if (userData.codigoRed) {
          await obtenerMicroredes(userData.codigoRed);
        }
        if (userData.codigoRed && userData.codigoMicrored) {
          await obtenerEstablecimientos(userData.codigoMicrored);
        }
        
        // Cargar aplicaciones, módulos y permisos del usuario
        if (userData.applications && userData.applications.length > 0) {
          const appIds: number[] = [];
          const modIds: number[] = [];
          const subIds: number[] = [];
          const modPerms: Record<number, number[]> = {};
          const subPerms: Record<number, number[]> = {};
          
          // Primero recolectar todos los IDs y permisos
          for (const app of userData.applications) {
            appIds.push(app.applicationId);
            
            if (app.modules) {
              for (const mod of app.modules) {
                modIds.push(mod.moduleId);
                
                if (mod.submodules && mod.submodules.length > 0) {
                  for (const sub of mod.submodules) {
                    subIds.push(sub.submoduleId);
                    // Extraer permissionIds del array de objetos permissions
                    if (sub.permissions && Array.isArray(sub.permissions)) {
                      subPerms[sub.submoduleId] = sub.permissions.map((p: any) => p.permissionId);
                    } else if (sub.permissionIds && Array.isArray(sub.permissionIds)) {
                      // Fallback por compatibilidad
                      subPerms[sub.submoduleId] = [...sub.permissionIds];
                    }
                  }
                } else if (mod.permissions && Array.isArray(mod.permissions)) {
                  // Extraer permissionIds del array de objetos permissions
                  modPerms[mod.moduleId] = mod.permissions.map((p: any) => p.permissionId);
                } else if (mod.permissionIds && Array.isArray(mod.permissionIds)) {
                  // Fallback por compatibilidad
                  modPerms[mod.moduleId] = [...mod.permissionIds];
                }
              }
            }
          }
          
          // Luego cargar módulos y submódulos de la API (para mostrar en el formulario)
          for (const app of userData.applications) {
            await obtenerModulosByApplicationId(app.applicationId);
            
            if (app.modules) {
              for (const mod of app.modules) {
                // skipPermissionsInit = true para no sobrescribir los permisos cargados
                await obtenerSubModulosByModuloId(mod.moduleId, true);
              }
            }
          }
          
          // Finalmente establecer los estados (después de cargar los datos de la API)
          setSelectedApplications(appIds);
          setSelectedModulos(modIds);
          setSelectedSubmodulos(subIds);
          setModuloPermissions(modPerms);
          setSubmoduloPermissions(subPerms);
        }
        
        Toast.fire({
          icon: "success",
          title: "Datos del usuario cargados"
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Error al cargar datos del usuario"
        });
        setMostrarFormulario(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Toast.fire({
        icon: "error",
        title: "Error de conexión al cargar usuario"
      });
      setMostrarFormulario(false);
    } finally {
      setLoadingUserData(false);
    }
  };

  const handleGuardarUsuario = async () => {
    setIsCreatingUser(true);

    try {
      // Construir la estructura de aplicaciones según el formato requerido por el endpoint
      const applicationsStructure = selectedApplications.map(appId => {
        // Obtener los módulos de esta aplicación que están seleccionados
        const appModules = modules
          .filter(mod => (mod as any).applicationId === appId && selectedModulos.includes(mod.moduleId))
          .map(modulo => {
            // Verificar si el módulo tiene submódulos
            const tieneSubmodulos = !modulosWithoutSubmodules.includes(modulo.moduleId);
            
            if (tieneSubmodulos) {
              // Obtener los submódulos de este módulo que están seleccionados
              const moduleSubmodules = submodules
                .filter(sub => sub.moduleId === modulo.moduleId && selectedSubmodulos.includes(sub.submoduleId))
                .map(submodulo => {
                  // Obtener los permissionIds del submódulo (ya es un array de números)
                  const permissionIds = submoduloPermissions[submodulo.submoduleId] || [1]; // Lectura por defecto
                  
                  return {
                    submoduleId: submodulo.submoduleId,
                    permissionIds
                  };
                });

              return {
                moduleId: modulo.moduleId,
                submodules: moduleSubmodules
              };
            } else {
              // El módulo no tiene submódulos, usar permisos del módulo directamente
              const permissionIds = moduloPermissions[modulo.moduleId] || [1]; // Lectura por defecto

              return {
                moduleId: modulo.moduleId,
                permissionIds // Permisos directos del módulo
              };
            }
          });

        return {
          applicationId: appId,
          modules: appModules
        };
      });

      // Construir el objeto de usuario con el formato requerido
      const userData: CreateUserData = {
        email: formData.email,
        username: formData.username || formData.documentNumber, // Usar DNI como username si no hay username
        firstName: formData.firstName,
        paternalSurname: formData.paternalSurname,
        maternalSurname: formData.maternalSurname,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        gender: formData.gender,
        profesionId: formData.profesionId,
        diresa: formData.diresa || 'Ucayali',
        isActive: formData.isActive === true || formData.isActive === 'true' as unknown as boolean,
        applications: applicationsStructure,
        // Campos opcionales - solo incluir si tienen valor
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.codigoRed && { codigoRed: formData.codigoRed }),
        ...(formData.codigoMicrored && { codigoMicrored: formData.codigoMicrored }),
        ...(formData.codigoUnico && { codigoUnico: formData.codigoUnico })
      };

      if (isEditMode && editingUserId) {
        // Actualizar usuario existente
        const updateData = {
          email: formData.email,
          username: formData.username || formData.documentNumber,
          firstName: formData.firstName,
          paternalSurname: formData.paternalSurname,
          maternalSurname: formData.maternalSurname,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          gender: formData.gender,
          profesionId: String(formData.profesionId),
          diresa: formData.diresa || 'Ucayali',
          isActive: formData.isActive === true || formData.isActive === 'true' as unknown as boolean,
          applications: applicationsStructure,
          ...(formData.phone && { phone: formData.phone }),
          ...(formData.codigoRed && { codigoRed: formData.codigoRed }),
          ...(formData.codigoMicrored && { codigoMicrored: formData.codigoMicrored }),
          ...(formData.codigoUnico && { codigoUnico: formData.codigoUnico }),
          ...(password && { password }) // Solo enviar password si se ingresó uno nuevo
        };
        
        await userService.updateUser(editingUserId, updateData);
        
        Toast.fire({
          icon: "success",
          title: "Usuario actualizado exitosamente"
        });
        
        setMostrarFormulario(false);
        fetchUsuarios();
      } else {
        // Crear nuevo usuario
        const result = await userService.createUser(userData, password);
        
        if (result && result.success) {
          Toast.fire({
            icon: "success",
            title: "Usuario creado exitosamente"
          });
          
          setMostrarFormulario(false);
          fetchUsuarios();
        } else {
          const errorMsg = result?.message || 'Error al crear usuario';
          
          Toast.fire({
            icon: "error",
            title: errorMsg
          });
        }
      }
    } catch (error) {
      // Manejar errores de red o errores inesperados
      console.error('Error creating user:', error);
      
      Toast.fire({
        icon: "error",
        title: "Error de conexión con el servidor"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Administra los usuarios del sistema y sus permisos
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar usuarios
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                name="search-users-list"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => handleFilterChange(e.target.value, undefined)}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => handleFilterChange(undefined, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleNuevoUsuario}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando usuarios...
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {usuario.profileImage ? (
                            <img 
                              src={usuario.profileImage} 
                              alt="" 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {(usuario.firstName?.charAt(0) || '') + (usuario.paternalSurname?.charAt(0) || '')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {`${usuario.firstName || ''} ${usuario.paternalSurname || ''} ${usuario.maternalSurname || ''}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {usuario.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {usuario.documentType || ''} 
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {usuario.documentNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usuario.isActive || false}
                          onChange={() => toggleEstadoUsuario(usuario.userId, usuario.isActive || false)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer peer-focus:ring-4 transition-colors duration-200 ease-in-out after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white ${
                          usuario.isActive
                            ? 'bg-green-500 peer-focus:ring-green-300 dark:peer-focus:ring-green-800'
                            : 'bg-red-400 peer-focus:ring-red-300 dark:peer-focus:ring-red-800'
                        }`}></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditarUsuario(usuario.userId)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-md transition-colors"
                          title="Editar usuario"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* <button 
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-md transition-colors"
                          title="Eliminar usuario"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && usuarios.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron usuarios</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {!loading && totalUsers > 0 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando{' '}
                <span className="font-medium">{startIndex + 1}</span>
                {' '}a{' '}
                <span className="font-medium">{Math.min(endIndex, totalUsers)}</span>
                {' '}de{' '}
                <span className="font-medium">{totalUsers}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                      : 'text-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Números de página */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const showPage = pageNumber === 1 || 
                                 pageNumber === totalPages || 
                                 (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                  
                  if (!showPage) {
                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-400'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                      : 'text-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nuevo usuario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Header del modal - siempre visible */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? 'Editar Usuario' : 'Registro de Usuario'}
                </h2>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Steps Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {/* Step 1 */}
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      completedSteps.includes(1) 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : currentStep === 1 
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-gray-200 border-gray-300 text-gray-600 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300'
                    }`}>
                      {completedSteps.includes(1) ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">1</span>
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      currentStep === 1 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      Información
                    </span>
                  </div>

                  {/* Progress Line 1-2 */}
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    completedSteps.includes(1) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`} />

                  {/* Step 2 */}
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      completedSteps.includes(2) 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : currentStep === 2 
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : completedSteps.includes(1) || currentStep > 1
                            ? 'bg-blue-500 border-blue-500 text-white cursor-pointer'
                            : 'bg-gray-200 border-gray-300 text-gray-400 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400'
                    }`}
                    onClick={() => (completedSteps.includes(1) || currentStep > 1) && goToStep(2)}
                    >
                      {completedSteps.includes(2) ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">2</span>
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      currentStep === 2 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      Módulos y Roles
                    </span>
                  </div>

                  {/* Progress Line 2-3 */}
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    completedSteps.includes(2) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`} />

                  {/* Step 3 */}
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      completedSteps.includes(3) 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : currentStep === 3 
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : completedSteps.includes(2) || currentStep > 2
                            ? 'bg-blue-500 border-blue-500 text-white cursor-pointer'
                            : 'bg-gray-200 border-gray-300 text-gray-400 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-400'
                    }`}
                    onClick={() => (completedSteps.includes(2) || currentStep > 2) && goToStep(3)}
                    >
                      {completedSteps.includes(3) ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">3</span>
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      currentStep === 3 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      Confirmación
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del formulario - con scroll */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Loading overlay cuando se cargan datos del usuario */}
              {loadingUserData && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300">Cargando datos del usuario...</p>
                  </div>
                </div>
              )}

              {/* Contenido del formulario por pasos */}
              {!loadingUserData && currentStep === 1 && (
                <div className="space-y-6">
                  {/* Sección de Identificación */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Datos de Identificación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Tipo de Documento */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tipo de Documento *
                        </label>
                        <select
                          name="documentType"
                          value={formData.documentType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        >
                          <option value="">---</option>
                          {
                            documentTypes().map((docType) => (
                              <option key={docType.id} value={docType.name}>
                                {docType.name}
                              </option>
                            ))  
                          }
                        </select>
                      </div>
                      
                      {/* Número de Documento con Botón de Búsqueda */}
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Número de Documento *
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            name="documentNumber"
                            value={formData.documentNumber}
                            onChange={(e) => {
                              handleChange(e);
                              setDniBuscado(false);
                              setUserAlreadyExists(false);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            placeholder={formData.documentType === 'DNI' ? '12345678' : formData.documentType === 'CE' ? '001234567' : 'A12345678'}
                            maxLength={formData.documentType === 'DNI' ? 8 : formData.documentType === 'CE' ? 9 : 12}
                            pattern={formData.documentType === 'DNI' ? '[0-9]{8}' : '.*'}
                            required
                          />
                          {formData.documentType === 'DNI' && (
                            <button
                              type="button"
                              onClick={searchUser}
                              disabled={buscandoDNI || formData.documentNumber.length !== 8}
                              className="px-4 py-2 bg-blue-500 text-white border border-l-0 border-blue-500 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                              title="Buscar datos en RENIEC"
                            >
                              {buscandoDNI ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                        {dniBuscado && (
                          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                            ✓ Datos autocompletados desde RENIEC
                          </p>
                        )}
                      </div>

                      {/* Acceso */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Acceso *
                        </label>
                        <select
                          name='isActive'
                          value={formData.isActive ? 'true' : 'false'}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        >
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Datos Personales */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Datos Personales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombres *
                        </label>
                        <input
                          type="text"
                          name='firstName'
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="Nombres"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Apellido Paterno *
                        </label>
                        <input
                          type="text"
                          name='paternalSurname'
                          value={formData.paternalSurname}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="Apellido Paterno"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Apellido Materno
                        </label>
                        <input
                          type="text"
                          name='maternalSurname'
                          value={formData.maternalSurname}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="Apellido Materno"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Género *
                        </label>
                        <select
                          name='gender'
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        >
                          <option value="">---</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name='phone'
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="+51987654321"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name='email'
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="new-password"
                          data-form-type="other"
                          data-lpignore="true"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="usuario@salud.gob.pe"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Profesión *
                        </label>
                        <select
                          name='profesionId'
                          value={formData.profesionId}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        >
                          <option value="">Seleccione una profesión</option>
                          {profesiones.map((profesion) => (
                            <option key={profesion.profession_id} value={String(profesion.profession_id)}>
                              {profesion.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Datos de Contacto */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Datos del Usuario
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          RED
                        </label>
                        <select
                          name='codigoRed'
                          value={formData.codigoRed}
                          onChange={(e) => {handleChange(e); obtenerMicroredes(e.target.value);}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        >
                          <option value="">---</option>
                          {
                            redes.map((red) => (
                              <option key={red.codigo_red} value={red.codigo_red}>
                                {red.nom_red}
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          MICRORED
                        </label>
                        <select
                          name='codigoMicrored'
                          value={formData.codigoMicrored}
                          onChange={(e) => {handleChange(e); obtenerEstablecimientos(e.target.value);}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        >
                          <option value="">---</option>
                          {
                            microredes?.map((microred) => (
                              <option key={Number(microred.codigo_microred)} value={microred.codigo_microred}>
                                {microred.nom_microred}
                              </option>
                            ))  
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Establecimiento
                        </label>
                        <select
                          name='codigoUnico'
                          value={formData.codigoUnico}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        >
                          <option value="">---</option>
                          {
                            establecimientos.map((est) => (
                              <option key={est.codigo_unico} value={est.codigo_unico}>
                                {est.codigo_unico} - {est.nombre_establecimiento}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Usuario *
                        </label>
                        <input
                          type="text"
                          name='username'
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contraseña {isEditMode ? '' : '*'}
                        </label>
                        <input
                          type="password"
                          name='new-password-field'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          data-form-type="other"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder={isEditMode ? 'Dejar vacío para mantener la actual' : 'Ingrese la contraseña'}
                          required={!isEditMode}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Roles y Módulos */}
              {!loadingUserData && currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* Selección de Aplicaciones */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Aplicaciones y Módulos de Acceso
                        </h3>
                        <div className="space-x-2">
                          <button
                            onClick={() => {
                              // Seleccionar todas las aplicaciones activas
                              const activeApps = applications.filter(a => a.isActive === true).map(a => a.applicationId);
                              setSelectedApplications(activeApps);
                              // Obtener módulos de todas las aplicaciones
                              console.log('Aplicaciones activas seleccionadas:', activeApps);
                              activeApps.forEach(appId => obtenerModulosByApplicationId(appId));
                            }}
                            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          >
                            Seleccionar Todos
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplications([]);
                              setSelectedModulos([]);
                              setSelectedSubmodulos([]);
                              setModuloPermissions({});
                              setSubmoduloPermissions({});
                            }}
                            className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Limpiar Todo
                          </button>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
                          {/* Lista de Aplicaciones */}
                          {applications.filter(app => app.isActive === true).map((application) => (
                            <div
                              key={application.applicationId}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
                            >
                              {/* Header de Aplicación */}
                              <div className="p-3 flex items-start">
                                <input
                                  type="checkbox"
                                  id={`app-${application.applicationId}`}
                                  checked={selectedApplications.includes(application.applicationId)}
                                  onChange={(e) => {
                                    console.log('Aplicación seleccionada:', application.applicationId);
                                    
                                    if (e.target.checked) {
                                      setSelectedApplications(prev => [...prev, application.applicationId]);
                                      // Obtener módulos de la aplicación
                                      obtenerModulosByApplicationId(application.applicationId);
                                    } else {
                                      setSelectedApplications(prev => prev.filter(id => id !== application.applicationId));
                                      // Deseleccionar módulos de esta aplicación
                                      const modulosDeApp = modules
                                        .filter(mod => (mod as any).applicationId === application.applicationId)
                                        .map(mod => mod.moduleId);
                                      setSelectedModulos(prev => prev.filter(id => !modulosDeApp.includes(id)));
                                      // Limpiar submódulos y permisos relacionados
                                      modulosDeApp.forEach(modId => {
                                        const submodulosDelModulo = submodules
                                          .filter(sub => sub.moduleId === modId)
                                          .map(sub => sub.submoduleId);
                                        setSelectedSubmodulos(prev => prev.filter(id => !submodulosDelModulo.includes(id)));
                                        setSubmoduloPermissions(prev => {
                                          const newPermissions = { ...prev };
                                          submodulosDelModulo.forEach(subId => {
                                            delete newPermissions[subId];
                                          });
                                          return newPermissions;
                                        });
                                        // Limpiar permisos del módulo
                                        setModuloPermissions(prev => {
                                          const newPermissions = { ...prev };
                                          delete newPermissions[modId];
                                          return newPermissions;
                                        });
                                      });
                                    }
                                  }}
                                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                                />
                                <div className="ml-3 flex-1">
                                  <label htmlFor={`app-${application.applicationId}`} className="cursor-pointer">
                                    <div className="text-base font-semibold text-indigo-700 dark:text-indigo-400">{application.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{application.description}</div>
                                  </label>
                                </div>
                              </div>

                              {/* Lista de Módulos de la Aplicación */}
                              {selectedApplications.includes(application.applicationId) && (
                                <div className="px-3 pb-3">
                                  <div className="ml-6 space-y-2">
                                    {modules
                                      .filter(mod => (mod as any).applicationId === application.applicationId && mod.isActive === true)
                                      .map((modulo) => (
                                        <div
                                          key={modulo.moduleId}
                                          className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                        >
                                          {/* Header del Módulo */}
                                          <div className="flex items-start">
                                            <input
                                              type="checkbox"
                                              id={`modulo-${modulo.moduleId}`}
                                              checked={selectedModulos.includes(modulo.moduleId)}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setSelectedModulos(prev => [...prev, modulo.moduleId]);
                                                  obtenerSubModulosByModuloId(modulo.moduleId);
                                                } else {
                                                  setSelectedModulos(prev => prev.filter(id => id !== modulo.moduleId));
                                                  // Limpiar submódulos relacionados
                                                  const submodulosDelModulo = submodules
                                                    .filter(sub => sub.moduleId === modulo.moduleId)
                                                    .map(sub => sub.submoduleId);
                                                  setSelectedSubmodulos(prev => prev.filter(id => !submodulosDelModulo.includes(id)));
                                                  // Limpiar permisos de submódulos
                                                  setSubmoduloPermissions(prev => {
                                                    const newPermissions = { ...prev };
                                                    submodulosDelModulo.forEach(subId => {
                                                      delete newPermissions[subId];
                                                    });
                                                    return newPermissions;
                                                  });
                                                  // Limpiar permisos del módulo
                                                  setModuloPermissions(prev => {
                                                    const newPermissions = { ...prev };
                                                    delete newPermissions[modulo.moduleId];
                                                    return newPermissions;
                                                  });
                                                }
                                              }}
                                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                            />
                                            <div className="ml-3 flex-1">
                                              <label htmlFor={`modulo-${modulo.moduleId}`} className="cursor-pointer">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{modulo.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{modulo.description}</div>
                                              </label>

                                              {/* Si el módulo está seleccionado y NO tiene submódulos, mostrar permisos directamente */}
                                              {selectedModulos.includes(modulo.moduleId) && !hasSubmodules(modulo.moduleId) && (
                                                <div className="mt-3 ml-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                    Permisos del módulo:
                                                  </div>
                                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {permissions.filter(p => p.isActive).map((permiso) => (
                                                      <div key={permiso.permissionId} className="flex items-center">
                                                        <input
                                                          type="checkbox"
                                                          id={`mod-${permiso.permissionId}-${modulo.moduleId}`}
                                                          checked={moduloPermissions[modulo.moduleId]?.includes(permiso.permissionId) || false}
                                                          onChange={(e) => handleModuloPermissionChange(modulo.moduleId, permiso.permissionId, e.target.checked)}
                                                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label 
                                                          htmlFor={`mod-${permiso.permissionId}-${modulo.moduleId}`} 
                                                          className="ml-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
                                                          title={permiso.description}
                                                        >
                                                          {permiso.name}
                                                        </label>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Submódulos (solo si el módulo tiene submódulos) */}
                                              {selectedModulos.includes(modulo.moduleId) && hasSubmodules(modulo.moduleId) && (
                                                <div className="mt-3 ml-4 space-y-3">
                                                  {submodules
                                                    .filter(sub => sub.moduleId === modulo.moduleId && sub.isActive === true)
                                                    .map((submodulo) => (
                                                      <div key={submodulo.submoduleId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                                                        {/* Header del submódulo */}
                                                        <div className="flex items-center mb-2">
                                                          <input
                                                            type="checkbox"
                                                            id={`submodulo-${submodulo.submoduleId}`}
                                                            checked={selectedSubmodulos.includes(submodulo.submoduleId)}
                                                            onChange={(e) => {
                                                              if (e.target.checked) {
                                                                setSelectedSubmodulos(prev => [...prev, submodulo.submoduleId]);
                                                                initializeSubmoduloPermissions(submodulo.submoduleId);
                                                              } else {
                                                                setSelectedSubmodulos(prev => prev.filter(id => id !== submodulo.submoduleId));
                                                                setSubmoduloPermissions(prev => {
                                                                  const newPermissions = { ...prev };
                                                                  delete newPermissions[submodulo.submoduleId];
                                                                  return newPermissions;
                                                                });
                                                              }
                                                            }}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                          />
                                                          <label 
                                                            htmlFor={`submodulo-${submodulo.submoduleId}`} 
                                                            className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                                          >
                                                            {submodulo.name}
                                                          </label>
                                                        </div>

                                                        {/* Permisos específicos del submódulo */}
                                                        {selectedSubmodulos.includes(submodulo.submoduleId) && (
                                                          <div className="ml-6 space-y-2">
                                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                              Permisos específicos:
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                              {permissions.filter(p => p.isActive).map((permiso) => (
                                                                <div key={permiso.permissionId} className="flex items-center">
                                                                  <input
                                                                    type="checkbox"
                                                                    id={`sub-${permiso.permissionId}-${submodulo.submoduleId}`}
                                                                    checked={submoduloPermissions[submodulo.submoduleId]?.includes(permiso.permissionId) || false}
                                                                    onChange={(e) => handleSubmoduloPermissionChange(submodulo.submoduleId, permiso.permissionId, e.target.checked)}
                                                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                  />
                                                                  <label 
                                                                    htmlFor={`sub-${permiso.permissionId}-${submodulo.submoduleId}`} 
                                                                    className="ml-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
                                                                    title={permiso.description}
                                                                  >
                                                                    {permiso.name}
                                                                  </label>
                                                                </div>
                                                              ))}
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab de Permisos Específicos */}
              {!loadingUserData && activeTab === 'permisos' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Permisos Específicos del Sistema
                    </h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => setSelectedPermisos(permissions.filter(p => p.isActive).map(p => p.permissionId))}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setSelectedPermisos([])}
                        className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Ninguno
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.filter(p => p.isActive).map((permiso) => (
                      <div
                        key={permiso.permissionId}
                        className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          id={`permiso-${permiso.permissionId}`}
                          checked={selectedPermisos.includes(permiso.permissionId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermisos(prev => [...prev, permiso.permissionId]);
                            } else {
                              setSelectedPermisos(prev => prev.filter(id => id !== permiso.permissionId));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <label htmlFor={`permiso-${permiso.permissionId}`} className="cursor-pointer">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{permiso.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {permiso.description} - {permiso.action}
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paso 3: Confirmación */}
              {!loadingUserData && currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Confirmación de Datos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Información Personal */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Información Personal</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Tipo de documento:</span> {formData.documentType}</p>
                          <p><span className="font-medium">Número:</span> {formData.documentNumber}</p>
                          <p><span className="font-medium">Nombre:</span> {formData.firstName} {formData.paternalSurname} {formData.maternalSurname}</p>
                          <p><span className="font-medium">Email:</span> {formData.email}</p>
                          <p><span className="font-medium">Teléfono:</span> {formData.phone || 'No especificado'}</p>
                          <p><span className="font-medium">Género:</span> {formData.gender === 'M' ? 'Masculino' : 'Femenino'}</p>
                        </div>
                      </div>

                      {/* Información del Sistema */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Configuración del Sistema</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Usuario:</span> {formData.username}</p>
                          <p><span className="font-medium">Estado:</span> {formData.isActive ? 'Activo' : 'Inactivo'}</p>
                          <p><span className="font-medium">Aplicaciones asignadas:</span> {selectedApplications.length} aplicaciones</p>
                          <p><span className="font-medium">Módulos asignados:</span> {selectedModulos.length} módulos</p>
                          <p><span className="font-medium">Submódulos asignados:</span> {selectedSubmodulos.length} submódulos</p>
                        </div>
                      </div>
                    </div>

                    {/* Resumen de aplicaciones y módulos */}
                    <div className="mt-6 space-y-4">
                      {/* Aplicaciones Seleccionadas */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Aplicaciones Seleccionadas</h4>
                        <div className="space-y-1">
                          {selectedApplications.map(appId => {
                            const app = applications.find(a => a.applicationId === appId);
                            return app ? (
                              <span key={appId} className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded mr-2 mb-1">
                                {app.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* Módulos Seleccionados */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Módulos Seleccionados</h4>
                        <div className="space-y-1">
                          {selectedModulos.map(moduloId => {
                            const modulo = modules.find(m => m.moduleId === moduloId);
                            return modulo ? (
                              <span key={moduloId} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mr-2 mb-1">
                                {modulo.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* SubMódulos Seleccionados */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">SubMódulos Seleccionados</h4>
                        <div className="space-y-1">
                          {selectedSubmodulos.map(subModuloId => {
                            const subModulo = submodules.find(sm => sm.submoduleId === subModuloId);
                            return subModulo ? (
                              <span key={subModuloId} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mr-2 mb-1">
                                {subModulo.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Términos y condiciones */}
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 mr-3"
                        onChange={(e) => setStepValidation(prev => ({ ...prev, step3: e.target.checked }))}
                      />
                      <label htmlFor="terms" className="text-sm text-blue-800 dark:text-blue-200">
                        Confirmo que todos los datos ingresados son correctos y autorizo la creación de este usuario en el sistema con los permisos seleccionados.
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer con botones de navegación - siempre visible */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-between">
                <div>
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Anterior
                    </button>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setMostrarFormulario(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  
                  {currentStep < 3 ? (
                    <button
                      onClick={nextStep}
                      disabled={currentStep === 1 && userAlreadyExists}
                      className={`px-6 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center ${
                        currentStep === 1 && userAlreadyExists
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      Continuar
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleGuardarUsuario}
                      disabled={!stepValidation.step3 || isCreatingUser}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isCreatingUser ? (
                        <>
                          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEditMode ? 'Actualizando...' : 'Creando Usuario...'}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}