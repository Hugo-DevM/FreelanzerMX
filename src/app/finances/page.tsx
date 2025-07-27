"use client";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import FinancesComponent from "../../components/finances/FinancesComponent";

export default function FinancesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FinancesComponent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
