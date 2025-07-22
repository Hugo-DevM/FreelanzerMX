import { DashboardData } from "../types/dashboard";
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
  // Fechas
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Contratos: contar por mes actual y anterior
  const { count: totalContracts, error: contractsError } = await supabase
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte(
      "created_at",
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
    )
    .lte(
      "created_at",
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`
    );
  const { count: contractsLastMonth, error: contractsLastError } =
    await supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte(
        "created_at",
        `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-01`
      )
      .lte(
        "created_at",
        `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-31`
      );
  const { trend: contractsTrend, isPositive: contractsIsPositive } =
    calculateTrend(totalContracts || 0, contractsLastMonth || 0);

  // Cotizaciones: contar por mes actual y anterior
  const { count: quotesSent, error: quotesError } = await supabase
    .from("quotes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte(
      "created_at",
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
    )
    .lte(
      "created_at",
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`
    );
  const { count: quotesLastMonth, error: quotesLastError } = await supabase
    .from("quotes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte(
      "created_at",
      `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-01`
    )
    .lte(
      "created_at",
      `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-31`
    );
  const { trend: quotesTrend, isPositive: quotesIsPositive } = calculateTrend(
    quotesSent || 0,
    quotesLastMonth || 0
  );

  // Proyectos activos: contar por mes actual y anterior
  const { count: activeProjects, error: projectsError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["in-progress", "pending"])
    .gte(
      "created_at",
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
    )
    .lte(
      "created_at",
      `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`
    );
  const { count: activeProjectsLastMonth, error: projectsLastError } =
    await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["in-progress", "pending"])
      .gte(
        "created_at",
        `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-01`
      )
      .lte(
        "created_at",
        `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-31`
      );
  const { trend: projectsTrend, isPositive: projectsIsPositive } =
    calculateTrend(activeProjects || 0, activeProjectsLastMonth || 0);

  // Pagos recibidos: contar por mes actual y anterior
  let paymentsReceived = 0;
  let paymentsReceivedLastMonth = 0;
  let paymentsTrend = 0;
  let paymentsIsPositive = true;
  try {
    const { count: paymentsCurrent, error: paymentsError } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("tipo", "ingreso")
      .gte(
        "fecha",
        `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
      )
      .lte(
        "fecha",
        `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`
      );
    const { count: paymentsLast, error: paymentsLastError } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("tipo", "ingreso")
      .gte("fecha", `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-01`)
      .lte(
        "fecha",
        `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-31`
      );
    paymentsReceived = paymentsCurrent || 0;
    paymentsReceivedLastMonth = paymentsLast || 0;
    const trendObj = calculateTrend(
      paymentsReceived,
      paymentsReceivedLastMonth
    );
    paymentsTrend = trendObj.trend;
    paymentsIsPositive = trendObj.isPositive;
  } catch (e) {
    paymentsReceived = 0;
    paymentsReceivedLastMonth = 0;
    paymentsTrend = 0;
    paymentsIsPositive = true;
  }

  // Trabajos recientes: últimos 5 proyectos
  const { data: recentProjects, error: recentProjectsError } = await supabase
    .from("projects")
    .select("id, client, amount, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
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
  const recentWorks = (recentProjects || []).map((p: any, idx: number) => ({
    id: p.id,
    client: p.client,
    amount: p.amount || 0,
    state: mapProjectStatus(p.status),
    date: p.created_at.split("T")[0],
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
      weeklyIncome = Object.entries(weekMap)
        .map(([week, amount]) => ({ week, amount }))
        .sort((a, b) => {
          const numA = parseInt(a.week.split(" ")[1]);
          const numB = parseInt(b.week.split(" ")[1]);
          return numA - numB;
        });
      // Si solo hay un ingreso, agregar semana previa con 0 para graficar línea
      if (weeklyIncome.length === 1) {
        const currentWeekNumber = parseInt(weeklyIncome[0].week.split(" ")[1]);
        if (currentWeekNumber > 1) {
          weeklyIncome.unshift({
            week: `Sem ${currentWeekNumber - 1}`,
            amount: 0,
          });
        }
      }
      // Reasignar semana como Sem 0, Sem 1, Sem 2...
      weeklyIncome = weeklyIncome.map((entry, index) => ({
        week: `Sem ${index}`,
        amount: entry.amount,
      }));
      // Distribución de ingresos y egresos
      const totalIngresos = transactions
        .filter((t) => t.tipo === "ingreso")
        .reduce((sum, t) => sum + (t.monto || 0), 0);
      const totalEgresos = transactions
        .filter((t) => t.tipo === "egreso")
        .reduce((sum, t) => sum + (t.monto || 0), 0);
      const total = totalIngresos + totalEgresos;
      if (total > 0) {
        if (totalIngresos > 0 && totalEgresos === 0) {
          incomeDistribution = [
            {
              category: "Ingresos",
              percentage: 100,
              amount: totalIngresos,
            },
          ];
        } else if (totalEgresos > 0 && totalIngresos === 0) {
          incomeDistribution = [
            {
              category: "Egresos",
              percentage: 100,
              amount: totalEgresos,
            },
          ];
        } else {
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
        }
      }
    }
  } catch (e) {
    weeklyIncome = [];
    incomeDistribution = [];
  }

  return {
    metrics: {
      totalContracts: totalContracts || 0,
      contractsTrend,
      contractsIsPositive,
      quotesSent: quotesSent || 0,
      quotesTrend,
      quotesIsPositive,
      paymentsReceived, // ingresos del mes actual
      paymentsTrend, // variación mes a mes
      paymentsIsPositive,
      paymentsReceivedLastMonth, // <-- lo agrego aquí
      activeProjects: activeProjects || 0,
      projectsTrend,
      projectsIsPositive,
    },
    weeklyIncome,
    incomeDistribution,
    recentWorks,
  };
};
