"use client";

import React from "react";
import { Project } from "../../types/project";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { EyeIcon } from "../ui/icons";

interface ProjectCardProps {
  project: Project;
  onViewProject: (projectId: string) => void;
  getStatusColor: (status: Project["status"]) => string;
  getStatusText: (status: Project["status"]) => string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewProject,
  getStatusColor,
  getStatusText,
}) => {
  const formatDate = (date: string | Date | undefined | null) => {
    if (!date) return "Sin fecha";
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, m, d] = date.split("-");
      return `${d}/${m}/${y}`;
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
      const dd = date.getDate().toString().padStart(2, "0");
      const mm = (date.getMonth() + 1).toString().padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    return "Sin fecha";
  };

  const getPriorityColor = (priority: Project["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityText = (priority: Project["priority"]) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Desconocida";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#F1F1F1] p-6 flex flex-col gap-2 transition-shadow hover:shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              {project.name}
            </h3>
            <p className="text-[#666666] text-sm mb-2">{project.client}</p>
            {project.description && (
              <p className="text-[#666666] text-sm mb-3 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          {project.createdFromContract && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              Desde Contrato
            </span>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#666666]">Estado:</span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                project.status
              )}`}
            >
              {getStatusText(project.status)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-[#666666]">Prioridad:</span>
            <span
              className={`text-xs font-medium ${getPriorityColor(
                project.priority
              )}`}
            >
              {getPriorityText(project.priority)}
            </span>
          </div>

          {project.dueDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#666666]">Fecha límite:</span>
              <span className="text-xs text-[#666666]">
                {formatDate(project.dueDate)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-[#666666]">Progreso:</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {project.progress}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#9ae600] h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-[#666666]">Tareas:</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {project.tasks.length} tareas
            </span>
          </div>
        </div>

        <Button
          onClick={() => onViewProject(project.id)}
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
        >
          <EyeIcon />
          Ver Tareas
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
