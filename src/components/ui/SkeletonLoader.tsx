"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width = "w-full",
  height = "h-4",
}) => (
  <div
    className={`${width} ${height} bg-gray-200 animate-pulse rounded ${className}`}
  />
);

// Skeleton para tarjetas de proyecto
export const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <Skeleton width="w-3/4" height="h-6" />
      <Skeleton width="w-16" height="h-6" />
    </div>
    <Skeleton width="w-full" height="h-4" className="mb-2" />
    <Skeleton width="w-2/3" height="h-4" className="mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton width="w-20" height="h-8" />
      <Skeleton width="w-24" height="h-8" />
    </div>
  </div>
);

// Skeleton para lista de proyectos
export const ProjectListSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <ProjectCardSkeleton key={index} />
    ))}
  </div>
);

// Skeleton para tabla de cotizaciones
export const QuoteTableSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <Skeleton width="w-1/3" height="h-6" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="p-6 flex items-center justify-between">
          <div className="flex-1">
            <Skeleton width="w-1/2" height="h-4" className="mb-2" />
            <Skeleton width="w-1/3" height="h-3" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton width="w-20" height="h-6" />
            <Skeleton width="w-16" height="h-8" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para dashboard
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <Skeleton width="w-1/2" height="h-4" className="mb-2" />
          <Skeleton width="w-1/3" height="h-8" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Skeleton width="w-1/3" height="h-6" className="mb-4" />
        <Skeleton width="w-full" height="h-64" />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Skeleton width="w-1/3" height="h-6" className="mb-4" />
        <Skeleton width="w-full" height="h-64" />
      </div>
    </div>
  </div>
);

export default Skeleton;
