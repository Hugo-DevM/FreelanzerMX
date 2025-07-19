"use client";

import DashboardLayout from "../../components/layout/DashboardLayout";
import dynamic from "next/dynamic";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600]"></div>
    <span className="ml-3 text-[#666666]">Cargando proyectos...</span>
  </div>
);

const ProjectsComponent = dynamic(
  () => import("../../components/projects/ProjectsComponent"),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="w-full">
          <ProjectsComponent />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
