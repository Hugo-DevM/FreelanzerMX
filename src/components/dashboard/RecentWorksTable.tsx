"use client";

import React from "react";
import Card from "../ui/Card";
import { RecentWork } from "../../types/dashboard";
import { useRouter } from "next/navigation";

interface RecentWorksTableProps {
  data: RecentWork[];
}

const RecentWorksTable: React.FC<RecentWorksTableProps> = ({ data }) => {
  const router = useRouter();
  const getStateBadge = (state: RecentWork["state"]) => {
    const stateConfig = {
      completed: {
        label: "Completado",
        className: "bg-[#10B981] text-white",
      },
      in_progress: {
        label: "En Progreso",
        className: "bg-[#F59E0B] text-white",
      },
      pending: {
        label: "Pendiente",
        className: "bg-[#6B7280] text-white",
      },
      cancelled: {
        label: "Cancelado",
        className: "bg-[#EF4444] text-white",
      },
    };

    const config = stateConfig[state];
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-md ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="shadow-md border border-[#F1F1F1]">
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
        Trabajos Recientes
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[#666666]">
                Nombre
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#666666]">
                Cliente
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#666666]">
                Monto
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#666666]">
                Estado
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[#666666]">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((work, index) => (
              <tr
                key={work.id}
                className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              >
                <td className="py-3 px-4 text-sm text-[#1A1A1A] font-medium">
                  #{index + 1}
                </td>
                <td className="py-3 px-4 text-sm text-[#1A1A1A]">
                  {work.client}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-[#1A1A1A]">
                  ${work.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4">{getStateBadge(work.state)}</td>
                <td className="py-3 px-4 text-sm text-[#666666]">
                  {formatDate(work.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#666666]">
            Mostrando {data.length} de {data.length} trabajos
          </span>
          <button
            className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
            onClick={() => router.push("/projects")}
          >
            Ver todos
          </button>
        </div>
      </div>
    </Card>
  );
};

export default RecentWorksTable;
