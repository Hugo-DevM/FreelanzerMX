# Configuración del Sistema de Autenticación

## Descripción

Sistema de autenticación completo basado en Supabase Auth que permite registro, inicio de sesión, recuperación de contraseña y protección de rutas. Integrado con el sistema de perfiles de usuario para una experiencia completa.

## Características Implementadas

### ✅ 1. Registro de Usuario

- **Formulario completo**: Nombre, apellido, email, contraseña, confirmación
- **Validación en tiempo real**: Verificación de campos mientras se escriben
- **Creación automática de perfil**: Al registrarse se crea el perfil en Firestore
- **Verificación de email**: Opcional para confirmar la cuenta

### ✅ 2. Inicio de Sesión

- **Autenticación por email/password**: Método principal de acceso
- **Persistencia de sesión**: El usuario permanece logueado entre sesiones
- **Carga automática de perfil**: Se cargan los datos del usuario automáticamente
- **Redirección inteligente**: Lleva al dashboard después del login

### ✅ 3. Recuperación de Contraseña

- **Formulario de recuperación**: Envío de email con link de reset
- **Plantilla personalizada**: Email profesional con instrucciones claras
- **Validación de email**: Verifica que el email existe en el sistema

### ✅ 4. Protección de Rutas

- **Middleware de autenticación**: Protege rutas privadas
- **Redirección automática**: Usuarios no autenticados van al login
- **Estado de carga**: Muestra loading mientras verifica autenticación

### ✅ 5. Gestión de Estado

- **Contexto global**: AuthContext para toda la aplicación
- **Estado persistente**: Mantiene datos del usuario en memoria
- **Sincronización**: Actualiza estado cuando cambia la autenticación

## Configuración de Supabase

### 1. Configuración de Autenticación

```javascript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Variables de Entorno

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configuración en Supabase Dashboard

1. **Habilitar Autenticación por Email/Password**
2. **Configurar Plantillas de Email:**
   - Email de verificación
   - Email de recuperación de contraseña
3. **Configurar Dominios Autorizados**
4. **Configurar Políticas de Seguridad (RLS)**

## Estructura de Archivos

```
src/
├── components/
│   └── auth/
│       ├── LoginForm.tsx           # Formulario de login
│       ├── SignupForm.tsx          # Formulario de registro
│       ├── ForgotPasswordForm.tsx  # Recuperación de contraseña
│       └── ProtectedRoute.tsx      # Componente de protección
├── contexts/
│   └── AuthContext.tsx             # Contexto de autenticación
├── hooks/
│   └── useAuth.ts                  # Hook personalizado
├── services/
│   └── userService.ts              # Servicios de usuario
└── app/
    ├── login/
    │   └── page.tsx                # Página de login
    ├── signup/
    │   └── page.tsx                # Página de registro
    └── forgot-password/
        └── page.tsx                # Página de recuperación
```

## Funcionalidades del Sistema

### 1. Registro de Usuario

```typescript
// src/components/auth/SignupForm.tsx
const handleSignup = async (formData: SignupFormData) => {
  try {
    // 1. Crear usuario en Supabase Auth
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          display_name: formData.displayName,
          phone: formData.phone,
          company: formData.company,
        },
      },
    });

    if (error) throw error;

    // 2. Crear perfil en Supabase Database
    if (user) {
      await createUserProfile({
        id: user.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        phone: formData.phone,
        company: formData.company,
      });
    }

    // 3. Redirigir al dashboard
    router.push("/dashboard");
  } catch (error) {
    setError(getAuthErrorMessage(error));
  }
};
```

### 2. Inicio de Sesión

```typescript
// src/components/auth/LoginForm.tsx
const handleLogin = async (formData: LoginFormData) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) throw error;
    router.push("/dashboard");
  } catch (error) {
    setError(getAuthErrorMessage(error));
  }
};
```

### 3. Recuperación de Contraseña

```typescript
// src/components/auth/ForgotPasswordForm.tsx
const handleResetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    setMessage("Email de recuperación enviado");
  } catch (error) {
    setError(getAuthErrorMessage(error));
  }
};
```

### 4. Protección de Rutas

```typescript
// src/components/auth/ProtectedRoute.tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return <>{children}</>;
};
```

## Hook de Autenticación

### useAuth Hook

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const profile = await getUserProfile(session.user.id);
        setUserProfile(profile);
      }
      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const profile = await getUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  return {
    user,
    userProfile,
    loading,
    signOut,
    refreshUserProfile,
  };
};
```

