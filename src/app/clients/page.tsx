"use client";

import { useAuthContext } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";

function ClientsContent() {
  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Proyectos</h1>
          <p className="text-[#666666]">Gestiona tus proyectos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">TC</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">TechCorp Solutions</h3>
                <p className="text-[#666666]">techcorp@email.com</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">DI</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Digital Innovations</h3>
                <p className="text-[#666666]">info@digitalinnovations.com</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">GS</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Global Systems Inc</h3>
                <p className="text-[#666666]">contact@globalsystems.com</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ClientsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
} 