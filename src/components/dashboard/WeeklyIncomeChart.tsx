"use client";

import React from "react";
import Card from "../ui/Card";
import { WeeklyIncome } from "../../types/dashboard";

interface WeeklyIncomeChartProps {
  data: WeeklyIncome[];
}

const WeeklyIncomeChart: React.FC<WeeklyIncomeChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Ingresos Semanales
        </h3>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-5xl mb-4">📉</div>
          <p className="text-[#666666] text-base mb-2">
            Aún no tienes ingresos registrados.
          </p>
          <p className="text-sm text-[#A0A0A0]">
            Cuando registres tus primeros ingresos, verás aquí tu gráfica
            semanal.
          </p>
        </div>
      </Card>
    );
  }

  const maxAmount = Math.max(...data.map((item) => item.amount));
  const chartWidth = 600;
  const chartHeight = 400;
  const padding = 60;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * graphWidth;
    const y = padding + graphHeight - (item.amount / maxAmount) * graphHeight;
    return { x, y, amount: item.amount, week: item.week };
  });

  const pathData = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    })
    .join(" ");

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
        Ingresos Semanales
      </h3>

      <div className="relative">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full max-w-full"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * graphHeight) / 4}
              x2={chartWidth - padding}
              y2={padding + (i * graphHeight) / 4}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => (
            <text
              key={i}
              x={padding - 10}
              y={padding + (i * graphHeight) / 4 + 4}
              textAnchor="end"
              className="text-xs fill-[#666666]"
            >
              ${Math.round((maxAmount * (4 - i)) / 4).toLocaleString()}
            </text>
          ))}

          {/* Line chart */}
          <path
            d={pathData}
            stroke="#000000"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#9ae700"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-[#666666]"
            >
              {point.week}
            </text>
          ))}
        </svg>

        {/* Tooltip on hover */}
        <div className="absolute inset-0 pointer-events-none">
          {points.map((point, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto"
              style={{
                left: `${(point.x / chartWidth) * 100}%`,
                top: `${(point.y / chartHeight) * 100}%`,
              }}
            >
              <div className="bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                ${point.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#666666]">Total del período:</span>
          <span className="text-lg font-semibold text-[#1A1A1A]">
            ${data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default WeeklyIncomeChart;
