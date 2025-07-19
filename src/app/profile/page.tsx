"use client";

import { Suspense, lazy } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

const ProfileComponent = lazy(
  () => import("../../components/profile/ProfileComponent")
);

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={<div className="p-8">Cargando perfil...</div>}>
          <ProfileComponent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
