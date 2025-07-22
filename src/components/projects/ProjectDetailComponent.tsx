"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Project, Task, CreateTaskData } from "../../types/project";
import {
  getProject,
  addTaskToProject,
  updateTask,
  deleteTask,
  updateProject,
  getProjectTasks,
  calculateProgress,
} from "../../services/projectService";
import { supabase } from "../../lib/supabase";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import ErrorModal from "../shared/ErrorModal";
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckIcon } from "../ui/icons";
import ConfirmModal from "../ui/ConfirmModal";

interface ProjectDetailComponentProps {
  projectId: string;
}

type TabType = "tasks" | "notes" | "files";

const ProjectDetailComponent: React.FC<ProjectDetailComponentProps> = ({
  projectId,
}) => {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const [showAddTask, setShowAddTask] = useState(false);
  // const [editingTask, setEditingTask] = useState<string | null>(null);
  const [progressAnimated, setProgressAnimated] = useState(0);
  const progressRef = useRef<number>(0);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    estimatedHours: "",
  });

  useEffect(() => {
    loadProject();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Suscripción en tiempo real para cambios en el proyecto
  useEffect(() => {
    if (!projectId) return;
    // Suscripción a cambios en el proyecto
    const projectSubscription = supabase
      .channel(`project-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        async (payload) => {
          console.log("📡 Cambio detectado en proyecto:", payload);
          if (payload.new) {
            try {
              // Recargar el proyecto completo para obtener los datos más recientes
              const updatedProject = await getProject(projectId);
              if (updatedProject) {
                console.log(
                  "🔄 Actualizando proyecto con datos frescos:",
                  updatedProject
                );
                setProject(updatedProject);
              }
            } catch (error) {
              console.error("Error recargando proyecto:", error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("🔕 Desuscribiendo de cambios en tiempo real");
      projectSubscription.unsubscribe();
    };
  }, [projectId]);

  useEffect(() => {
    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_tasks",
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const updatedTasks = await getProjectTasks(projectId);
          setTasks(updatedTasks);

          // Actualizar solo el progreso del proyecto sin llamar a loadProject
          setProject((prev) =>
            prev ? { ...prev, progress: calculateProgress(updatedTasks) } : prev
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [projectId]);

  useEffect(() => {
    if (project) {
      console.log(
        "🎬 Iniciando animación - Progreso actual:",
        project.progress
      );

      // Inicializar el valor de referencia si es la primera vez
      if (progressRef.current === 0 && project.progress > 0) {
        progressRef.current = 0;
      }

      // Animar la barra de progreso
      let frame: number;
      const animate = () => {
        if (progressRef.current !== project.progress) {
          const diff = project.progress - progressRef.current;
          progressRef.current += diff * 0.3; // velocidad de animación más rápida
          if (Math.abs(diff) < 0.5) {
            progressRef.current = project.progress;
          } else {
            frame = requestAnimationFrame(animate);
          }
          const newProgressAnimated = Math.round(progressRef.current * 10) / 10;
          console.log(
            "🎯 Animación - Valor actual:",
            progressRef.current,
            "Animado:",
            newProgressAnimated
          );
          setProgressAnimated(newProgressAnimated);
        }
      };
      animate();
      return () => cancelAnimationFrame(frame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.progress]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectData = await getProject(projectId);
      if (projectData) {
        setProject(projectData);
      } else {
        setError("Proyecto no encontrado");
      }
    } catch (err: any) {
      console.error("Error loading project:", err);
      setError(err.message || "Error al cargar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const loadedTasks = await getProjectTasks(projectId);
      setTasks(loadedTasks);
    } catch (err: any) {
      setError(err.message || "Error al cargar las tareas");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      const taskId = crypto?.randomUUID?.() || Date.now().toString();
      const taskData: CreateTaskData = {
        id: taskId,
        title: taskForm.title,
        description: taskForm.description || undefined,
        dueDate: taskForm.dueDate || undefined,
        estimatedHours: taskForm.estimatedHours
          ? parseFloat(taskForm.estimatedHours)
          : undefined,
      };
      await addTaskToProject(projectId, taskData);
      // No necesitas actualizar tareas manualmente aquí si usas realtime
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        estimatedHours: "",
      });
      setShowAddTask(false);
    } catch (err: any) {
      setError(err.message || "Error al agregar la tarea");
    }
  };

  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, status: Task["status"]) => {
      try {
        await updateTask(taskId, { status });
        const updatedTasks = await getProjectTasks(projectId);
        setTasks(updatedTasks);
        setProject((prev) =>
          prev ? { ...prev, progress: calculateProgress(updatedTasks) } : prev
        );
      } catch (error) {
        setError("Error al actualizar la tarea");
      }
    },
    [projectId]
  );

  const handleDeleteTask = async (taskId: string) => {
    setDeleteTaskId(taskId);
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskId) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTaskId);
      const updatedTasks = await getProjectTasks(projectId);
      setTasks(updatedTasks);
      setProject((prev) =>
        prev ? { ...prev, progress: calculateProgress(updatedTasks) } : prev
      );
      setDeleteTaskId(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar la tarea");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteTask = () => {
    setDeleteTaskId(null);
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "En Progreso";
      case "done":
        return "Hecho";
      default:
        return "Desconocido";
    }
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

  const getProjectStatusText = (status: Project["status"]) => {
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

  console.log(
    "🎨 Renderizando componente - Progreso:",
    project?.progress,
    "Animado:",
    progressAnimated
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600] mx-auto"></div>
            <p className="text-[#666666] mt-4">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              Proyecto no encontrado
            </h3>
            <Button onClick={() => router.push("/projects")} className="mt-4">
              Volver a Proyectos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push("/projects")}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {project.name}
              </h1>
              <p className="text-[#666666]">Cliente: {project.client}</p>
            </div>
          </div>

          {/* Project Summary */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-[#666666] mb-1">
                    Estado
                  </h3>
                  <p className="text-lg font-semibold text-[#1A1A1A]">
                    {getProjectStatusText(project.status)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#666666] mb-1">
                    Prioridad
                  </h3>
                  <p
                    className={`text-lg font-semibold ${getPriorityColor(
                      project.priority
                    )}`}
                  >
                    {getPriorityText(project.priority)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#666666] mb-1">
                    Progreso
                  </h3>
                  <p className="text-lg font-semibold text-[#1A1A1A]">
                    {project.progress}%
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#666666] mb-1">
                    Tareas
                  </h3>
                  <p className="text-lg font-semibold text-[#1A1A1A]">
                    {tasks.length} tareas
                  </p>
                </div>
              </div>

              {project.dueDate && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-[#666666] mb-1">
                    Fecha Límite
                  </h3>
                  <p className="text-lg font-semibold text-[#1A1A1A]">
                    {formatDate(project.dueDate)}
                  </p>
                </div>
              )}

              {project.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-[#666666] mb-1">
                    Descripción
                  </h3>
                  <p className="text-[#1A1A1A]">{project.description}</p>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[#666666]">
                    Progreso General
                  </span>
                  <span className="text-sm font-medium text-[#1A1A1A] transition-all duration-300">
                    {progressAnimated}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#9ae600] h-3 rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{
                      width: `${progressAnimated}%`,
                      boxShadow:
                        progressAnimated > 0
                          ? "0 0 8px rgba(154, 230, 0, 0.3)"
                          : "none",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "tasks", label: "Tareas", count: tasks.length },
                { id: "notes", label: "Notas", count: 0 },
                { id: "files", label: "Archivos", count: 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-[#9ae600] text-[#9ae600]"
                      : "border-transparent text-[#666666] hover:text-[#1A1A1A] hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "tasks" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                  Tareas del Proyecto
                </h2>
                <Button
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-2"
                >
                  <PlusIcon />
                  Agregar Tarea
                </Button>
              </div>

              {tasks.length === 0 ? (
                <Card>
                  <div className="p-8 text-center">
                    <div className="text-[#9ae600] text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                      No hay tareas aún
                    </h3>
                    <p className="text-[#666666] mb-4">
                      Comienza agregando tareas para organizar tu trabajo
                    </p>
                    <Button
                      onClick={() => setShowAddTask(true)}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <PlusIcon />
                      Agregar Primera Tarea
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id}>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <button
                                onClick={() =>
                                  handleUpdateTaskStatus(
                                    task.id,
                                    task.status === "done" ? "todo" : "done"
                                  )
                                }
                                className={`p-1 rounded transition-all duration-200 ${
                                  task.status === "done"
                                    ? "bg-green-100 text-green-600 scale-110"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                              >
                                <CheckIcon size={16} />
                              </button>
                              <h3
                                className={`font-medium ${
                                  task.status === "done"
                                    ? "line-through text-gray-500"
                                    : "text-[#1A1A1A]"
                                }`}
                              >
                                {task.title}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                {getStatusText(task.status)}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-[#666666] text-sm mb-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-[#666666]">
                              <span>Vence: {formatDate(task.dueDate)}</span>
                              {task.estimatedHours && (
                                <span>Estimado: {task.estimatedHours}h</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <Card>
              <div className="p-8 text-center">
                <div className="text-[#9ae600] text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  Notas del Proyecto
                </h3>
                <p className="text-[#666666]">
                  Próximamente: Podrás agregar notas y comentarios sobre el
                  proyecto
                </p>
              </div>
            </Card>
          )}

          {activeTab === "files" && (
            <Card>
              <div className="p-8 text-center">
                <div className="text-[#9ae600] text-4xl mb-4">📁</div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  Archivos Adjuntos
                </h3>
                <p className="text-[#666666]">
                  Próximamente: Podrás subir y gestionar archivos relacionados
                  con el proyecto
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                  Agregar Tarea
                </h2>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="text-[#666666] hover:text-[#1A1A1A]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <Input
                  label="Título de la Tarea"
                  name="title"
                  value={taskForm.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Diseñar mockups"
                  required
                />

                <TextArea
                  label="Descripción (opcional)"
                  name="description"
                  value={taskForm.description}
                  onChange={handleInputChange}
                  placeholder="Describe la tarea..."
                  rows={3}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Fecha Límite"
                    name="dueDate"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={handleInputChange}
                  />

                  <Input
                    label="Horas Estimadas"
                    name="estimatedHours"
                    type="number"
                    value={taskForm.estimatedHours}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddTask(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Agregar Tarea</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Confirm Delete Modal */}
        <ConfirmModal
          open={!!deleteTaskId}
          message="¿Estás seguro de que quieres eliminar esta tarea?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteTask}
          onCancel={cancelDeleteTask}
          loading={deleting}
        />

        {/* Error Modal */}
        <ErrorModal
          open={!!error}
          message={error || ""}
          onClose={() => setError(null)}
        />
      </div>
    </div>
  );
};

export default ProjectDetailComponent;
