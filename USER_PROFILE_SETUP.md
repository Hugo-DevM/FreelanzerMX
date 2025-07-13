# Configuración del Sistema de Perfiles de Usuario

## Descripción

Este sistema permite a cada usuario gestionar su información personal y de negocio de forma independiente. Cuando un usuario se registra, se crea automáticamente un perfil en Firebase Firestore con sus datos básicos, y puede completar su información posteriormente.

## Características Implementadas

### 1. Gestión de Perfiles de Usuario

- **Registro automático**: Al crear una cuenta, se genera automáticamente un perfil de usuario
- **Información personal**: Nombre, apellido, teléfono, biografía
- **Información de negocio**: Nombre del negocio, empresa, sitio web, RFC, tipo de negocio, industria
- **Dirección completa**: Calle, ciudad, estado, código postal, país
- **Preferencias**: Moneda, idioma, zona horaria, notificaciones

### 2. Integración con Cotizaciones

- **Datos automáticos**: Las cotizaciones se pre-llenan con la información del perfil del usuario
- **Personalización**: El usuario puede modificar los datos antes de generar la cotización

### 3. Persistencia de Datos

- **Firebase Firestore**: Todos los datos se almacenan en la colección `users`
- **Sincronización**: Los datos se cargan automáticamente al iniciar sesión
- **Actualización en tiempo real**: Los cambios se reflejan inmediatamente

## Estructura de Datos

### Colección: `users`

```typescript
interface UserProfile {
  uid: string; // ID único del usuario (Firebase Auth UID)
  email: string; // Email del usuario
  displayName: string; // Nombre público del usuario
  firstName: string; // Nombre
  lastName: string; // Apellido
  phone?: string; // Teléfono (opcional)
  company?: string; // Empresa (opcional)
  website?: string; // Sitio web (opcional)
  bio?: string; // Biografía (opcional)

  address?: {
    street?: string; // Calle y número
    city?: string; // Ciudad
    state?: string; // Estado
    zipCode?: string; // Código postal
    country?: string; // País
  };

  businessInfo?: {
    businessName: string; // Nombre del negocio
    taxId?: string; // RFC (opcional)
    businessType?: string; // Tipo de negocio
    industry?: string; // Industria
  };

  preferences?: {
    currency: string; // Moneda (MXN por defecto)
    language: string; // Idioma (es por defecto)
    timezone: string; // Zona horaria
    notifications: {
      email: boolean; // Notificaciones por email
      push: boolean; // Notificaciones push
    };
  };

  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de última actualización
}
```

## Configuración de Firebase

