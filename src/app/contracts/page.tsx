"use client";

import DashboardLayout from "../../components/layout/DashboardLayout";
import ContractsComponent from "../../components/contracts/ContractsComponent";

export default function ContractsPage() {
  return (
    <DashboardLayout>
      <div className="w-full">
        <ContractsComponent />
      </div>
    </DashboardLayout>
  );
}
