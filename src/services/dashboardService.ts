import { DashboardData } from "../types/dashboard";
import { getUserContracts } from "./contractService";
import { getUserQuotes } from "./quoteService";
import { getUserProjects } from "./projectService";
import { supabase } from "../lib/supabase";

function getMonthYear(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

function calculateTrend(current: number, last: number) {
  if (last === 0 && current > 0) return { trend: 100, isPositive: true };
  if (last === 0 && current === 0) return { trend: 0, isPositive: true };
  if (current === 0 && last > 0) return { trend: -100, isPositive: false };
  const trend = Math.round(((current - last) / last) * 100);
  return { trend, isPositive: trend >= 0 };
}

export const getDashboardData = async (
  userId: string
): Promise<DashboardData> => {
  const [contracts, quotes, projects] = await Promise.all([
    getUserContracts(userId),
    getUserQuotes(userId),
    getUserProjects(userId),
  ]);

  // Pagos Recibidos (número de ingresos mes a mes)
  let paymentsReceived = 0;
  let paymentsReceivedLastMonth = 0;
  let paymentsTrend = 0;
  let paymentsIsPositive = true;
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("id, tipo, fecha, user_id")
      .eq("user_id", userId)
      .eq("tipo", "ingreso");
    if (error) throw error;
    if (transactions) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      paymentsReceived = transactions.filter((t) => {
        const [year, month] = t.fecha.split("-");
        return Number(year) === currentYear && Number(month) === currentMonth;
      }).length;
      paymentsReceivedLastMonth = transactions.filter((t) => {
        const [year, month] = t.fecha.split("-");
        return Number(year) === lastMonthYear && Number(month) === lastMonth;
      }).length;
      const trendObj = calculateTrend(
        paymentsReceived,
        paymentsReceivedLastMonth
      );
      paymentsTrend = trendObj.trend;
      paymentsIsPositive = trendObj.isPositive;
    }
  } catch (e) {
    paymentsReceived = 0;
    paymentsReceivedLastMonth = 0;
    paymentsTrend = 0;
    paymentsIsPositive = true;
  }

  // Fechas
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Contratos
  const totalContracts = contracts.filter((c) => {
    const [year, month] = c.created_at.toISOString().split("T")[0].split("-");
    return Number(year) === currentYear && Number(month) === currentMonth;
  }).length;
  const contractsLastMonth = contracts.filter((c) => {
    const [year, month] = c.created_at.toISOString().split("T")[0].split("-");
    return Number(year) === lastMonthYear && Number(month) === lastMonth;
  }).length;
  const { trend: contractsTrend, isPositive: contractsIsPositive } =
    calculateTrend(totalContracts, contractsLastMonth);

  // Cotizaciones
  const quotesSent = quotes.filter((q) => {
    const [year, month] = q.created_at.toISOString().split("T")[0].split("-");
    return Number(year) === currentYear && Number(month) === currentMonth;
  }).length;
  const quotesLastMonth = quotes.filter((q) => {
    const [year, month] = q.created_at.toISOString().split("T")[0].split("-");
    return Number(year) === lastMonthYear && Number(month) === lastMonth;
  }).length;
  const { trend: quotesTrend, isPositive: quotesIsPositive } = calculateTrend(
    quotesSent,
    quotesLastMonth
  );

  // Proyectos activos
  const activeProjects = projects.filter(
    (p) =>
      (p.status === "in-progress" || p.status === "pending") &&
      p.createdAt.getFullYear() === currentYear &&
      p.createdAt.getMonth() + 1 === currentMonth
  ).length;
  const activeProjectsLastMonth = projects.filter(
    (p) =>
      (p.status === "in-progress" || p.status === "pending") &&
      p.createdAt.getFullYear() === lastMonthYear &&
      p.createdAt.getMonth() + 1 === lastMonth
  ).length;
  const { trend: projectsTrend, isPositive: projectsIsPositive } =
    calculateTrend(activeProjects, activeProjectsLastMonth);

  // Trabajos recientes: últimos 5 proyectos
  const mapProjectStatus = (
    status: string
  ): "pending" | "in_progress" | "completed" | "cancelled" => {
    switch (status) {
      case "pending":
        return "pending";
      case "in-progress":
        return "in_progress";
      case "completed":
        return "completed";
      default:
        return "pending";
    }
  };
  const recentWorks = projects.slice(0, 5).map((p, idx) => ({
    id: idx + 1,
    client: p.client,
    amount: p.amount || 0, // Usar el monto real del proyecto
    state: mapProjectStatus(p.status),
    date: p.createdAt.toISOString().split("T")[0],
  }));

  // Obtener ingresos y egresos de la tabla transactions para los gráficos
  let weeklyIncome: { week: string; amount: number }[] = [];
  let incomeDistribution: {
    category: string;
    percentage: number;
    amount: number;
  }[] = [];
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("monto, fecha, tipo, user_id")
      .eq("user_id", userId);
    if (error) throw error;
    if (transactions && transactions.length > 0) {
      // Agrupar por semana (usando la semana del año)
      const weekMap: { [week: string]: number } = {};
      transactions.forEach((t) => {
        if (t.tipo === "ingreso") {
          const date = new Date(t.fecha);
          // Obtener semana del año
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const pastDaysOfYear =
            (date.getTime() - firstDayOfYear.getTime()) / 86400000;
          const week = Math.ceil(
            (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
          );
          const weekLabel = `Sem ${week}`;
          weekMap[weekLabel] = (weekMap[weekLabel] || 0) + (t.monto || 0);
        }
      });
      weeklyIncome = Object.entries(weekMap).map(([week, amount]) => ({
        week,
        amount,
      }));
      // Ordenar por semana
      weeklyIncome.sort((a, b) =>
        a.week.localeCompare(b.week, undefined, { numeric: true })
      );
      // Distribución de ingresos y egresos
      const totalIngresos = transactions
        .filter((t) => t.tipo === "ingreso")
        .reduce((sum, t) => sum + (t.monto || 0), 0);
      const totalEgresos = transactions
        .filter((t) => t.tipo === "egreso")
        .reduce((sum, t) => sum + (t.monto || 0), 0);
      const total = totalIngresos + totalEgresos;
      if (total > 0) {
        incomeDistribution = [
          {
            category: "Ingresos",
            percentage: Math.round((totalIngresos / total) * 100),
            amount: totalIngresos,
          },
          {
            category: "Egresos",
            percentage: Math.round((totalEgresos / total) * 100),
            amount: totalEgresos,
          },
        ];
      } else {
        incomeDistribution = [
          { category: "Ingresos", percentage: 0, amount: 0 },
          { category: "Egresos", percentage: 0, amount: 0 },
        ];
      }
    }
  } catch (e) {
    weeklyIncome = [];
    incomeDistribution = [];
  }

  return {
    metrics: {
      totalContracts,
      contractsTrend,
      contractsIsPositive,
      quotesSent,
      quotesTrend,
      quotesIsPositive,
      paymentsReceived, // ingresos del mes actual
      paymentsTrend, // variación mes a mes
      paymentsIsPositive,
      paymentsReceivedLastMonth, // <-- lo agrego aquí
      activeProjects,
      projectsTrend,
      projectsIsPositive,
    },
    weeklyIncome,
    incomeDistribution,
    recentWorks,
  };
};
