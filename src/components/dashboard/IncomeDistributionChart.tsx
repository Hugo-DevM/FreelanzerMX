"use client";

import React from "react";
import Card from "../ui/Card";
import { IncomeDistribution } from "../../types/dashboard";

interface IncomeDistributionChartProps {
  data: IncomeDistribution[];
}

const IncomeDistributionChart: React.FC<IncomeDistributionChartProps> = ({
  data,
}) => {
  const colors = [
    "#2D2D2D",
    "#9ae700",
    "#ffac00",
    "#FF3E00",
    "#8B5CF6",
    "#06B6D4",
  ];

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const chartSize = 200;
  const strokeWidth = 25;
  const radius = chartSize / 2;
  const innerRadius = radius - strokeWidth / 2;
  const center = chartSize / 2;

  if (!data || data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Distribución de Ingresos
        </h3>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-5xl mb-4">🥧</div>
          <p className="text-[#666666] text-base mb-2">
            Aún no tienes ingresos registrados.
          </p>
          <p className="text-sm text-[#A0A0A0]">
            Cuando registres tus primeros ingresos, verás aquí la distribución.
          </p>
        </div>
      </Card>
    );
  }

  // Mostrar círculo completo si hay solo un dato
  if (data.length === 1) {
    const item = data[0];
    const color = colors[0];

    return (
      <Card>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Distribución de Ingresos
        </h3>

        <div className="flex flex-col items-center space-y-20">
          <div
            className="relative"
            style={{ width: chartSize, height: chartSize }}
          >
            <svg
              width={chartSize}
              height={chartSize}
              viewBox={`0 0 ${chartSize} ${chartSize}`}
              className="transform -rotate-90"
            >
              <circle
                cx={center}
                cy={center}
                r={innerRadius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={2 * Math.PI * innerRadius}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-semibold text-[#1A1A1A]">
                  ${totalAmount.toLocaleString()}
                </div>
                <div className="text-sm text-[#666666]">Total</div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-[#666666] truncate">
                  {item.category}
                </span>
                <span className="text-sm font-medium text-[#1A1A1A] ml-auto">
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Si hay más de un dato, renderizar como anillos separados
  let currentAngle = 0;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
        Distribución de Ingresos
      </h3>

      <div className="flex flex-col items-center space-y-20">
        <div
          className="relative"
          style={{ width: chartSize, height: chartSize }}
        >
          <svg
            width={chartSize}
            height={chartSize}
            viewBox={`0 0 ${chartSize} ${chartSize}`}
            className="transform -rotate-90"
          >
            {data.map((item, index) => {
              const percentage = item.percentage;
              const angle = (percentage / 100) * 360;

              const x1 =
                center + innerRadius * Math.cos((currentAngle * Math.PI) / 180);
              const y1 =
                center + innerRadius * Math.sin((currentAngle * Math.PI) / 180);
              const x2 =
                center +
                innerRadius *
                  Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 =
                center +
                innerRadius *
                  Math.sin(((currentAngle + angle) * Math.PI) / 180);
              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              ].join(" ");

              currentAngle += angle;

              return (
                <path
                  key={index}
                  d={pathData}
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-semibold text-[#1A1A1A]">
                ${totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-[#666666]">Total</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-[#666666] truncate">
                  {item.category}
                </span>
                <span className="text-sm font-medium text-[#1A1A1A] ml-auto">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IncomeDistributionChart;
