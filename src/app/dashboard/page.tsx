"use client";

import { useEffect } from "react";
import { useDashboard } from "../../contexts/DashboardContext";
import MetricsCard from "../../components/dashboard/MetricsCard";
import WeeklyIncomeChart from "../../components/dashboard/WeeklyIncomeChart";
import IncomeDistributionChart from "../../components/dashboard/IncomeDistributionChart";
import RecentWorksTable from "../../components/dashboard/RecentWorksTable";
import { FileText, DollarSign, Briefcase, ClipboardList } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function DashboardPage() {
  const { dashboard, loading, error, fetched, fetchData, refreshData } =
    useDashboard();

  useEffect(() => {
    if (!loading && !fetched) {
      fetchData();
    }
  }, [loading, fetched, fetchData]);

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-8">Cargando dashboard...</div>
      </DashboardLayout>
    );
  if (error)
    return (
      <DashboardLayout>
        <div className="p-8 text-red-500">{error}</div>
      </DashboardLayout>
    );
  if (!dashboard)
    return (
      <DashboardLayout>
        <div className="p-8">No hay datos de dashboard.</div>
      </DashboardLayout>
    );

  const { metrics, weeklyIncome, incomeDistribution, recentWorks } = dashboard;

  return (
    <DashboardLayout>
      <div className="p-4 w-full space-y-8">
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

        {/* Gráficas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeeklyIncomeChart data={weeklyIncome} />
          <IncomeDistributionChart data={incomeDistribution} />
        </div>

        {/* Trabajos recientes */}
        <RecentWorksTable data={recentWorks} />
      </div>
    </DashboardLayout>
  );
}
