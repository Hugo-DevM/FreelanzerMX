export interface DashboardMetrics {
  totalContracts: number;
  contractsTrend: number;
  contractsIsPositive: boolean;
  quotesSent: number;
  quotesTrend: number;
  quotesIsPositive: boolean;
  paymentsReceived: number;
  paymentsTrend: number;
  paymentsIsPositive: boolean;
  paymentsReceivedLastMonth: number;
  activeProjects: number;
  projectsTrend: number;
  projectsIsPositive: boolean;
}

export interface WeeklyIncome {
  week: string;
  amount: number;
}

export interface IncomeDistribution {
  category: string;
  percentage: number;
  amount: number;
}

export interface RecentWork {
  id: number;
  client: string;
  amount: number;
  state: "completed" | "in_progress" | "pending" | "cancelled";
  date: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  weeklyIncome: WeeklyIncome[];
  incomeDistribution: IncomeDistribution[];
  recentWorks: RecentWork[];
}
