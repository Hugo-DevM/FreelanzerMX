import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FileText } from "lucide-react";

const InvoicesPage = () => (
  <DashboardLayout>
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="bg-white shadow-md rounded-xl px-8 py-12 flex flex-col items-center">
        <FileText size={48} className="mb-4 text-lime-500" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Facturas</h2>
        <p className="text-gray-500 text-lg mb-2 text-center">
          Próximamente podrás gestionar y visualizar tus facturas desde aquí.
        </p>
        <span className="text-xs text-gray-400">
          ¡Estamos trabajando en esta funcionalidad!
        </span>
      </div>
    </div>
  </DashboardLayout>
);

export default InvoicesPage;
