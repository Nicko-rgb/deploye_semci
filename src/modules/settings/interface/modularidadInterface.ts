export interface Application {
  applicationId: number;
  code: string;
  name: string;
  description?: string;
  url?: string;
  icon?: string;
  color?: string;
  orderIndex?: number;
  isActive: boolean;
}

export interface datosApplication {
  data: Application;
  success: boolean;
  message: string;
}

export interface CreateApplicationData {
  code: string;
  name: string;
  description?: string;
  url?: string;
  icon?: string;
  color?: string;
  orderIndex?: number;
  isActive: boolean;
}

export interface Module {
  moduleId: number;
  name: string;
  description?: string;
  route?: string;
  icon?: string;
  color?: string;
  orderIndex?:number;
  secondary?: boolean;
  applicationId: number;
  isActive: boolean;
  application?: Application;
}

export interface datosModule {
  data: Module;
  success: boolean;
  message: string;
}

export interface datosModules {
  data: Module[];
  success: boolean;
  message: string;
}

export interface CreateUpdateModuleData {
  name: string;
  description?: string;
  route?: string;
  icon?: string;
  color?: string;
  orderIndex?: number;
  secondary?: boolean;
  applicationId: number;
  isActive: boolean;
}

export interface SubModule {
  submoduleId: number;
  moduleId: number;
  name: string;
  description?: string;
  route?: string;
  icon?: string;
  color?: string;
  orderIndex?:number;
  isActive: boolean;
  module?: Module;
}

export interface datosSubModule {
  data: SubModule;
  success: boolean;
  message: string;
}

export interface CreateUpdateSubModuleData {
  name: string;
  description?: string;
  route?: string;
  icon?: string;
  color?: string;
  orderIndex?: number;
  moduleId: number;
  isActive: boolean;
}

export interface Permission {
  permissionId: number;
  name: string;
  description?: string;
  action?: string;
  isActive?: boolean;
}

export interface datosPermission {
  data: Permission;
  success: boolean;
  message: string;
}

export interface CreateUpdatePermissionData {
  name: string;
  description?: string;
  action?: string;
  isActive?: boolean;
}