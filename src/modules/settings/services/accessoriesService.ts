import { apiService } from '../../../core/services/apiService';
//import { authService } from './authService';

export interface microredes {
    codigo_red: string;
    codigo_microred: string;
    nom_microred: string;
}

export interface establecimientos {
  codigo_red: string;
  codigo_microred: string;
  id_establecimiento: number;
  codigo_unico: string;
  nombre_establecimiento: string;
}

export interface Module {
  moduleId: number;
  name: string;
  description: string;
  orderIndex: number;
  secondary: boolean;
  isActive: boolean;
}

export interface SubModule {
  submoduleId: number;
  moduleId: number;
  name: string;
  description: string;
  orderIndex: number;
  isActive: boolean;
}

export interface Permission {
  permissionId: number;
  name: string;
  description: string;
  action: string;
  isActive: boolean;
}

interface datosRedes {
  data: any[];
  success: boolean;
  message: string;
}

interface datosMicroredes {
  data: microredes[];
  success: boolean;
  message: string;
}

interface datosEstablecimientos {
  data: establecimientos[];
  success: boolean;
  message: string;
}

interface datosModules {
  data: Module[];
  success: boolean;
  message: string;
}

interface datosSubModules {
  data: SubModule[];
  success: boolean;
  message: string;
}

interface datosPermissions {
  data: Permission[];
  success: boolean;
  message: string;
}

class AccessoriesService {
  // Obtener redes
  async getRedesByCodigoDisa(codigo_disa: string = '34'): Promise<any[]> {
    const response: datosRedes = await apiService.get(`/settings/red/codigo-disa/${codigo_disa}`);
    return response.data;
  }

  // Obtener microredes
  async getMicroredesByCodigoRed(codigo_red: string, codigo_disa: string = '34'): Promise<microredes[]> {
    const response: datosMicroredes  = await apiService.get(`/settings/microred/codigo-disa-red/${codigo_disa}/${codigo_red}`);
    return response.data;
  }

  // Obtener establecimientos por microred
  async getEstablecimientosByCodigoRedMicroRed(codigo_red: string, codigo_microred: string, codigo_disa: string = '34'): Promise<establecimientos[]> {
    const response: datosEstablecimientos = await apiService.get(`/settings/establecimiento?codigo_disa=${codigo_disa}&codigo_red=${codigo_red}&codigo_microred=${codigo_microred}`);
    return response.data;
  }

  async getMicroredesByNombreRed(nombre_red: string): Promise<microredes[]> {
    const response: datosMicroredes  = await apiService.get(`/establecimientos/microredes/nombre/${nombre_red}`);
    return response.data;
  }

  async getEstablecimientosByNombreRedMicroRed(nombre_red: string, nombre_microred: string): Promise<establecimientos[]> {
    const response: datosEstablecimientos = await apiService.get(`/establecimientos/establecimiento/nombre/${nombre_red}/${nombre_microred}`);
    return response.data;
  }

  async getApplications(): Promise<Module[]> {
    const response: datosModules = await apiService.get(`/settings/application`);
    return response.data;
  }

  async getModulesByApplication(applicationId: number): Promise<Module[]> {
    const response: datosModules = await apiService.get(`/settings/modules/application/${applicationId}`);
    return response.data;
  }

  async getSubModulesByModule(moduleId: number): Promise<SubModule[]> {
    const response: datosSubModules = await apiService.get(`settings/submodules/module/${moduleId}`);
    return response.data;
  }

  async getPermission(): Promise<Permission[]> {
    const response: datosPermissions = await apiService.get(`/settings/permissions`);
    return response.data;
  }
}

export const accessoriesService = new AccessoriesService();