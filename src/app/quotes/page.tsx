"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";
import QuotesComponent from "../../components/quotes/QuotesComponent";

export default function QuotesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <QuotesComponent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
