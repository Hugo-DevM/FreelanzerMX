# Configuración del Sistema de Gestión de Proyectos

## Descripción

Sistema completo de gestión de proyectos que permite a los freelancers crear, organizar y dar seguimiento a todos sus proyectos. Incluye funcionalidades de creación, edición, eliminación y visualización detallada de proyectos con estados y fechas.

## Características Implementadas

### ✅ 1. Creación de Proyectos

- **Formulario completo**: Título, descripción, cliente, fechas, presupuesto
- **Validación en tiempo real**: Verificación de campos obligatorios
- **Estados automáticos**: Draft, In Progress, Completed, Cancelled
- **Fechas inteligentes**: DueDate en formato 'YYYY-MM-DD' (preferencia del usuario)

### ✅ 2. Gestión de Estados

- **Estados predefinidos**: Draft, In Progress, Completed, Cancelled
- **Transiciones**: Cambio de estado con validaciones
- **Historial**: Seguimiento de cambios de estado
- **Filtros**: Visualización por estado

### ✅ 3. Vista de Lista y Detalle

- **Vista de lista**: Proyectos con información resumida
- **Vista detallada**: Información completa del proyecto
- **Búsqueda**: Filtrado por título, cliente o estado
- **Ordenamiento**: Por fecha, estado o título

### ✅ 4. Integración con Perfiles

- **Datos automáticos**: Pre-llenado con información del perfil
- **Cliente personalizado**: Gestión de información del cliente
- **Presupuesto**: Seguimiento de ingresos por proyecto

## Estructura de Datos

### Colección: `projects`

```typescript
interface Project {
  id: string; // ID único del proyecto
  userId: string; // ID del usuario propietario
  title: string; // Título del proyecto
  description: string; // Descripción detallada
  client: {
    name: string; // Nombre del cliente
    email?: string; // Email del cliente (opcional)
    phone?: string; // Teléfono del cliente (opcional)
  };
  budget: {
    amount: number; // Monto del presupuesto
    currency: string; // Moneda (MXN por defecto)
  };
  status: "draft" | "in-progress" | "completed" | "cancelled"; // Estado del proyecto
  dates: {
    startDate: string; // Fecha de inicio (YYYY-MM-DD)
    dueDate: string; // Fecha de entrega (YYYY-MM-DD)
    completedDate?: string; // Fecha de completado (opcional)
  };
  tags?: string[]; // Etiquetas para categorización
  notes?: string; // Notas adicionales
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
    // Proyectos del usuario
    match /projects/{projectId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 2. Índices Recomendados

```javascript
// Crear índices para consultas eficientes
projects: userId(Ascending), status(Ascending);
projects: userId(Ascending), dueDate(Ascending);
projects: userId(Ascending), createdAt(Descending);
```

## Estructura de Archivos

```
src/
├── components/
│   └── projects/
│       ├── CreateProjectModal.tsx    # Modal de creación
│       ├── ProjectCard.tsx           # Tarjeta de proyecto
│       ├── ProjectDetailComponent.tsx # Vista detallada
│       └── ProjectsComponent.tsx     # Lista de proyectos
├── services/
│   └── projectService.ts             # Operaciones con Firebase
├── types/
│   └── project.ts                    # Tipos de TypeScript
└── app/
    └── projects/
        ├── page.tsx                  # Vista principal
        └── [id]/
            └── page.tsx              # Vista detallada
```

## Funcionalidades del Sistema

### 1. Creación de Proyecto

```typescript
// src/services/projectService.ts
export const createProject = async (projectData: CreateProjectData) => {
  const project: Omit<Project, "id"> = {
    userId: auth.currentUser!.uid,
    title: projectData.title,
    description: projectData.description,
    client: {
      name: projectData.clientName,
      email: projectData.clientEmail,
      phone: projectData.clientPhone,
    },
    budget: {
      amount: projectData.budget,
      currency: "MXN",
    },
    status: "draft",
    dates: {
      startDate: projectData.startDate,
      dueDate: projectData.dueDate,
    },
    tags: projectData.tags,
    notes: projectData.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, "projects"), project);
  return { id: docRef.id, ...project };
};
```

### 2. Obtención de Proyectos

```typescript
// src/services/projectService.ts
export const getUserProjects = async (userId: string) => {
  const q = query(
    collection(db, "projects"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];
};

export const getProjectById = async (projectId: string) => {
  const docRef = doc(db, "projects", projectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }
  return null;
};
```

### 3. Actualización de Estado

```typescript
// src/services/projectService.ts
export const updateProjectStatus = async (
  projectId: string,
  status: Project["status"]
) => {
  const docRef = doc(db, "projects", projectId);
  const updates: Partial<Project> = {
    status,
    updatedAt: new Date(),
  };

  // Si se marca como completado, agregar fecha de completado
  if (status === "completed") {
    updates.dates = {
      ...updates.dates,
      completedDate: new Date().toISOString().split("T")[0],
    };
  }

  await updateDoc(docRef, updates);
};
```

### 4. Eliminación de Proyecto

```typescript
// src/services/projectService.ts
export const deleteProject = async (projectId: string) => {
  const docRef = doc(db, "projects", projectId);
  await deleteDoc(docRef);
};
```

## Componentes Principales

### 1. Modal de Creación

```typescript
// src/components/projects/CreateProjectModal.tsx
const CreateProjectModal = ({ isOpen, onClose }: Props) => {
  const [formData, setFormData] = useState<CreateProjectFormData>({
    title: "",
    description: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    budget: 0,
    startDate: "",
    dueDate: "",
    tags: [],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData);
      onClose();
      // Refrescar lista de proyectos
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>{/* Campos del formulario */}</form>
    </Modal>
  );
};
```

### 2. Tarjeta de Proyecto

```typescript
// src/components/projects/ProjectCard.tsx
const ProjectCard = ({ project }: { project: Project }) => {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
            project.status
          )}`}
        >
          {project.status}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{project.description}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Cliente: {project.client.name}</span>
        <span>
          Presupuesto: ${project.budget.amount} {project.budget.currency}
        </span>
      </div>
    </div>
  );
};
```

