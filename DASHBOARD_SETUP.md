# Configuración del Sistema de Dashboard

## Descripción

Dashboard completo que proporciona una vista general del negocio del freelancer, incluyendo métricas financieras, proyectos recientes, ingresos y estadísticas. Integrado con todos los módulos del sistema para mostrar información en tiempo real.

## Características Implementadas

### ✅ 1. Métricas Principales

- **Ingresos totales**: Suma de todos los proyectos completados
- **Proyectos activos**: Proyectos en progreso y draft
- **Proyectos completados**: Total de proyectos finalizados
- **Ingresos del mes**: Ingresos del mes actual
- **Tasa de conversión**: Porcentaje de proyectos completados

### ✅ 2. Gráficos y Visualizaciones

- **Gráfico de ingresos semanales**: Tendencia de ingresos por semana
- **Distribución de ingresos**: Gráfico de dona por tipo de proyecto
- **Proyectos por estado**: Visualización de estados de proyectos
- **Tendencias temporales**: Evolución de métricas en el tiempo

### ✅ 3. Tabla de Trabajos Recientes

- **Proyectos recientes**: Últimos 5 proyectos creados
- **Estados visuales**: Indicadores de color por estado
- **Acceso rápido**: Links directos a proyectos
- **Información resumida**: Título, cliente, presupuesto

### ✅ 4. Integración con Módulos

- **Proyectos**: Métricas y lista de proyectos recientes
- **Cotizaciones**: Estadísticas de cotizaciones enviadas
- **Contratos**: Información de contratos activos
- **Finanzas**: Resumen de ingresos y gastos

## Estructura de Datos

### Métricas del Dashboard

```typescript
interface DashboardMetrics {
  // Métricas principales
  totalIncome: number; // Ingresos totales
  activeProjects: number; // Proyectos activos
  completedProjects: number; // Proyectos completados
  monthlyIncome: number; // Ingresos del mes
  conversionRate: number; // Tasa de conversión

  // Distribución por estado
  projectsByStatus: {
    draft: number;
    "in-progress": number;
    completed: number;
    cancelled: number;
  };

  // Ingresos por período
  weeklyIncome: {
    week: string;
    income: number;
  }[];

  // Proyectos recientes
  recentProjects: Project[];
}
```

## Estructura de Archivos

```
src/
├── components/
│   └── dashboard/
│       ├── MetricsCard.tsx              # Tarjetas de métricas
│       ├── WeeklyIncomeChart.tsx        # Gráfico de ingresos semanales
│       ├── IncomeDistributionChart.tsx  # Gráfico de distribución
│       └── RecentWorksTable.tsx         # Tabla de trabajos recientes
├── services/
│   └── dashboardService.ts              # Servicios del dashboard
├── types/
│   └── dashboard.ts                     # Tipos de TypeScript
└── app/
    └── dashboard/
        └── page.tsx                     # Página principal del dashboard
```

## Funcionalidades del Sistema

### 1. Cálculo de Métricas

```typescript
// src/services/dashboardService.ts
export const getDashboardMetrics = async (
  userId: string
): Promise<DashboardMetrics> => {
  // Obtener todos los proyectos del usuario
  const projects = await getUserProjects(userId);
  const quotes = await getUserQuotes(userId);
  const contracts = await getUserContracts(userId);

  // Calcular métricas principales
  const totalIncome = projects
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.budget.amount, 0);

  const activeProjects = projects.filter(
    (p) => p.status === "draft" || p.status === "in-progress"
  ).length;

  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;

  // Calcular ingresos del mes actual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyIncome = projects
    .filter((p) => {
      if (p.status !== "completed" || !p.dates.completedDate) return false;
      const completedDate = new Date(p.dates.completedDate);
      return (
        completedDate.getMonth() === currentMonth &&
        completedDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, p) => sum + p.budget.amount, 0);

  // Calcular tasa de conversión
  const conversionRate =
    projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;

  // Agrupar proyectos por estado
  const projectsByStatus = {
    draft: projects.filter((p) => p.status === "draft").length,
    "in-progress": projects.filter((p) => p.status === "in-progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    cancelled: projects.filter((p) => p.status === "cancelled").length,
  };

  // Calcular ingresos semanales (últimas 8 semanas)
  const weeklyIncome = calculateWeeklyIncome(projects);

  // Obtener proyectos recientes
  const recentProjects = projects
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return {
    totalIncome,
    activeProjects,
    completedProjects,
    monthlyIncome,
    conversionRate,
    projectsByStatus,
    weeklyIncome,
    recentProjects,
  };
};
```

