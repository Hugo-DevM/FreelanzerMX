# Configuración del Sistema de Gestión de Contratos

## Descripción

Sistema completo de gestión de contratos que permite a los freelancers crear, gestionar y dar seguimiento a todos sus contratos con clientes. Incluye funcionalidades de creación, edición, firma digital, generación de PDF y seguimiento de estados.

## Características Implementadas

### ✅ 1. Creación de Contratos

- **Formulario completo**: Información del freelancer, cliente, servicios, términos
- **Plantillas predefinidas**: Contratos estándar para diferentes tipos de servicios
- **Términos personalizables**: Condiciones específicas por proyecto
- **Validación en tiempo real**: Verificación de campos obligatorios

### ✅ 2. Gestión de Estados

- **Estados del contrato**: Draft, Sent, Signed, Active, Completed, Cancelled
- **Flujo de trabajo**: Transiciones automáticas entre estados
- **Historial de cambios**: Seguimiento de modificaciones
- **Notificaciones**: Alertas de cambios de estado

### ✅ 3. Generación de PDF

- **Diseño profesional**: Contratos con formato legal estándar
- **Información completa**: Todos los términos y condiciones
- **Firma digital**: Espacio para firmas electrónicas
- **Múltiples páginas**: Contratos extensos con paginación

### ✅ 4. Integración con Módulos

- **Proyectos**: Vinculación automática con proyectos existentes
- **Cotizaciones**: Conversión de cotizaciones a contratos
- **Perfiles**: Datos automáticos del freelancer y cliente
- **Finanzas**: Seguimiento de pagos y términos financieros

## Estructura de Datos

### Colección: `contracts`

```typescript
interface Contract {
  id: string; // ID único del contrato
  userId: string; // ID del freelancer
  projectId?: string; // ID del proyecto asociado (opcional)
  quoteId?: string; // ID de la cotización asociada (opcional)

  // Información del contrato
  title: string; // Título del contrato
  contractNumber: string; // Número único del contrato
  type: "service" | "project" | "consulting" | "maintenance"; // Tipo de contrato

  // Partes del contrato
  freelancer: {
    name: string; // Nombre completo
    email: string; // Email de contacto
    phone?: string; // Teléfono (opcional)
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    taxId?: string; // RFC (opcional)
  };

  client: {
    name: string; // Nombre completo o empresa
    email: string; // Email de contacto
    phone?: string; // Teléfono (opcional)
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    taxId?: string; // RFC (opcional)
  };

  // Servicios y términos
  services: {
    description: string; // Descripción del servicio
    deliverables: string[]; // Entregables específicos
    timeline: string; // Cronograma del proyecto
  }[];

  // Términos financieros
  financial: {
    totalAmount: number; // Monto total del contrato
    currency: string; // Moneda (MXN por defecto)
    paymentTerms: string; // Condiciones de pago
    paymentSchedule: {
      percentage: number; // Porcentaje del pago
      description: string; // Descripción del pago
      dueDate: string; // Fecha de vencimiento (YYYY-MM-DD)
    }[];
  };

  // Términos legales
  terms: {
    startDate: string; // Fecha de inicio (YYYY-MM-DD)
    endDate: string; // Fecha de finalización (YYYY-MM-DD)
    terminationClause: string; // Cláusula de terminación
    confidentiality: string; // Acuerdo de confidencialidad
    intellectualProperty: string; // Propiedad intelectual
  };

  // Estado y seguimiento
  status: "draft" | "sent" | "signed" | "active" | "completed" | "cancelled";
  signatures: {
    freelancer?: {
      date: string; // Fecha de firma (YYYY-MM-DD)
      ipAddress?: string; // IP de la firma
    };
    client?: {
      date: string; // Fecha de firma (YYYY-MM-DD)
      ipAddress?: string; // IP de la firma
    };
  };

  // Metadatos
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de última actualización
  sentAt?: Date; // Fecha de envío al cliente
  signedAt?: Date; // Fecha de firma completa
}
```

## Configuración de Firebase

