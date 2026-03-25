import { apiService } from '../../../core/services/apiService';
import { authService } from '../../../core/services/authService';

// Interfaces para el perfil de usuario
export interface User {
  userId: number;
  username: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  gender: string;
  profesionId: string;
  diresa: string;
  codigoRed?: string;
  codigoMicrored?: string;
  codigoUnico?: string;
  isActive?: boolean;
  role?: string;
  color?: string;
  profileImage?: string;
  createdAt?: string;
}

export interface UserProps {
  userId: number;
  username: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
  phone?: string;
  documentType: string;
  documentNumber: string;
  gender: string;
  profesionId: number;
  diresa: string;
  codigoRed?: string;
  codigoMicrored?: string;
  codigoUnico?: string;
  isActive?: boolean;
  role?: string;
  color?: string;
  profileImage?: string;
  applications?: UserApplicationPermission[];
  createdAt?: string;
}

export interface PersonProps {
  // Campos en formato del sistema
  firstName?: string;
  paternalSurname?: string;
  maternalSurname?: string;
  documentNumber?: string;
  // Campos de RENIEC (en español)
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  numeroDocumento?: string;
  nombre?: string; // Nombre completo de RENIEC
}

// Interfaces para la estructura de permisos de aplicaciones
export interface UserPermissionDetail {
  permissionId: number;
  name: string;
  description?: string;
  action: string;
}

export interface UserSubmodulePermission {
  submoduleId: number;
  permissionIds?: number[];
  permissions?: UserPermissionDetail[]; // Viene de la API al obtener usuario
}

export interface UserModulePermission {
  moduleId: number;
  submodules?: UserSubmodulePermission[];
  permissionIds?: number[]; // Para módulos sin submódulos
  permissions?: UserPermissionDetail[]; // Viene de la API al obtener usuario
}

export interface UserApplicationPermission {
  applicationId: number;
  modules: UserModulePermission[];
}

// Interface para crear usuario
export interface CreateUserData {
  email: string;
  username: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  documentType: string;
  documentNumber: string;
  gender: string;
  isActive: boolean;
  profesionId: string;
  diresa: string;
  applications: UserApplicationPermission[];
  phone?: string;
  codigoRed?: string;
  codigoMicrored?: string;
  codigoUnico?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
  department: string;
  dateOfBirth: string;
  address: string;
  city: string;
}

// Interface para actualizar usuario (para administradores)
export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  paternalSurname?: string;
  maternalSurname?: string;
  documentType?: string;
  documentNumber?: string;
  gender?: string;
  profesionId?: string;
  diresa?: string;
  isActive?: boolean;
  applications?: UserApplicationPermission[];
  phone?: string;
  codigoRed?: string;
  codigoMicrored?: string;
  codigoUnico?: string;
  password?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface datosUsers {
  data: UserProps;
  success: boolean;
  message: string;
}

interface datosPersonUser {
  data: PersonProps;
  success: boolean;
  message: string;
  code?: string; // Código de error (ej: USER_ALREADY_EXISTS)
  canRegister?: boolean; // Indica si se puede registrar el usuario
}

export interface UserSubmodule {
  id: number;
  name: string;
  description: string;
}

export interface UserModule {
  id: number;
  name: string;
  description: string;
  submodules: UserSubmodule[];
}

export interface UserModulesResponse {
  success: boolean;
  message: string;
  data: UserProps;
}

class UserService {
  // Actualizar perfil del usuario
  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProps> {
    return await apiService.put<UserProps>('/users/profile', profileData);
  }

  // Subir foto de perfil
  async uploadProfilePhoto(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ profilePhoto: string }> {
    return await apiService.uploadFile<{ profilePhoto: string }>(
      '/user/profile/photo',
      file,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    );
  }

  // Cambiar contraseña (usando authService)
  async changePassword(passwords: ChangePasswordRequest): Promise<boolean> {
    return await authService.changePassword(passwords.currentPassword, passwords.newPassword);
  }

  // Obtener lista de usuarios
  async getUsers(page = 1, limit = 10, search?: string, isActive?: boolean): Promise<{
    success: boolean;
    message: string;
    data: UserProps[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(isActive !== undefined && { isActive: isActive.toString() })
    });

    return await apiService.get<{
      success: boolean;
      message: string;
      data: UserProps[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/settings/auth/users?${params}`);
  }

  // Crear nuevo usuario (para administradores)
  async createUser(userData: CreateUserData, password: string): Promise<datosUsers> {
    const response: datosUsers = await apiService.post<datosUsers>('/settings/auth/register', { ...userData, password });
    return response;
  }

  // Actualizar usuario (para administradores)
  async updateUser(userId: number, userData: UpdateUserData): Promise<datosUsers> {
    return await apiService.put<datosUsers>(`/settings/auth/users/${userId}`, userData);
  }

  // Eliminar usuario (para administradores)
  async deleteUser(userId: number): Promise<void> {
    await apiService.delete(`/settings/auth/users/${userId}`);
  }

  // Desactivar/activar usuario
  async toggleUserStatus(userId: number, isActive: boolean): Promise<datosUsers> {
    return await apiService.patch<datosUsers>(`/settings/auth/users/${userId}/status`, { isActive });
  }

  // Obtener modulos y permisos del usuario
  async getUserById(userId: number): Promise<datosUsers> {
    return await apiService.get<datosUsers>(`/settings/auth/users/${userId}`);
  }

  async getUserByDocument(documentType: string, documentNumber: string): Promise<datosPersonUser | null> {
    return await apiService.get<datosPersonUser>(`/settings/auth/users/document?documentType=${documentType}&documentNumber=${documentNumber}`);
  }
}

export const userService = new UserService();
