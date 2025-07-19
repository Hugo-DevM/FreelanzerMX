"use client";

import { Suspense, lazy } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

const FinancesComponent = lazy(
  () => import("../../components/finances/FinancesComponent")
);

export default function FinancesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={<div className="p-8">Cargando finanzas...</div>}>
          <FinancesComponent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
