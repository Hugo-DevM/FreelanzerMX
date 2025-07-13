"use client";

import { useAuthContext } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import MetricsCard from "../../components/dashboard/MetricsCard";
import WeeklyIncomeChart from "../../components/dashboard/WeeklyIncomeChart";
import IncomeDistributionChart from "../../components/dashboard/IncomeDistributionChart";
import RecentWorksTable from "../../components/dashboard/RecentWorksTable";
import {
  ContractIcon,
  QuoteIcon,
  PaymentIcon,
  ProjectIcon,
} from "../../components/ui/icons";
import { getDashboardData } from "../../services/dashboardService";
import { DashboardData } from "../../types/dashboard";
import { useEffect, useState } from "react";

function DashboardContent() {
  const { user, signOut } = useAuthContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user) return;
        const data = await getDashboardData(user.uid);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-[#666666]">Error loading dashboard data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div>
        {/* Header */}
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Contratos Totales"
            value={dashboardData.metrics.totalContracts}
            icon={<ContractIcon />}
            trend={{
              value: dashboardData.metrics.contractsTrend,
              isPositive: dashboardData.metrics.contractsIsPositive,
            }}
          />
          <MetricsCard
            title="Cotizaciones Enviadas"
            value={dashboardData.metrics.quotesSent}
            icon={<QuoteIcon />}
            trend={{
              value: dashboardData.metrics.quotesTrend,
              isPositive: dashboardData.metrics.quotesIsPositive,
            }}
          />
          <MetricsCard
            title="Pagos Recibidos"
            value={dashboardData.metrics.paymentsReceived}
            icon={<PaymentIcon />}
            trend={{
              value: dashboardData.metrics.paymentsTrend,
              isPositive: dashboardData.metrics.paymentsIsPositive,
              lastValue: dashboardData.metrics.paymentsReceivedLastMonth,
            }}
          />
          <MetricsCard
            title="Proyectos Activos"
            value={dashboardData.metrics.activeProjects}
            icon={<ProjectIcon />}
            trend={{
              value: dashboardData.metrics.projectsTrend,
              isPositive: dashboardData.metrics.projectsIsPositive,
            }}
          />
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeeklyIncomeChart data={dashboardData.weeklyIncome} />
          <IncomeDistributionChart data={dashboardData.incomeDistribution} />
        </div>
        {/* Recent Works Table */}
        <div className="mb-8">
          <RecentWorksTable data={dashboardData.recentWorks} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
