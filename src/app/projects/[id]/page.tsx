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
        <div className="w-full bg-amber-300">
          <ProjectDetailComponent projectId={projectId} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
