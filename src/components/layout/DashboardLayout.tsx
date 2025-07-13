"use client";

import React, { useCallback } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = React.memo(
  ({ children }) => {
    // Memoizar el contenido principal para evitar re-renderizados
    const mainContent = useCallback(
      () => (
        <main className="ml-64 min-h-screen w-full bg-gray-100">
          {children}
        </main>
      ),
      [children]
    );

    return (
      <div className="flex">
        <Sidebar />
        {mainContent()}
      </div>
    );
  }
);

DashboardLayout.displayName = "DashboardLayout";

export default DashboardLayout;
