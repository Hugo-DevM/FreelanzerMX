"use client";

import DashboardLayout from "../../components/layout/DashboardLayout";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600]"></div>
    <span className="ml-3 text-[#666666]">Cargando contratos...</span>
  </div>
);

// Lazy load del componente de contratos
const ContractsComponent = dynamic(
  () => import("../../components/contracts/ContractsComponent"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export default function ContractsPage() {
  return (
    <DashboardLayout>
      <div className="w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <ContractsComponent />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
