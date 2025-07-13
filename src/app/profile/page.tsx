"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";
import UserProfileComponent from "../../components/profile/UserProfile";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserProfileComponent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
