# Configuración de Sistema de Cotizaciones

## Funcionalidades Implementadas

### ✅ 1. Generación de PDF

- **Librería:** jsPDF
- **Funcionalidad:** Genera PDFs profesionales de cotizaciones
- **Características:**
  - Diseño limpio y profesional
  - Múltiples páginas automáticas
  - Formato de moneda mexicana
  - Información completa de servicios y condiciones

### ✅ 2. Guardado en Firebase

- **Base de datos:** Firestore
- **Funcionalidad:** Guarda todas las cotizaciones del usuario
- **Estructura de datos:**
  - Información del freelancer y cliente
  - Lista de servicios con precios
  - Condiciones de pago y plazos
  - Estados: draft, sent, approved, rejected
  - Timestamps de creación y actualización

### ✅ 3. Historial de Cotizaciones

- **Vista principal:** Muestra todas las cotizaciones del usuario
- **Funcionalidades:**
  - Filtrado por estado
  - Edición de estado
  - Eliminación de cotizaciones
  - Información resumida de cada cotización

### ✅ 4. Envío por Email

- **Servicio:** Nodemailer con Gmail
- **Funcionalidad:** Envía cotizaciones como PDF adjunto
- **Características:**
  - Formulario personalizable
  - Generación automática de asunto y cuerpo
  - PDF adjunto automático

## Configuración Requerida

### 1. Variables de Entorno

Crear archivo `.env.local` con las siguientes variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 2. Configuración de Firebase

1. **Habilitar Firestore:**

   - Ir a Firebase Console
   - Seleccionar tu proyecto
   - Ir a Firestore Database
   - Crear base de datos en modo de prueba

2. **Reglas de Seguridad (Firestore):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotes/{quoteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. Configuración de Email (Gmail)

1. **Habilitar Autenticación de 2 Factores**
2. **Generar Contraseña de Aplicación:**
   - Ir a Configuración de Google Account
   - Seguridad > Verificación en 2 pasos
   - Contraseñas de aplicación
   - Generar nueva contraseña para "Mail"
3. **Usar la contraseña generada en EMAIL_PASS**

## Uso del Sistema

### Crear Nueva Cotización

1. Ir a la sección "Cotizaciones"
2. Hacer clic en "+ Nueva Cotización"
3. Completar el formulario
4. Hacer clic en "Guardar y Generar Cotización"

### Gestionar Cotizaciones

1. **Ver historial:** Todas las cotizaciones aparecen en la vista principal
2. **Cambiar estado:** Usar el dropdown en cada cotización
3. **Eliminar:** Botón "Eliminar" en cada cotización

### Generar PDF

1. En la vista previa de la cotización
2. Hacer clic en "📄 Descargar PDF"
3. El PDF se descargará automáticamente

### Enviar por Email

1. En la vista previa de la cotización
2. Hacer clic en "📧 Enviar por Email"
3. Completar el formulario de email
4. Hacer clic en "Enviar Cotización"

## Estructura de Archivos

```
src/
├── components/
│   └── quotes/
│       ├── QuoteForm.tsx      # Formulario de creación
│       ├── QuotePreview.tsx   # Vista previa y acciones
│       └── Index.tsx
├── services/
│   ├── quoteService.ts        # Operaciones con Firebase
│   ├── pdfService.ts          # Generación de PDFs
│   ├── emailService.ts        # Envío de emails
│   └── Index.tsx
├── app/
│   ├── quotes/
│   │   └── page.tsx           # Vista principal
│   └── api/
│       └── send-quote-email/
│           └── route.ts       # API para emails
└── lib/
    └── firebase.ts            # Configuración de Firebase
```

## Dependencias Instaladas

```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "@types/jspdf": "^2.0.0",
  "firebase": "^10.7.0",
  "nodemailer": "^6.9.7",
  "@types/nodemailer": "^6.4.14"
}
```

## Notas Importantes

1. **Seguridad:** Las reglas de Firestore aseguran que cada usuario solo vea sus propias cotizaciones
2. **Email:** Usar contraseña de aplicación de Gmail, no la contraseña normal
3. **PDF:** Los PDFs se generan en el cliente para mejor rendimiento
4. **Estados:** Las cotizaciones tienen 4 estados: draft, sent, approved, rejected

## Solución de Problemas

### Error de Email

- Verificar que EMAIL_USER y EMAIL_PASS estén configurados
- Asegurar que la contraseña de aplicación sea correcta
- Verificar que la autenticación de 2 factores esté habilitada

### Error de Firebase

- Verificar que las variables de entorno de Firebase estén correctas
- Asegurar que Firestore esté habilitado en el proyecto
- Verificar las reglas de seguridad de Firestore

### Error de PDF

- Verificar que jsPDF esté instalado correctamente
- Revisar la consola del navegador para errores específicos
