import { DashboardData } from "../types/dashboard";
import { supabase } from "../lib/supabase";
import { isRateLimitError } from "../lib/supabaseHelpers";

// 🔹 Obtener último día real del mes
function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

// 🔹 Cálculo de tendencia
function calculateTrend(current: number, last: number) {
  if (last === 0 && current > 0) return { trend: 100, isPositive: true };
  if (last === 0 && current === 0) return { trend: 0, isPositive: true };
  if (current === 0 && last > 0) return { trend: -100, isPositive: false };
  const trend = Math.round(((current - last) / last) * 100);
  return { trend, isPositive: trend >= 0 };
}

export const getDashboardData = async (userId: string): Promise<DashboardData> => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const currentEndDay = getLastDayOfMonth(currentYear, currentMonth);
  const lastEndDay = getLastDayOfMonth(lastMonthYear, lastMonth);

  const currentStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const currentEnd = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${currentEndDay}`;
  const lastStart = `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-01`;
  const lastEnd = `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-${lastEndDay}`;

  // -------------------------------
  // 🚀 1️⃣ OPTIMIZACIÓN: Reducir de 8 a 4 consultas usando rangos de fechas combinados
  // -------------------------------
  try {
    const [
      contractsData,
      quotesData,
      projectsData,
      transactionsData,
    ] = await Promise.all([
      // Una consulta para contratos de ambos meses
      supabase
        .from("contracts")
        .select("id, created_at")
        .eq("user_id", userId)
        .gte("created_at", lastStart)
        .lte("created_at", currentEnd),
      
      // Una consulta para cotizaciones de ambos meses
      supabase
        .from("quotes")
        .select("id, created_at")
        .eq("user_id", userId)
        .gte("created_at", lastStart)
        .lte("created_at", currentEnd),
      
      // Una consulta para proyectos de ambos meses
      supabase
        .from("projects")
        .select("id, created_at, status")
        .eq("user_id", userId)
        .in("status", ["in-progress", "pending"])
        .gte("created_at", lastStart)
        .lte("created_at", currentEnd),
      
      // Una consulta para transacciones de ambos meses
      supabase
        .from("transactions")
        .select("id, fecha, tipo")
        .eq("user_id", userId)
        .eq("tipo", "ingreso")
        .gte("fecha", lastStart)
        .lte("fecha", currentEnd),
    ]);

    // Procesar los datos en memoria para separar meses
    const contractsNow = { 
      count: contractsData.data?.filter((c: any) => 
        c.created_at >= currentStart && c.created_at <= currentEnd
      ).length || 0 
    };
    const contractsLast = { 
      count: contractsData.data?.filter((c: any) => 
        c.created_at >= lastStart && c.created_at <= lastEnd
      ).length || 0 
    };
    
    const quotesNow = { 
      count: quotesData.data?.filter((q: any) => 
        q.created_at >= currentStart && q.created_at <= currentEnd
      ).length || 0 
    };
    const quotesLast = { 
      count: quotesData.data?.filter((q: any) => 
        q.created_at >= lastStart && q.created_at <= lastEnd
      ).length || 0 
    };

    const projectsNow = { 
      count: projectsData.data?.filter((p: any) => 
        p.created_at >= currentStart && p.created_at <= currentEnd
      ).length || 0 
    };
    const projectsLast = { 
      count: projectsData.data?.filter((p: any) => 
        p.created_at >= lastStart && p.created_at <= lastEnd
      ).length || 0 
    };

    const paymentsNow = { 
      count: transactionsData.data?.filter((t: any) => 
        t.fecha >= currentStart && t.fecha <= currentEnd
      ).length || 0 
    };
    const paymentsLast = { 
      count: transactionsData.data?.filter((t: any) => 
        t.fecha >= lastStart && t.fecha <= lastEnd
      ).length || 0 
    };

    // Tendencias
    const { trend: contractsTrend, isPositive: contractsIsPositive } =
      calculateTrend(contractsNow.count || 0, contractsLast.count || 0);
    const { trend: quotesTrend, isPositive: quotesIsPositive } =
      calculateTrend(quotesNow.count || 0, quotesLast.count || 0);
    const { trend: projectsTrend, isPositive: projectsIsPositive } =
      calculateTrend(projectsNow.count || 0, projectsLast.count || 0);
    const { trend: paymentsTrend, isPositive: paymentsIsPositive } =
      calculateTrend(paymentsNow.count || 0, paymentsLast.count || 0);

    // -------------------------------
    // 🚀 2️⃣ CONSULTA: Últimos proyectos
    // -------------------------------
    const { data: recentProjects } = await supabase
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

    const recentWorks = (recentProjects || []).map((p: any) => ({
      id: p.id,
      client: p.client,
      amount: p.amount || 0,
      state: mapProjectStatus(p.status),
      date: p.created_at?.split("T")[0],
    }));

    // -------------------------------
    // 🚀 3️⃣ CONSULTA: Transacciones para gráficos
    // -------------------------------
    const { data: transactions } = await supabase
      .from("transactions")
      .select("monto, fecha, tipo")
      .eq("user_id", userId);

    // Gráficas semanales + distribución
    let weeklyIncome: { week: string; amount: number }[] = [];
    let incomeDistribution: { category: string; percentage: number; amount: number }[] = [];

    if (transactions && transactions.length > 0) {
      const weekMap: { [week: string]: number } = {};
      transactions.forEach((t: { tipo: string; fecha: string; monto: number }) => {
        if (t.tipo === "ingreso") {
          const date = new Date(t.fecha);
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
          const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          const weekLabel = `Sem ${week}`;
          weekMap[weekLabel] = (weekMap[weekLabel] || 0) + (t.monto || 0);
        }
      });

      weeklyIncome = Object.entries(weekMap)
        .map(([week, amount]) => ({ week, amount }))
        .sort((a, b) => parseInt(a.week.split(" ")[1]) - parseInt(b.week.split(" ")[1]));

      if (weeklyIncome.length === 1) {
        const currentWeekNumber = parseInt(weeklyIncome[0].week.split(" ")[1]);
        if (currentWeekNumber > 1) {
          weeklyIncome.unshift({ week: `Sem ${currentWeekNumber - 1}`, amount: 0 });
        }
      }

      weeklyIncome = weeklyIncome.map((entry, index) => ({
        week: `Sem ${index}`,
        amount: entry.amount,
      }));

      const totalIngresos = transactions
        .filter((t: { tipo: string; monto: number }) => t.tipo === "ingreso")
        .reduce((sum: number, t: { monto: number }) => sum + (t.monto || 0), 0);

      const totalEgresos = transactions
        .filter((t: { tipo: string; monto: number }) => t.tipo === "egreso")
        .reduce((sum: number, t: { monto: number }) => sum + (t.monto || 0), 0);

      const total = totalIngresos + totalEgresos;
      if (total > 0) {
        if (totalIngresos > 0 && totalEgresos === 0) {
          incomeDistribution = [{ category: "Ingresos", percentage: 100, amount: totalIngresos }];
        } else if (totalEgresos > 0 && totalIngresos === 0) {
          incomeDistribution = [{ category: "Egresos", percentage: 100, amount: totalEgresos }];
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

    // -------------------------------
    // ✅ Resultado final
    // -------------------------------
    return {
      metrics: {
        totalContracts: contractsNow.count || 0,
        contractsTrend,
        contractsIsPositive,
        quotesSent: quotesNow.count || 0,
        quotesTrend,
        quotesIsPositive,
        paymentsReceived: paymentsNow.count || 0,
        paymentsTrend,
        paymentsIsPositive,
        paymentsReceivedLastMonth: paymentsLast.count || 0,
        activeProjects: projectsNow.count || 0,
        projectsTrend,
        projectsIsPositive,
      },
      weeklyIncome,
      incomeDistribution,
      recentWorks,
    };
  } catch (error: any) {
    if (isRateLimitError(error)) {
      console.error("Rate limit alcanzado. Intenta de nuevo en unos momentos.");
      throw new Error("Demasiadas solicitudes. Por favor espera unos momentos e intenta de nuevo.");
    }
    console.error("Error en getDashboardData:", error);
    throw error;
  }
};
