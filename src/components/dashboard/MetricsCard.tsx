"use client";

import React from "react";
import Card from "../ui/Card";

interface MetricsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    totalMovements?: number;
    lastValue?: number;
  };
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon,
  trend,
}) => {
  return (
    <Card className="relative overflow-hidden shadow-md border border-[#F1F1F1]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#666666] mb-1">{title}</p>
          <p className="text-2xl font-semibold text-[#1A1A1A]">
            {value.toLocaleString()}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-[#10B981]" : "text-[#EF4444]"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-[#666666] ml-1">vs ultimo mes</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-12 h-12 bg-[#9ae700] rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default MetricsCard;