### 1. Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer y escribir solo su propio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Cotizaciones del usuario
    match /quotes/{quoteId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 2. Configuración de Autenticación

- Habilitar autenticación por email/password en Firebase Console
- Configurar plantillas de email para verificación y recuperación de contraseña

## Funcionalidades del Sistema

### 1. Registro de Usuario

```typescript
// Al registrarse, se crea automáticamente el perfil
const signUp = async (
  email: string,
  password: string,
  userData: {
    firstName: string;
    lastName: string;
    displayName: string;
    phone?: string;
    company?: string;
  }
) => {
  // 1. Crear usuario en Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // 2. Crear perfil en Firestore
  await createUserProfile({
    uid: userCredential.user.uid,
    email: userCredential.user.email || email,
    ...userData,
    businessInfo: {
      businessName: userData.displayName,
    },
  });
};
```

### 2. Carga Automática del Perfil

```typescript
// El perfil se carga automáticamente al iniciar sesión
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Cargar perfil del usuario
      const profile = await getUserProfile(firebaseUser.uid);
      setUserProfile(profile);
    }
  });

  return () => unsubscribe();
}, []);
```

### 3. Actualización del Perfil

```typescript
// Actualizar información del perfil
const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
) => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
};
```

### 4. Integración con Cotizaciones

```typescript
// Los datos del perfil se usan automáticamente en las cotizaciones
useEffect(() => {
  if (userProfile) {
    setFormData((prev) => ({
      ...prev,
      freelancerName:
        userProfile.displayName ||
        `${userProfile.firstName} ${userProfile.lastName}`,
      city:
        userProfile.address?.city ||
        userProfile.address?.state ||
        "Ciudad de México",
    }));
  }
}, [userProfile]);
```

## Páginas y Componentes

### 1. Página de Perfil (`/profile`)

- **Ruta**: `src/app/profile/page.tsx`
- **Componente**: `src/components/profile/UserProfile.tsx`
- **Funcionalidad**: Edición completa del perfil de usuario

### 2. Formulario de Registro Actualizado

- **Archivo**: `src/components/auth/SignupForm.tsx`
- **Campos adicionales**: Nombre, apellido, nombre de usuario, teléfono, empresa

### 3. Sidebar Actualizado

- **Archivo**: `src/components/layout/Sidebar.tsx`
- **Nuevo enlace**: "Mi Perfil" en el menú de navegación

## Servicios Implementados

### 1. UserService (`src/services/userService.ts`)

- `createUserProfile()`: Crear perfil de usuario
- `getUserProfile()`: Obtener perfil por UID
- `updateUserProfile()`: Actualizar perfil
- `userProfileExists()`: Verificar si existe perfil
- `getUserByEmail()`: Buscar usuario por email
- `updateUserPreferences()`: Actualizar preferencias
- `updateBusinessInfo()`: Actualizar información de negocio

### 2. Hook de Autenticación Actualizado (`src/hooks/useAuth.ts`)

- Carga automática del perfil al autenticarse
- Gestión del estado del perfil
- Función `refreshUserProfile()` para actualizar datos

### 3. Contexto de Autenticación (`src/contexts/AuthContext.tsx`)

- Incluye `userProfile` y `profileLoading` en el contexto
- Función `refreshUserProfile()` disponible globalmente

## Flujo de Usuario

### 1. Registro

1. Usuario llena formulario de registro con datos básicos
2. Se crea cuenta en Firebase Auth
3. Se crea automáticamente perfil en Firestore
4. Usuario es redirigido al dashboard

### 2. Inicio de Sesión

1. Usuario se autentica con email/password
2. Se carga automáticamente su perfil desde Firestore
3. Los datos están disponibles en toda la aplicación

### 3. Gestión del Perfil

1. Usuario accede a "Mi Perfil" desde el sidebar
2. Puede editar toda su información personal y de negocio
3. Los cambios se guardan en Firestore
4. Los datos se actualizan en tiempo real

### 4. Creación de Cotizaciones

1. Los datos del perfil se pre-llenan automáticamente
2. Usuario puede modificar los datos si es necesario
3. La cotización se guarda asociada al usuario

## Ventajas del Sistema

### 1. Experiencia de Usuario

- **Datos pre-llenados**: No necesita escribir información repetitiva
- **Personalización**: Puede completar su perfil a su ritmo
- **Consistencia**: Los datos se mantienen sincronizados

### 2. Seguridad

- **Aislamiento**: Cada usuario solo ve sus propios datos
- **Autenticación**: Acceso controlado por Firebase Auth
- **Validación**: Reglas de Firestore protegen los datos

### 3. Escalabilidad

- **Firebase**: Infraestructura escalable automáticamente
- **Modular**: Fácil agregar nuevos campos al perfil
- **Flexible**: Estructura adaptable a diferentes tipos de usuarios

## Próximos Pasos

### 1. Funcionalidades Adicionales

- **Avatar de usuario**: Subir y gestionar foto de perfil
- **Preferencias avanzadas**: Configuración de notificaciones
- **Historial de cambios**: Log de modificaciones al perfil

### 2. Integración con Otros Módulos

- **Facturas**: Usar datos del perfil en facturas
- **Contratos**: Información legal del usuario
- **Reportes**: Estadísticas personalizadas

### 3. Mejoras de UX

- **Validación en tiempo real**: Verificar datos mientras se escriben
- **Autocompletado**: Sugerencias de ciudades y países
- **Importar/Exportar**: Backup de datos del perfil

## Troubleshooting

### Problemas Comunes

1. **Perfil no se carga**

   - Verificar conexión a Firebase
   - Revisar reglas de Firestore
   - Comprobar que el usuario esté autenticado

2. **Datos no se guardan**

   - Verificar permisos de escritura en Firestore
   - Revisar errores en la consola del navegador
   - Comprobar que los campos requeridos estén completos

3. **Cotizaciones sin datos del perfil**
   - Verificar que el perfil esté cargado antes de crear cotización
   - Revisar que los campos del perfil no estén vacíos
   - Comprobar la sincronización del contexto de autenticación

### Logs de Debug

```typescript
// Habilitar logs detallados
console.log("User Profile:", userProfile);
console.log("Auth State:", authState);
console.log("Firebase User:", user);
```

## Conclusión

El sistema de perfiles de usuario proporciona una base sólida para la gestión de datos personales y de negocio. Cada usuario tiene su propio espacio de datos aislado y seguro, con integración completa en toda la aplicación. La arquitectura es escalable y permite futuras expansiones según las necesidades del negocio.