### 1. Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Contratos del usuario
    match /contracts/{contractId} {
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
contracts: userId(Ascending), status(Ascending);
contracts: userId(Ascending), createdAt(Descending);
contracts: userId(Ascending), endDate(Ascending);
```

## Estructura de Archivos

```
src/
├── components/
│   └── contracts/
│       ├── ContractForm.tsx           # Formulario de creación
│       ├── ContractPreview.tsx        # Vista previa del contrato
│       ├── ContractList.tsx           # Lista de contratos
│       └── ContractDetail.tsx         # Vista detallada
├── services/
│   └── contractService.ts             # Operaciones con Firebase
├── types/
│   └── contract.ts                    # Tipos de TypeScript
└── app/
    └── contracts/
        └── page.tsx                   # Página principal
```

## Funcionalidades del Sistema

### 1. Creación de Contrato

```typescript
// src/services/contractService.ts
export const createContract = async (contractData: CreateContractData) => {
  const contract: Omit<Contract, "id"> = {
    userId: auth.currentUser!.uid,
    projectId: contractData.projectId,
    quoteId: contractData.quoteId,

    title: contractData.title,
    contractNumber: generateContractNumber(),
    type: contractData.type,

    freelancer: {
      name: contractData.freelancerName,
      email: contractData.freelancerEmail,
      phone: contractData.freelancerPhone,
      address: contractData.freelancerAddress,
      taxId: contractData.freelancerTaxId,
    },

    client: {
      name: contractData.clientName,
      email: contractData.clientEmail,
      phone: contractData.clientPhone,
      address: contractData.clientAddress,
      taxId: contractData.clientTaxId,
    },

    services: contractData.services,
    financial: contractData.financial,
    terms: contractData.terms,

    status: "draft",
    signatures: {},

    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, "contracts"), contract);
  return { id: docRef.id, ...contract };
};