## Contexto de Autenticación

### AuthContext

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
```

## Manejo de Errores

### Traducción de Errores

```typescript
// src/utils/authErrors.ts
export const getAuthErrorMessage = (error: any): string => {
  switch (error.message) {
    case "Invalid login credentials":
      return "Credenciales de inicio de sesión inválidas";
    case "Email not confirmed":
      return "Email no confirmado. Revisa tu bandeja de entrada";
    case "User already registered":
      return "Este email ya está registrado";
    case "Password should be at least 6 characters":
      return "La contraseña debe tener al menos 6 caracteres";
    case "Invalid email":
      return "Email inválido";
    default:
      return "Error de autenticación. Inténtalo de nuevo";
  }
};
```

## Flujo de Usuario

### 1. Registro

1. Usuario accede a `/signup`
2. Completa formulario con datos personales
3. Se valida información en tiempo real
4. Se crea cuenta en Supabase Auth
5. Se crea perfil automáticamente en Supabase Database
6. Usuario es redirigido al dashboard

### 2. Inicio de Sesión

1. Usuario accede a `/login`
2. Ingresa email y contraseña
3. Se valida credenciales con Supabase
4. Se carga perfil del usuario desde Supabase Database
5. Usuario es redirigido al dashboard

### 3. Recuperación de Contraseña

1. Usuario accede a `/forgot-password`
2. Ingresa su email
3. Se envía email de recuperación
4. Usuario sigue link en email
5. Establece nueva contraseña

### 4. Protección de Rutas

1. Usuario intenta acceder a ruta protegida
2. Sistema verifica autenticación
3. Si no está autenticado, redirige a login
4. Si está autenticado, permite acceso

## Seguridad

### 1. Validación de Datos

- **Frontend**: Validación en tiempo real con React Hook Form
- **Backend**: Políticas RLS (Row Level Security) de Supabase para validación adicional
- **Sanitización**: Limpieza de datos antes de guardar

### 2. Protección de Rutas

- **Middleware**: Verificación de autenticación en cada ruta
- **Redirección**: Usuarios no autorizados son redirigidos
- **Estado de carga**: Previene acceso prematuro

### 3. Gestión de Sesiones

- **Persistencia**: Supabase maneja la persistencia automáticamente
- **Cierre de sesión**: Función de logout que limpia estado
- **Timeout**: Sesiones expiran según configuración de Supabase

## Próximos Pasos

### 1. Funcionalidades Adicionales

- **Autenticación social**: Google, Facebook, GitHub
- **Verificación de email**: Confirmación obligatoria de cuenta
- **Autenticación de dos factores**: 2FA para mayor seguridad

### 2. Mejoras de UX

- **Recordar sesión**: Opción de "Mantener sesión iniciada"
- **Sesiones múltiples**: Gestión de dispositivos conectados
- **Notificaciones**: Alertas de inicio de sesión sospechoso

### 3. Analytics y Monitoreo

- **Logs de autenticación**: Registro de intentos de login
- **Métricas**: Estadísticas de registro y login
- **Alertas**: Notificaciones de actividad sospechosa

## Troubleshooting

### Problemas Comunes

1. **Error de configuración de Supabase**

   - Verificar variables de entorno
   - Comprobar configuración en Supabase Dashboard
   - Revisar políticas RLS

2. **Perfil no se carga después del login**

   - Verificar conexión a Supabase Database
   - Revisar políticas de seguridad RLS
   - Comprobar que el perfil existe

3. **Redirección infinita**
   - Verificar lógica de ProtectedRoute
   - Revisar estado de loading
   - Comprobar rutas de redirección

### Logs de Debug

```typescript
// Habilitar logs detallados
console.log("Auth State:", user);
console.log("User Profile:", userProfile);
console.log("Loading State:", loading);
```

## Conclusión

El sistema de autenticación proporciona una base sólida y segura para la gestión de usuarios. La integración con Supabase Auth y Database permite una experiencia fluida y escalable, mientras que las características de protección de rutas y manejo de errores aseguran una aplicación robusta y profesional.
