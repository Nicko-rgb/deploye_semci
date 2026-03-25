import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColorPicker } from '../../modules/settings/components/ColorPicker';
import { Avatar } from '../components/Avatar';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import type { ProfessionItem } from '../../modules/recursos-humanos';
import { commonService } from '../../modules/recursos-humanos/services/commonService';
import { authService } from '../services/authService';
import type { User } from '../../modules/settings/services/userService';
import { notify } from '../utils/Notify';

const UserProfile: User = {
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
  isActive: false,
  role: '',
  profileImage: '',
  createdAt: ''
}

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const blobUrlRef = React.useRef<string>('');
  const originalProfileRef = React.useRef<User>(UserProfile);
  
  // Estado único del perfil (normalmente vendría de una API)
  const [profile, setProfile] = React.useState<User>(UserProfile);

  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPasswordSection, setShowPasswordSection] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordErrors, setPasswordErrors] = React.useState<{[key: string]: string}>({});
  const [profesiones, setProfesiones] = React.useState<ProfessionItem[]>([]);
  const [profileImageBase64, setProfileImageBase64] = React.useState<string>('');

  React.useEffect(() => {
      obtenerProfesiones();
    }, []);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const result = await authService.getCurrentProfile();
      if (result && result.success) {
        setProfile(result.data);
        originalProfileRef.current = result.data;
      }
    };
    fetchProfile();
  }, []);

  // Limpiar blob URLs cuando el componente se desmonta
  React.useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const handleInputChange = (field: keyof User, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        notify('error', 'Por favor, selecciona un archivo de imagen válido.');
        return;
      }
      
      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        notify('error', 'La imagen debe ser menor a 2MB.');
        return;
      }

      // Liberar URL anterior si existe
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      // Usar URL.createObjectURL para vista previa inmediata y eficiente
      const imageUrl = URL.createObjectURL(file);
      blobUrlRef.current = imageUrl;
      
      setProfile(prev => ({
        ...prev,
        profileImage: imageUrl
      }));

      // Base64 para enviar al backend
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setProfileImageBase64(base64String); // ← guardar base64 en estado separado
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
      email:        profile.email,
      username:     profile.username,
      phone:        profile.phone,
      profesionId:  profile.profesionId,
      color:        profile.color,
      profileImage: profileImageBase64 || profile.profileImage,
      };

      const result = await authService.updateProfile(payload);

      if (result && result.success) {
        setProfile(result.data);
        originalProfileRef.current = result.data;
        setProfileImageBase64(''); // Limpiar base64 después de guardar
        notify('success', 'Perfil actualizado exitosamente');
        setIsEditing(false);
      } else {
        notify('error', result.message || 'Error al actualizar el perfil');
      }
      
    } catch {
      notify('error', 'Error al actualizar el perfil');
    } finally {
      // Limpiar blob URL después de guardar
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = '';
      }
      setIsLoading(false);
      }
  };

  const handleCancel = () => {
    // Limpiar URL del blob si existe
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = '';
    }
    // Restaurar el perfil al estado guardado
    setProfile({ ...originalProfileRef.current });
    setProfileImageBase64(''); // Limpiar base64 si cancela
    setIsEditing(false);
  };

  const resolveImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('blob:')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_STORAGE_URL}/${imagePath}`;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validatePassword = (password: string): { rule: string; valid: boolean }[] => {
    return [
      { rule: 'Al menos 6 caracteres',                        valid: password.length >= 6 },
      { rule: 'Al menos una letra minúscula',                 valid: /(?=.*[a-z])/.test(password) },
      { rule: 'Al menos una letra mayúscula',                 valid: /(?=.*[A-Z])/.test(password) },
      { rule: 'Al menos un número',                           valid: /(?=.*\d)/.test(password) },
      { rule: 'Al menos un carácter especial (@$!%*?&)',      valid: /(?=.*[@$!%*?&])/.test(password) },
    ];
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    const errors: {[key: string]: string} = {};
    
    // Contraseña actual
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }
    
    // Nueva contraseña
    if (!passwordForm.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else {
      const rules = validatePassword(passwordForm.newPassword);
      //const firstFailed = rules.find(r => !r.valid);
      const lengthRule = rules.find(r => r.rule === 'Al menos 6 caracteres');
      if (lengthRule && !lengthRule.valid) {
        errors.newPassword = lengthRule.rule;
      } else if (passwordForm.currentPassword === passwordForm.newPassword) {
        errors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
      }
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setPasswordErrors(errors);
    
    setPasswordLoading(true);
    
    try {
      // Simular validación de contraseña actual
      await authService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword, passwordForm.confirmPassword);

      notify('success', 'Contraseña cambiada exitosamente');
      setShowPasswordSection(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      
    } catch {
      notify('error', 'Error al cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordSection(!showPasswordSection);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const obtenerProfesiones = async () => {
    const datos = await commonService.getProfessions();
    if (datos.success) {
      setProfesiones(datos.data || []);
    } 
  };

  return (
      <div className="max-w-7xl mx-auto p-6px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 shadow-md mb-8 ">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                  <p className="text-white/80">Gestiona tu información personal</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Guardar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 dark:bg-gray-900 lg:grid-cols-3 gap-8">
          {/* Profile Photo Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Foto de Perfil</h2>
              
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar
                    src={resolveImageUrl(profile?.profileImage ?? '')}
                    firstName={profile?.firstName}
                    className="w-32 h-32"
                    backgroundColor={profile?.color || "#0d9488"}
                    textColor="text-white"
                  />
                  {isEditing && (
                    <button
                      onClick={triggerFileInput}
                      className="absolute bottom-2 right-2 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{profile.firstName}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{profile.role}</p>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400">{tempProfile.diresa}</p> */}
                </div>
                
                {isEditing && (
                  <button
                    onClick={triggerFileInput}
                    className="mt-4 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Cambiar Foto</span>
                  </button>
                )}
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Información del Sistema</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Último acceso:</span>
                  <span className="font-medium dark:text-gray-100">---</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Estado:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200">
                    Activo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Color:</span>
                  <span>
                    <ColorPicker
                        name="color"
                        value={profile?.color || "#3b82f6"}
                        onChange={(e) => {handleInputChange('color', e.target.value)}}
                        disabled={!isEditing}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Información Personal</h2>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido Paterno
                    </label>
                    <input
                      type="text"
                      value={profile.paternalSurname}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido Materno
                    </label>
                    <input
                      type="text"
                      value={profile.maternalSurname}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profesión
                    </label>
                    <select
                      value={profile.profesionId}
                      onChange={(e) => handleInputChange('profesionId', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-500"
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
              </form>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Seguridad</h3>
              <div className="space-y-4">
                <button 
                  onClick={handleOpenPasswordModal}
                  className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Cambiar Contraseña</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Actualiza tu contraseña regularmente</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPasswordSection ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>

                {/* Sección Expandible de Cambio de Contraseña */}
                {showPasswordSection && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden dark:bg-gray-800 ">
                    <form onSubmit={handlePasswordSubmit} className="p-6">
                      <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Contraseña Actual
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="Ingresa tu contraseña actual"
                              />
                              <button
                                type="button"
                                onClick={() => togglePassword('current')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                              </button>
                            </div>
                          </div>
                      </div>
                      <div className="space-y-4">
                        {/* Nueva Contraseña */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nueva Contraseña
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Ingresa tu nueva contraseña"
                            />
                            <button
                              type="button"
                              onClick={() => togglePassword('new')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                          )}
                          {/* Indicador de fortaleza de contraseña */}
                          {passwordForm.newPassword && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Fortaleza de la contraseña:
                              </div>
                              <div className="flex space-x-1">
                                {(() => {
                                  const rules = validatePassword(passwordForm.newPassword);
                                  const strength = rules.filter(r => r.valid).length; // 0 a 5
                                  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'];

                                  return Array.from({ length: 5 }, (_, i) => (
                                    <div
                                      key={i}
                                      className={`h-1 flex-1 rounded transition-colors duration-300 ${
                                        i < strength ? colors[strength - 1] : 'bg-gray-200 dark:bg-gray-600'
                                      }`}
                                    />
                                  ));
                                })()}
                              </div>
                              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                {(() => {
                                  const strength = validatePassword(passwordForm.newPassword).filter(r => r.valid).length;
                                  const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
                                  return labels[strength];
                                })()}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Confirmar Nueva Contraseña */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirmar Nueva Contraseña
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                              placeholder='Confirma la contraseña'
                              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                                passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => togglePassword('confirm')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                            {passwordErrors.confirmPassword && (
                              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                            )}
                          </div>
                        </div>

                        {/* Requisitos de contraseña */}
                        <div className="bg-white/70 dark:bg-gray-700/70 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Requisitos de contraseña:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {validatePassword(passwordForm.newPassword).map(({ rule, valid }) => (
                              <div key={rule} className="flex items-center space-x-1">
                                <span className={valid ? 'text-green-500' : 'text-gray-300'}>
                                  {valid ? '✓' : '○'}
                                </span>
                                <span className={`text-xs ${valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {rule}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowPasswordSection(false)}
                          className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg> <span>Cancelar</span>
                        </button>
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="flex-1 bg-gradient-to-r from-blue-400 to-blue-700 dark:from-yellow-700 dark:to-orange-700 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-600 dark:hover:from-yellow-600 dark:hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {passwordLoading ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Cambiando...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Cambiar Contraseña</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