### 2. Cálculo de Ingresos Semanales

```typescript
// src/services/dashboardService.ts
const calculateWeeklyIncome = (projects: Project[]) => {
  const weeklyData: { week: string; income: number }[] = [];
  const today = new Date();

  // Generar datos para las últimas 8 semanas
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekIncome = projects
      .filter((p) => {
        if (p.status !== "completed" || !p.dates.completedDate) return false;
        const completedDate = new Date(p.dates.completedDate);
        return completedDate >= weekStart && completedDate <= weekEnd;
      })
      .reduce((sum, p) => sum + p.budget.amount, 0);

    const weekLabel = `${weekStart.toLocaleDateString("es-MX", {
      month: "short",
      day: "numeric",
    })} - ${weekEnd.toLocaleDateString("es-MX", {
      month: "short",
      day: "numeric",
    })}`;

    weeklyData.push({ week: weekLabel, income: weekIncome });
  }

  return weeklyData;
};
```

## Componentes Principales

### 1. Tarjetas de Métricas

```typescript
// src/components/dashboard/MetricsCard.tsx
interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "blue" | "green" | "orange" | "red";
}

const MetricsCard = ({
  title,
  value,
  icon,
  trend,
  color,
}: MetricsCardProps) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "green":
        return "bg-green-50 border-green-200 text-green-700";
      case "orange":
        return "bg-orange-50 border-orange-200 text-orange-700";
      case "red":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${getColorClasses(color)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs opacity-75 ml-1">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className="text-3xl opacity-75">{icon}</div>
      </div>
    </div>
  );
};
```

### 2. Gráfico de Ingresos Semanales

```typescript
// src/components/dashboard/WeeklyIncomeChart.tsx
import { Line } from "react-chartjs-2";

const WeeklyIncomeChart = ({
  data,
}: {
  data: { week: string; income: number }[];
}) => {
  const chartData = {
    labels: data.map((d) => d.week),
    datasets: [
      {
        label: "Ingresos Semanales",
        data: data.map((d) => d.income),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ingresos Semanales</h3>
      <Line data={chartData} options={options} />
    </div>
  );
};
```

### 3. Gráfico de Distribución de Ingresos

```typescript
// src/components/dashboard/IncomeDistributionChart.tsx
import { Doughnut } from "react-chartjs-2";

const IncomeDistributionChart = ({
  data,
}: {
  data: { [key: string]: number };
}) => {
  const chartData = {
    labels: Object.keys(data).map((key) => {
      switch (key) {
        case "draft":
          return "Borradores";
        case "in-progress":
          return "En Progreso";
        case "completed":
          return "Completados";
        case "cancelled":
          return "Cancelados";
        default:
          return key;
      }
    }),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          "rgba(156, 163, 175, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Distribución de Proyectos</h3>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};
```

### 4. Tabla de Trabajos Recientes

```typescript
// src/components/dashboard/RecentWorksTable.tsx
const RecentWorksTable = ({ projects }: { projects: Project[] }) => {
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Trabajos Recientes</h3>
      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex justify-between items-center p-3 border rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium">{project.title}</h4>
              <p className="text-sm text-gray-600">{project.client.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                ${project.budget.amount.toLocaleString()}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Página Principal del Dashboard

```typescript
// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardMetrics } from "@/services/dashboardService";
import MetricsCard from "@/components/dashboard/MetricsCard";
import WeeklyIncomeChart from "@/components/dashboard/WeeklyIncomeChart";
import IncomeDistributionChart from "@/components/dashboard/IncomeDistributionChart";
import RecentWorksTable from "@/components/dashboard/RecentWorksTable";
import { DashboardMetrics } from "@/types/dashboard";

const DashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      if (user) {
        try {
          const dashboardData = await getDashboardMetrics(user.uid);
          setMetrics(dashboardData);
        } catch (error) {
          console.error("Error loading dashboard metrics:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMetrics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Cargando...</div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-500">
        No se pudieron cargar las métricas
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Ingresos Totales"
          value={`$${metrics.totalIncome.toLocaleString()}`}
          icon="💰"
          color="green"
        />
        <MetricsCard
          title="Proyectos Activos"
          value={metrics.activeProjects}
          icon="📋"
          color="blue"
        />
        <MetricsCard
          title="Proyectos Completados"
          value={metrics.completedProjects}
          icon="✅"
          color="green"
        />
        <MetricsCard
          title="Ingresos del Mes"
          value={`$${metrics.monthlyIncome.toLocaleString()}`}
          icon="📈"
          color="orange"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyIncomeChart data={metrics.weeklyIncome} />
        <IncomeDistributionChart data={metrics.projectsByStatus} />
      </div>

      {/* Tabla de trabajos recientes */}
      <RecentWorksTable projects={metrics.recentProjects} />
    </div>
  );
};

export default DashboardPage;
```

## Integración con Otros Módulos

### 1. Proyectos

```typescript
// Integración con métricas de proyectos
export const getProjectMetrics = async (userId: string) => {
  const projects = await getUserProjects(userId);

  return {
    total: projects.length,
    byStatus: {
      draft: projects.filter((p) => p.status === "draft").length,
      "in-progress": projects.filter((p) => p.status === "in-progress").length,
      completed: projects.filter((p) => p.status === "completed").length,
      cancelled: projects.filter((p) => p.status === "cancelled").length,
    },
    totalBudget: projects.reduce((sum, p) => sum + p.budget.amount, 0),
  };
};
```

### 2. Cotizaciones

```typescript
// Integración con métricas de cotizaciones
export const getQuoteMetrics = async (userId: string) => {
  const quotes = await getUserQuotes(userId);

  return {
    total: quotes.length,
    byStatus: {
      draft: quotes.filter((q) => q.status === "draft").length,
      sent: quotes.filter((q) => q.status === "sent").length,
      approved: quotes.filter((q) => q.status === "approved").length,
      rejected: quotes.filter((q) => q.status === "rejected").length,
    },
    conversionRate:
      quotes.length > 0
        ? (quotes.filter((q) => q.status === "approved").length /
            quotes.length) *
          100
        : 0,
  };
};
```

## Próximos Pasos

### 1. Funcionalidades Adicionales

- **Filtros temporales**: Seleccionar período de análisis
- **Comparativas**: Comparar con períodos anteriores
- **Metas**: Establecer y seguir metas de ingresos
- **Notificaciones**: Alertas de métricas importantes

### 2. Mejoras de Visualización

- **Gráficos interactivos**: Zoom, hover, tooltips
- **Temas**: Modo oscuro/claro
- **Responsive**: Mejor adaptación móvil
- **Exportación**: Descargar reportes en PDF

### 3. Analytics Avanzados

- **Predicciones**: Estimación de ingresos futuros
- **Análisis de clientes**: Clientes más rentables
- **Tendencias**: Análisis de estacionalidad
- **KPIs personalizados**: Métricas específicas del negocio

## Troubleshooting

### Problemas Comunes

1. **Métricas no se cargan**

   - Verificar conexión a Firebase
   - Revisar permisos de Firestore
   - Comprobar que el usuario esté autenticado

2. **Gráficos no se renderizan**

   - Verificar instalación de Chart.js
   - Revisar datos de entrada
   - Comprobar configuración de opciones

3. **Cálculos incorrectos**
   - Verificar lógica de filtrado de fechas
   - Revisar formato de datos en Firestore
   - Comprobar conversiones de moneda

### Logs de Debug

```typescript
// Habilitar logs detallados
console.log("Dashboard Metrics:", metrics);
console.log("Projects Data:", projects);
console.log("Weekly Income:", weeklyIncome);
```

## Conclusión

El sistema de dashboard proporciona una vista completa y en tiempo real del negocio del freelancer. La integración con todos los módulos asegura que la información sea consistente y actualizada, mientras que las visualizaciones ayudan a tomar decisiones informadas sobre el negocio.
