"use client";

import React, { useEffect, useState } from "react";
import { useProjects } from "../../contexts/ProjectContext";
import { useAuthContext } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import ProjectCard from "./ProjectCard";
import CreateProjectModal from "./CreateProjectModal";
import ErrorModal from "../shared/ErrorModal";
import { PlusIcon } from "../ui/icons";
import { Card } from "../ui";

const ProjectsComponent: React.FC = () => {
  const { projects, loading, error, fetched, fetchData, refreshData } =
    useProjects();
  const { user } = useAuthContext();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // useEffect seguro para cargar datos si no se han cargado
  useEffect(() => {
    if (!loading && !fetched) {
      fetchData();
    }
  }, [loading, fetched, fetchData]);

  const handleCreateProject = () => setShowCreateModal(true);

  const handleProjectCreated = () => {
    setShowCreateModal(false);
    refreshData(); // Refresca desde Supabase y actualiza el contexto
  };

  const handleViewProject = (projectId: string) => {
    window.location.href = `/projects/${projectId}`;
  };

  const getStatusColor = (status: any) => {
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

  const getStatusText = (status: any) => {
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

  if (loading) {
    return (
      <div className="p-4 w-full">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600] mx-auto"></div>
          <p className="text-[#666666] mt-4">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
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
        {projects.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                No tienes proyectos aún
              </h3>
              <p className="text-[#666666] mb-6">
                Comienza creando tu primer proyecto para organizar tu trabajo
              </p>
              <Button onClick={handleCreateProject}>
                Crear Primer Proyecto
              </Button>
            </div>
          </Card>
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
      <ErrorModal open={!!error} message={error || ""} onClose={() => {}} />
    </div>
  );
};

export default ProjectsComponent;
