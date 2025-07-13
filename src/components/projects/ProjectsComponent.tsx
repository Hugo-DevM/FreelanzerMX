"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../contexts/AuthContext";
import { Project } from "../../types/project";
import { getUserProjects } from "../../services/projectService";
import ProjectCard from "./ProjectCard";
import CreateProjectModal from "./CreateProjectModal";
import Button from "../ui/Button";
import { PlusIcon } from "../ui/icons";

const ProjectsComponent: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (err: any) {
      console.error("Error loading projects:", err);
      setError(err.message || "Error al cargar los proyectos");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectCreated = () => {
    setShowCreateModal(false);
    loadProjects(); // Recargar proyectos
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En Progreso";
      case "completed":
        return "Completado";
      default:
        return "Desconocido";
    }
  };

  const showError = !!error && projects.length === 0;

  if (loading) {
    return (
      <div className="p-4 w-full">
        <div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600] mx-auto"></div>
            <p className="text-[#666666] mt-4">Cargando proyectos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Proyectos</h1>
              <p className="text-[#666666]">Gestiona tus proyectos activos</p>
            </div>
            <Button
              onClick={handleCreateProject}
              className="flex items-center gap-2"
            >
              <PlusIcon />
              Crear Proyecto
            </Button>
          </div>

          {showError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#9ae600] text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                No tienes proyectos aún
              </h3>
              <p className="text-[#666666] mb-6">
                Comienza creando tu primer proyecto para organizar tu trabajo
              </p>
              <Button
                onClick={handleCreateProject}
                className="flex items-center gap-2 mx-auto"
              >
                <PlusIcon />
                Crear Primer Proyecto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewProject={handleViewProject}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              ))}
            </div>
          )}
        </div>

        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onProjectCreated={handleProjectCreated}
            userId={user?.uid || ""}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsComponent;
