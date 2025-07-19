"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";

const QuotesComponent = dynamic(
  () => import("../../components/quotes/QuotesComponent"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9ae600]"></div>
        <span className="ml-3 text-[#666666]">Cargando cotizaciones...</span>
      </div>
    ),
    ssr: false,
  }
);

export default function QuotesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9ae600]"></div>
              <span className="ml-3 text-[#666666]">
                Cargando cotizaciones...
              </span>
            </div>
          }
        >
          <QuotesComponent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