### 3. Vista Detallada

```typescript
// src/components/projects/ProjectDetailComponent.tsx
const ProjectDetailComponent = ({ project }: { project: Project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { userProfile } = useAuth();

  const handleStatusChange = async (newStatus: Project["status"]) => {
    try {
      await updateProjectStatus(project.id, newStatus);
      // Refrescar datos del proyecto
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <select
            value={project.status}
            onChange={(e) =>
              handleStatusChange(e.target.value as Project["status"])
            }
            className="border rounded px-3 py-2"
          >
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Información del Cliente
            </h3>
            <p>
              <strong>Nombre:</strong> {project.client.name}
            </p>
            {project.client.email && (
              <p>
                <strong>Email:</strong> {project.client.email}
              </p>
            )}
            {project.client.phone && (
              <p>
                <strong>Teléfono:</strong> {project.client.phone}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Flujo de Usuario

### 1. Creación de Proyecto

1. Usuario accede a la sección "Proyectos"
2. Hace clic en "+ Nuevo Proyecto"
3. Completa el formulario con información del proyecto
4. Sistema valida datos en tiempo real
5. Se guarda el proyecto en Firestore
6. Se actualiza la lista de proyectos

### 2. Gestión de Estados

1. Usuario selecciona un proyecto de la lista
2. Ve la vista detallada del proyecto
3. Cambia el estado usando el dropdown
4. Sistema actualiza el estado en Firestore
5. Se refleja el cambio inmediatamente

### 3. Seguimiento de Proyectos

1. Usuario ve lista de todos sus proyectos
2. Puede filtrar por estado o buscar por título
3. Accede a vista detallada para más información
4. Actualiza información según sea necesario

## Integración con Dashboard

### 1. Métricas de Proyectos

```typescript
// src/services/dashboardService.ts
export const getProjectMetrics = async (userId: string) => {
  const projects = await getUserProjects(userId);

  return {
    total: projects.length,
    draft: projects.filter((p) => p.status === "draft").length,
    inProgress: projects.filter((p) => p.status === "in-progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    cancelled: projects.filter((p) => p.status === "cancelled").length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget.amount, 0),
  };
};
```

### 2. Proyectos Recientes

```typescript
// src/components/dashboard/RecentWorksTable.tsx
const RecentWorksTable = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadRecentProjects = async () => {
      const projects = await getUserProjects(user.uid);
      setRecentProjects(projects.slice(0, 5)); // Últimos 5 proyectos
    };

    if (user) {
      loadRecentProjects();
    }
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Proyectos Recientes</h3>
      <div className="space-y-3">
        {recentProjects.map((project) => (
          <div key={project.id} className="flex justify-between items-center">
            <span>{project.title}</span>
            <span
              className={`px-2 py-1 rounded text-sm ${getStatusColor(
                project.status
              )}`}
            >
              {project.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Próximos Pasos

### 1. Funcionalidades Adicionales

- **Archivos adjuntos**: Subir documentos relacionados al proyecto
- **Comentarios**: Sistema de comentarios entre freelancer y cliente
- **Tiempo tracking**: Seguimiento de horas trabajadas
- **Facturación**: Generación automática de facturas

### 2. Mejoras de UX

- **Drag & Drop**: Reordenar proyectos por prioridad
- **Vista Kanban**: Tablero visual de estados
- **Notificaciones**: Alertas de fechas límite
- **Exportación**: Exportar proyectos a PDF/Excel

### 3. Analytics Avanzados

- **Tiempo promedio**: Por tipo de proyecto
- **Ingresos por proyecto**: Análisis de rentabilidad
- **Tendencias**: Proyectos por mes/trimestre
- **Predicciones**: Estimación de ingresos futuros

## Troubleshooting

### Problemas Comunes

1. **Proyectos no se cargan**

   - Verificar conexión a Firebase
   - Revisar reglas de Firestore
   - Comprobar que el usuario esté autenticado

2. **Error al crear proyecto**

   - Verificar que todos los campos requeridos estén completos
   - Revisar formato de fechas (YYYY-MM-DD)
   - Comprobar permisos de escritura en Firestore

3. **Estados no se actualizan**
   - Verificar función updateProjectStatus
   - Revisar reglas de Firestore para actualizaciones
   - Comprobar que el proyecto pertenezca al usuario

### Logs de Debug

```typescript
// Habilitar logs detallados
console.log("Projects:", projects);
console.log("Current Project:", project);
console.log("User ID:", user?.uid);
```

## Conclusión

El sistema de gestión de proyectos proporciona una base sólida para que los freelancers organicen y den seguimiento a su trabajo. La integración con Firebase asegura sincronización en tiempo real, mientras que la estructura modular permite futuras expansiones según las necesidades del negocio.
