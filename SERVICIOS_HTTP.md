# 🔧 Servicios HTTP con Axios

Este proyecto utiliza **Axios** en lugar de **fetch** para todas las llamadas HTTP. Aquí tienes la documentación completa de cómo usar los servicios.

## 📁 Estructura de Servicios

```
src/services/
├── authService.ts      # Autenticación y autorización
├── apiService.ts       # Cliente HTTP genérico
├── userService.ts      # Gestión de usuarios
└── fileService.ts      # Gestión de archivos
```

## 🔐 AuthService

### Configuración
El servicio de autenticación usa tu endpoint: `http://localhost:3000/api/v1/auth/login`

### Métodos Disponibles

```typescript
import { authService } from '@/services/authService';

// Login
const result = await authService.login({ email, password });

// Logout
await authService.logout();

// Verificar autenticación
const isAuth = authService.isAuthenticated();

// Obtener usuario actual
const user = authService.getCurrentUser();

// Cambiar contraseña
await authService.changePassword(currentPassword, newPassword);

// Recuperar contraseña
await authService.forgotPassword(email);

// Resetear contraseña
await authService.resetPassword(token, newPassword);
```

## 🌐 ApiService (Cliente Genérico)

### Uso Básico

```typescript
import { apiService } from '@/services/apiService';

// GET request
const data = await apiService.get<MyType>('/endpoint');

// POST request
const result = await apiService.post<ResponseType>('/endpoint', { data });

// PUT request
const updated = await apiService.put<ResponseType>('/endpoint/123', updateData);

// DELETE request
await apiService.delete('/endpoint/123');
```

### Upload de Archivos

```typescript
// Upload único
const response = await apiService.uploadFile<UploadResponse>(
  '/upload',
  file,
  (progress) => console.log(`Progreso: ${progress.loaded}/${progress.total}`)
);

// Upload múltiple
const responses = await apiService.uploadMultipleFiles<UploadResponse[]>(
  '/upload-multiple',
  files,
  (progress) => console.log(`Progreso: ${progress.loaded}/${progress.total}`)
);

// Descarga
await apiService.downloadFile('/files/123/download', 'archivo.pdf');
```

## 👤 UserService

### Gestión de Perfiles

```typescript
import { userService } from '@/services/userService';

// Obtener perfil actual
const profile = await userService.getCurrentProfile();

// Actualizar perfil
const updated = await userService.updateProfile({
  firstName: 'Juan',
  lastName: 'Pérez',
  // ... otros campos
});

// Subir foto de perfil
await userService.uploadProfilePhoto(
  file,
  (progress) => setUploadProgress(progress)
);

// Cambiar contraseña
await userService.changePassword({
  currentPassword: 'actual123',
  newPassword: 'nueva456'
});
```

### Gestión de Usuarios (Administradores)

```typescript
// Listar usuarios con paginación y búsqueda
const users = await userService.getUsers(1, 10, 'búsqueda');

// Crear usuario
const newUser = await userService.createUser({
  firstName: 'Nuevo',
  lastName: 'Usuario',
  email: 'nuevo@ejemplo.com',
  password: 'password123',
  // ... otros campos
});

// Eliminar usuario
await userService.deleteUser('user-id');
```

## 📁 FileService

### Upload de Informes

```typescript
import { fileService } from '@/services/fileService';

// Subir informe con metadatos
const informe = await fileService.uploadInforme({
  file: selectedFile,
  categoria: 'Calidad',
  estrategia: 'Plan Nacional',
  año: '2024',
  nombre: 'Informe Mensual'
}, (progress) => {
  setUploadProgress(progress);
});

// Obtener lista de informes con filtros
const informes = await fileService.getInformes({
  categoria: 'Calidad',
  año: '2024',
  page: 1,
  limit: 10,
  search: 'informe'
});

// Descargar informe
await fileService.downloadInforme('informe-id', 'informe-enero.pdf');

// Eliminar informe
await fileService.deleteInforme('informe-id');
```

## 🔧 Configuración

### Variables de Entorno (.env)

```bash
# URL base de la API
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Configuración de tokens
VITE_TOKEN_STORAGE_KEY=authToken
VITE_USER_STORAGE_KEY=userData
```

### Interceptors Automáticos

Los servicios incluyen interceptors que:

✅ **Agregan automáticamente** el token de autorización  
✅ **Manejan errores 401** (token expirado)  
✅ **Redirigen al login** cuando es necesario  
✅ **Formatean errores** de manera consistente  

### Manejo de Errores

```typescript
try {
  const data = await apiService.get('/endpoint');
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Error de HTTP
    console.error('Error:', error.response?.data?.message);
    console.error('Status:', error.response?.status);
  } else {
    // Error de red o otro
    console.error('Error de conexión:', error.message);
  }
}
```

## 🚀 Ejemplos de Uso en Componentes

### Login Component

```typescript
import { useAuth } from '@/hooks/useAuth';

function Login() {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await login({ email, password });
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };
}
```

### File Upload Component

```typescript
import { fileService } from '@/services/fileService';

function FileUpload() {
  const [progress, setProgress] = useState(0);
  
  const handleUpload = async (file: File) => {
    try {
      const result = await fileService.uploadInforme({
        file,
        categoria: selectedCategory,
        estrategia: selectedStrategy,
        año: selectedYear,
        nombre: fileName
      }, (progress) => {
        setProgress(progress);
      });
      
      console.log('Archivo subido:', result);
    } catch (error) {
      console.error('Error al subir:', error);
    }
  };
}
```

## 🔒 Seguridad

- **Tokens JWT** almacenados de forma segura
- **Verificación automática** de expiración
- **Headers de autorización** automáticos
- **Interceptors** para manejo de sesiones
- **Validación** de tipos TypeScript

## 📊 Ventajas de Axios vs Fetch

✅ **Interceptors** automáticos  
✅ **Timeout** configurable  
✅ **Cancelación** de requests  
✅ **Upload progress** nativo  
✅ **JSON** automático  
✅ **Error handling** mejorado  
✅ **Base URL** configurable  
✅ **TypeScript** friendly  

¡Todos los endpoints están listos para trabajar con tu API backend!
