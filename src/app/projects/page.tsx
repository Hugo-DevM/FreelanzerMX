"use client";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ProjectsComponent from "../../components/projects/ProjectsComponent";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="w-full bg-amber-300">
          <ProjectsComponent />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
