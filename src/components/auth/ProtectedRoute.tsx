"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    // return (
    //   <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center">
    //     <div className="text-center">
    //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600] mx-auto mb-4"></div>
    //       <p className="text-[#6B7280]">Cargando...</p>
    //     </div>
    //   </div>
    // );
    return null;
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600] mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
