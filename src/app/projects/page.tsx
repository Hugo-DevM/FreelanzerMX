"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600]"></div>
    <span className="ml-3 text-[#666666]">Cargando proyectos...</span>
  </div>
);

// Lazy load del componente de proyectos
const ProjectsComponent = dynamic(
  () => import("../../components/projects/ProjectsComponent"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Deshabilitar SSR para mejor performance en cliente
  }
);

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="w-full">
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectsComponent />
          </Suspense>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