// Generar número único de contrato
const generateContractNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `CON-${year}-${random}`;
};
```

### 2. Obtención de Contratos

```typescript
// src/services/contractService.ts
export const getUserContracts = async (userId: string) => {
  const q = query(
    collection(db, "contracts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Contract[];
};

export const getContractById = async (contractId: string) => {
  const docRef = doc(db, "contracts", contractId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Contract;
  }
  return null;
};
```

### 3. Actualización de Estado

```typescript
// src/services/contractService.ts
export const updateContractStatus = async (
  contractId: string,
  status: Contract["status"],
  additionalData?: Partial<Contract>
) => {
  const docRef = doc(db, "contracts", contractId);
  const updates: Partial<Contract> = {
    status,
    updatedAt: new Date(),
    ...additionalData,
  };

  // Agregar fechas específicas según el estado
  switch (status) {
    case "sent":
      updates.sentAt = new Date();
      break;
    case "signed":
      updates.signedAt = new Date();
      break;
  }

  await updateDoc(docRef, updates);
};
```

### 4. Firma Digital

```typescript
// src/services/contractService.ts
export const signContract = async (
  contractId: string,
  signerType: "freelancer" | "client",
  signatureData: {
    date: string;
    ipAddress?: string;
  }
) => {
  const docRef = doc(db, "contracts", contractId);
  const contract = await getContractById(contractId);

  if (!contract) throw new Error("Contrato no encontrado");

  const updates: Partial<Contract> = {
    updatedAt: new Date(),
    signatures: {
      ...contract.signatures,
      [signerType]: signatureData,
    },
  };

  // Verificar si ambas partes han firmado
  const newSignatures = { ...contract.signatures, [signerType]: signatureData };
  if (newSignatures.freelancer && newSignatures.client) {
    updates.status = "signed";
    updates.signedAt = new Date();
  }

  await updateDoc(docRef, updates);
};
```

## Componentes Principales

### 1. Formulario de Contrato

```typescript
// src/components/contracts/ContractForm.tsx
const ContractForm = ({
  onSubmit,
}: {
  onSubmit: (data: CreateContractData) => void;
}) => {
  const [formData, setFormData] = useState<CreateContractData>({
    title: "",
    type: "service",
    freelancerName: "",
    freelancerEmail: "",
    freelancerPhone: "",
    freelancerAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "México",
    },
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "México",
    },
    services: [],
    financial: {
      totalAmount: 0,
      currency: "MXN",
      paymentTerms: "",
      paymentSchedule: [],
    },
    terms: {
      startDate: "",
      endDate: "",
      terminationClause: "",
      confidentiality: "",
      intellectualProperty: "",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Título del Contrato
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipo de Contrato
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as Contract["type"],
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="service">Servicio</option>
            <option value="project">Proyecto</option>
            <option value="consulting">Consultoría</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Información del freelancer */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Información del Freelancer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.freelancerName}
            onChange={(e) =>
              setFormData({ ...formData, freelancerName: e.target.value })
            }
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.freelancerEmail}
            onChange={(e) =>
              setFormData({ ...formData, freelancerEmail: e.target.value })
            }
            className="border rounded px-3 py-2"
            required
          />
        </div>
      </div>

      {/* Información del cliente */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre o empresa"
            value={formData.clientName}
            onChange={(e) =>
              setFormData({ ...formData, clientName: e.target.value })
            }
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.clientEmail}
            onChange={(e) =>
              setFormData({ ...formData, clientEmail: e.target.value })
            }
            className="border rounded px-3 py-2"
            required
          />
        </div>
      </div>

      {/* Servicios */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Servicios</h3>
        <textarea
          placeholder="Descripción detallada de los servicios"
          value={formData.services[0]?.description || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              services: [
                { description: e.target.value, deliverables: [], timeline: "" },
              ],
            })
          }
          className="w-full border rounded px-3 py-2 h-32"
          required
        />
      </div>

      {/* Términos financieros */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Términos Financieros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Monto Total
            </label>
            <input
              type="number"
              value={formData.financial.totalAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  financial: {
                    ...formData.financial,
                    totalAmount: Number(e.target.value),
                  },
                })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Condiciones de Pago
            </label>
            <input
              type="text"
              placeholder="Ej: 50% al inicio, 50% al finalizar"
              value={formData.financial.paymentTerms}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  financial: {
                    ...formData.financial,
                    paymentTerms: e.target.value,
                  },
                })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Fecha de Inicio
          </label>
          <input
            type="date"
            value={formData.terms.startDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                terms: { ...formData.terms, startDate: e.target.value },
              })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Fecha de Finalización
          </label>
          <input
            type="date"
            value={formData.terms.endDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                terms: { ...formData.terms, endDate: e.target.value },
              })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
      >
        Crear Contrato
      </button>
    </form>
  );
};
```

### 2. Vista Previa del Contrato

```typescript
// src/components/contracts/ContractPreview.tsx
const ContractPreview = ({ contract }: { contract: Contract }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateContractPDF(contract);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getStatusColor = (status: Contract["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "signed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{contract.title}</h1>
          <p className="text-gray-600">Contrato #{contract.contractNumber}</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${getStatusColor(
              contract.status
            )}`}
          >
            {contract.status.toUpperCase()}
          </span>
        </div>

        {/* Información de las partes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Freelancer</h3>
            <p className="font-medium">{contract.freelancer.name}</p>
            <p className="text-gray-600">{contract.freelancer.email}</p>
            {contract.freelancer.phone && (
              <p className="text-gray-600">{contract.freelancer.phone}</p>
            )}
            <p className="text-gray-600 mt-2">
              {contract.freelancer.address.street}
              <br />
              {contract.freelancer.address.city},{" "}
              {contract.freelancer.address.state}
              <br />
              {contract.freelancer.address.zipCode},{" "}
              {contract.freelancer.address.country}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Cliente</h3>
            <p className="font-medium">{contract.client.name}</p>
            <p className="text-gray-600">{contract.client.email}</p>
            {contract.client.phone && (
              <p className="text-gray-600">{contract.client.phone}</p>
            )}
            <p className="text-gray-600 mt-2">
              {contract.client.address.street}
              <br />
              {contract.client.address.city}, {contract.client.address.state}
              <br />
              {contract.client.address.zipCode},{" "}
              {contract.client.address.country}
            </p>
          </div>
        </div>

        {/* Servicios */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Servicios</h3>
          {contract.services.map((service, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <p className="text-gray-800">{service.description}</p>
              {service.deliverables.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-sm">Entregables:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {service.deliverables.map((deliverable, i) => (
                      <li key={i}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Términos financieros */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Términos Financieros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Monto Total:</p>
              <p className="text-2xl font-bold text-green-600">
                ${contract.financial.totalAmount.toLocaleString()}{" "}
                {contract.financial.currency}
              </p>
            </div>
            <div>
              <p className="font-medium">Condiciones de Pago:</p>
              <p className="text-gray-600">{contract.financial.paymentTerms}</p>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Período del Contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Fecha de Inicio:</p>
              <p className="text-gray-600">{contract.terms.startDate}</p>
            </div>
            <div>
              <p className="font-medium">Fecha de Finalización:</p>
              <p className="text-gray-600">{contract.terms.endDate}</p>
            </div>
          </div>
        </div>

        {/* Firmas */}
        {contract.signatures.freelancer || contract.signatures.client ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Firmas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contract.signatures.freelancer && (
                <div>
                  <p className="font-medium">Firmado por Freelancer:</p>
                  <p className="text-gray-600">
                    {contract.signatures.freelancer.date}
                  </p>
                </div>
              )}
              {contract.signatures.client && (
                <div>
                  <p className="font-medium">Firmado por Cliente:</p>
                  <p className="text-gray-600">
                    {contract.signatures.client.date}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Acciones */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isGeneratingPDF ? "Generando..." : "📄 Descargar PDF"}
          </button>

          {contract.status === "draft" && (
            <button
              onClick={() => updateContractStatus(contract.id, "sent")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              📧 Enviar al Cliente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

## Flujo de Usuario

### 1. Creación de Contrato

1. Usuario accede a la sección "Contratos"
2. Hace clic en "+ Nuevo Contrato"
3. Completa el formulario con información del contrato
4. Sistema valida datos en tiempo real
5. Se guarda el contrato en Firestore
6. Se muestra la vista previa del contrato

### 2. Envío al Cliente

1. Usuario revisa la vista previa del contrato
2. Hace clic en "Enviar al Cliente"
3. Sistema actualiza estado a "sent"
4. Se envía email al cliente con el contrato
5. Cliente puede revisar y firmar el contrato

### 3. Firma Digital

1. Cliente recibe el contrato por email
2. Revisa los términos y condiciones
3. Hace clic en "Firmar Contrato"
4. Sistema registra la firma del cliente
5. Si ambas partes han firmado, el estado cambia a "signed"

### 4. Seguimiento

1. Usuario puede ver el estado del contrato
2. Sistema muestra fechas de firma
3. Se puede generar PDF en cualquier momento
4. Contratos activos se muestran en el dashboard

## Integración con Otros Módulos

### 1. Proyectos

```typescript
// Convertir proyecto a contrato
export const createContractFromProject = async (projectId: string) => {
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Proyecto no encontrado");

  const contractData: CreateContractData = {
    title: `Contrato - ${project.title}`,
    type: "project",
    projectId: project.id,
    freelancerName: userProfile?.displayName || "",
    freelancerEmail: userProfile?.email || "",
    clientName: project.client.name,
    clientEmail: project.client.email || "",
    services: [
      {
        description: project.description,
        deliverables: [],
        timeline: `${project.dates.startDate} - ${project.dates.dueDate}`,
      },
    ],
    financial: {
      totalAmount: project.budget.amount,
      currency: project.budget.currency,
      paymentTerms: "50% al inicio, 50% al finalizar",
      paymentSchedule: [],
    },
    terms: {
      startDate: project.dates.startDate,
      endDate: project.dates.dueDate,
      terminationClause: "Cláusula estándar de terminación",
      confidentiality: "Acuerdo de confidencialidad estándar",
      intellectualProperty: "Propiedad intelectual estándar",
    },
  };

  return await createContract(contractData);
};
```

### 2. Cotizaciones

```typescript
// Convertir cotización a contrato
export const createContractFromQuote = async (quoteId: string) => {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw new Error("Cotización no encontrada");

  const contractData: CreateContractData = {
    title: `Contrato - ${quote.title}`,
    type: "service",
    quoteId: quote.id,
    freelancerName: quote.freelancerName,
    freelancerEmail: quote.freelancerEmail,
    clientName: quote.clientName,
    clientEmail: quote.clientEmail,
    services: quote.services.map((service) => ({
      description: service.description,
      deliverables: service.deliverables || [],
      timeline: service.timeline || "",
    })),
    financial: {
      totalAmount: quote.totalAmount,
      currency: quote.currency,
      paymentTerms: quote.paymentTerms,
      paymentSchedule: quote.paymentSchedule || [],
    },
    terms: {
      startDate: quote.startDate,
      endDate: quote.endDate,
      terminationClause: quote.terminationClause,
      confidentiality: quote.confidentiality,
      intellectualProperty: quote.intellectualProperty,
    },
  };

  return await createContract(contractData);
};
```

## Próximos Pasos

### 1. Funcionalidades Adicionales

- **Plantillas personalizadas**: Contratos específicos por industria
- **Firma electrónica avanzada**: Integración con servicios de firma digital
- **Notificaciones automáticas**: Recordatorios de fechas importantes
- **Renovación automática**: Contratos de mantenimiento

### 2. Mejoras de UX

- **Editor WYSIWYG**: Edición visual de términos
- **Validación legal**: Verificación de cláusulas importantes
- **Historial de versiones**: Control de cambios del contrato
- **Comentarios**: Sistema de comentarios entre partes

### 3. Integración Legal

- **Compliance**: Cumplimiento con regulaciones locales
- **Arbitraje**: Cláusulas de resolución de disputas
- **Jurisdicción**: Leyes aplicables al contrato
- **Certificación**: Validación legal de contratos

## Troubleshooting

### Problemas Comunes

1. **Contrato no se guarda**

   - Verificar conexión a Firebase
   - Revisar reglas de Firestore
   - Comprobar que todos los campos requeridos estén completos

2. **PDF no se genera**

   - Verificar instalación de jsPDF
   - Revisar datos del contrato
   - Comprobar permisos de escritura

3. **Firma no se registra**
   - Verificar función de firma
   - Revisar datos de la firma
   - Comprobar actualización de estado

### Logs de Debug

```typescript
// Habilitar logs detallados
console.log("Contract Data:", contract);
console.log("Contract Status:", contract.status);
console.log("Signatures:", contract.signatures);
```

## Conclusión

El sistema de gestión de contratos proporciona una solución completa y profesional para la creación y gestión de contratos. La integración con otros módulos asegura consistencia en los datos, mientras que las funcionalidades de firma digital y generación de PDF facilitan el proceso legal.
