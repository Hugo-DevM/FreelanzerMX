"use client";

import { useParams } from "next/navigation";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import ProjectDetailComponent from "../../../components/projects/ProjectDetailComponent";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProjectDetailComponent projectId={projectId} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
