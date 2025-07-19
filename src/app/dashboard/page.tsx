"use client";

"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { DashboardSkeleton } from "../../components/ui/SkeletonLoader";
import { useDashboard } from "../../contexts/DashboardContext";
import { FileText, DollarSign, Briefcase, ClipboardList } from "lucide-react";

// Fragmentación de componentes pesados (charts)
const WeeklyIncomeChart = dynamic(
  () => import("../../components/dashboard/WeeklyIncomeChart"),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
      </div>
    ),
    ssr: false,
  }
);

const IncomeDistributionChart = dynamic(
  () => import("../../components/dashboard/IncomeDistributionChart"),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
      </div>
    ),
    ssr: false,
  }
);

// Componentes ligeros importados directamente
import MetricsCard from "../../components/dashboard/MetricsCard";
import RecentWorksTable from "../../components/dashboard/RecentWorksTable";

export default function DashboardPage() {
  const { dashboard, loading, error, fetched, fetchData } = useDashboard();

  useEffect(() => {
    if (!loading && !fetched) {
      fetchData();
    }
  }, [loading, fetched, fetchData]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <DashboardSkeleton />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !dashboard) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="w-full p-6">
            <div className="text-center py-8">
              <p className="text-red-500">
                {error || "No hay datos de dashboard."}
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const { metrics, weeklyIncome, incomeDistribution, recentWorks } = dashboard;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={<DashboardSkeleton />}>
          <div className="w-full p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Dashboard</h1>
              <p className="text-[#666666]">
                Resumen de tu actividad como freelancer
              </p>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="Contratos"
                value={metrics.totalContracts}
                icon={<FileText size={28} />}
                trend={{
                  value: metrics.contractsTrend,
                  isPositive: metrics.contractsIsPositive,
                }}
              />
              <MetricsCard
                title="Cotizaciones enviadas"
                value={metrics.quotesSent}
                icon={<ClipboardList size={28} />}
                trend={{
                  value: metrics.quotesTrend,
                  isPositive: metrics.quotesIsPositive,
                }}
              />
              <MetricsCard
                title="Pagos recibidos"
                value={metrics.paymentsReceived}
                icon={<DollarSign size={28} />}
                trend={{
                  value: metrics.paymentsTrend,
                  isPositive: metrics.paymentsIsPositive,
                }}
              />
              <MetricsCard
                title="Proyectos activos"
                value={metrics.activeProjects}
                icon={<Briefcase size={28} />}
                trend={{
                  value: metrics.projectsTrend,
                  isPositive: metrics.projectsIsPositive,
                }}
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeeklyIncomeChart data={weeklyIncome} />
              <IncomeDistributionChart data={incomeDistribution} />
            </div>

            {/* Tabla de trabajos recientes */}
            <RecentWorksTable data={recentWorks} />
          </div>
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
