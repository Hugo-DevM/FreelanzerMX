"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useProjects } from "../../contexts/ProjectContext";
import { useAuthContext } from "../../contexts/AuthContext";
import {
  canCreateProject,
  getProjectLimit,
  getUserPlan,
} from "../../services/userService";
import { usePathname } from "next/navigation";
import Button from "../ui/Button";
import ProjectCard from "./ProjectCard";
import CreateProjectModal from "./CreateProjectModal";
import ErrorModal from "../shared/ErrorModal";
import { PlusIcon } from "../ui/icons";
import { Card } from "../ui";
import { ProjectListSkeleton } from "../ui/SkeletonLoader";
import { supabase } from "../../lib/supabase";

const ProjectsComponent: React.FC = () => {
  const { projects, loading, error, fetched, fetchData, refreshData } =
    useProjects();
  const { user } = useAuthContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [canCreate, setCanCreate] = useState(true);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "team">("free");
  const [projectLimit, setProjectLimit] = useState(2);

  const pathname = usePathname();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshData(); // 🔁 Fuerza la recarga desde Supabase
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshData]);
  // useEffect con useTransition para evitar bloqueos en el render
  useEffect(() => {
    if (!loading && !fetched) {
      startTransition(() => {
        fetchData();
      });
    }
  }, [loading, fetched, fetchData, startTransition]);

  // Cargar información del plan del usuario
  useEffect(() => {
    if (user?.uid) {
      loadUserPlanInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // useEffect para escuchar cambios en tiempo real en los proyectos del usuario
  useEffect(() => {
    if (!user?.uid) return;

    const channel = supabase
      .channel("realtime-projects")
      .on(
        "postgres_changes",
        {
          event: "*", // puede ser "INSERT", "UPDATE", "DELETE"
          schema: "public",
          table: "projects",
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          console.log("🔁 Cambio detectado en projects:", payload);
          refreshData(); // Vuelve a cargar los proyectos en tiempo real
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.uid, refreshData]);

  useEffect(() => {
    if (pathname === "/projects") {
      startTransition(() => {
        refreshData();
      });
    }
  }, [pathname, startTransition]);

  const loadUserPlanInfo = async () => {
    if (!user?.uid) return;

    try {
      const plan = await getUserPlan(user.uid);
      const canCreateProjects = await canCreateProject(user.uid);
      const limit = getProjectLimit(plan);

      setUserPlan(plan);
      setCanCreate(canCreateProjects);
      setProjectLimit(limit);
    } catch (error) {
      console.error("Error loading user plan info:", error);
    }
  };

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

  // Render progresivo: mostrar skeleton inmediatamente si está cargando
  if (loading || isPending) {
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
              disabled={isPending}
            >
              <PlusIcon />
              Crear Proyecto
            </Button>
          </div>
          <ProjectListSkeleton />
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
          <div className="flex flex-col items-end gap-2">
            {userPlan === "free" && (
              <div className="text-xs text-gray-600">
                {projects.length}/{projectLimit} proyectos
              </div>
            )}
            <Button
              onClick={handleCreateProject}
              className="flex items-center gap-2"
              disabled={!canCreate}
            >
              <PlusIcon />
              {canCreate ? "Crear Proyecto" : "Límite Alcanzado"}
            </Button>
          </div>
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
