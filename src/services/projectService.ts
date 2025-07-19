import { supabase } from "../lib/supabase";
import {
  Project,
  CreateProjectData,
  Task,
  CreateTaskData,
  UpdateTaskData,
  Contract,
} from "../types/project";

export const createProject = async (
  userId: string,
  projectData: CreateProjectData
): Promise<string> => {
  try {
    const project = {
      user_id: userId,
      name: projectData.name,
      description: projectData.description,
      client: projectData.client,
      status: "pending",
      priority: projectData.priority || "medium",
      due_date: projectData.dueDate,
      deliverables: projectData.deliverables,
      amount: projectData.amount,
      tasks: [],
    };

    const { data, error } = await supabase
      .from("projects")
      .insert([project])
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (error: any) {
    console.error("Error creating project:", error);
    throw new Error(
      `Error al crear el proyecto: ${error.message || "Error desconocido"}`
    );
  }
};

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, name, description, client, status, priority, due_date, deliverables, amount, created_at, tasks"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      client: project.client,
      status: project.status,
      priority: project.priority,
      dueDate: project.due_date,
      deliverables: project.deliverables,
      amount: project.amount,
      tasks: (project.tasks || []).map((task: any) => ({
        ...task,
        createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
      })),
      progress: calculateProgress(project.tasks || []),
      createdAt: new Date(project.created_at),
      // updatedAt no se trae aquí
    })) as Project[];
  } catch (error: any) {
    console.error("Error getting user projects:", error);
    throw new Error("Error al obtener los proyectos");
  }
};

export const getProject = async (
  projectId: string
): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      client: data.client,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date,
      deliverables: data.deliverables,
      tasks: (data.tasks || []).map((task: any) => ({
        ...task,
        // dueDate ya es string, no convertir
        createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
      })),
      progress: calculateProgress(data.tasks || []),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    } as Project;
  } catch (error: any) {
    console.error("Error getting project:", error);
    throw new Error("Error al obtener el proyecto");
  }
};

export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  try {
    const supabaseUpdates: any = {};

    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.description !== undefined)
      supabaseUpdates.description = updates.description;
    if (updates.client !== undefined) supabaseUpdates.client = updates.client;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.priority !== undefined)
      supabaseUpdates.priority = updates.priority;
    if (updates.dueDate !== undefined)
      supabaseUpdates.due_date = updates.dueDate;
    if (updates.deliverables !== undefined)
      supabaseUpdates.deliverables = updates.deliverables;

    const { error } = await supabase
      .from("projects")
      .update(supabaseUpdates)
      .eq("id", projectId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating project:", error);
    throw new Error(
      `Error al actualizar el proyecto: ${error.message || "Error desconocido"}`
    );
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting project:", error);
    throw new Error(
      `Error al eliminar el proyecto: ${error.message || "Error desconocido"}`
    );
  }
};

export const addTaskToProject = async (
  projectId: string,
  taskData: CreateTaskData
): Promise<void> => {
  try {
    const newTask: Task = {
      id: taskData.id || crypto.randomUUID(),
      title: taskData.title,
      description: taskData.description,
      status: "todo",
      dueDate: taskData.dueDate, // Guardar como string
      estimatedHours: taskData.estimatedHours,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data: project } = await supabase
      .from("projects")
      .select("tasks")
      .eq("id", projectId)
      .single();

    const updatedTasks = [...(project?.tasks || []), newTask];

    const { error } = await supabase
      .from("projects")
      .update({ tasks: updatedTasks })
      .eq("id", projectId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error adding task to project:", error);
    throw new Error(
      `Error al agregar la tarea: ${error.message || "Error desconocido"}`
    );
  }
};

export const updateTask = async (
  projectId: string,
  taskId: string,
  updates: UpdateTaskData
): Promise<void> => {
  try {
    const { data: project } = await supabase
      .from("projects")
      .select("tasks")
      .eq("id", projectId)
      .single();

    const tasks = project?.tasks || [];
    const taskIndex = tasks.findIndex((task: Task) => task.id === taskId);

    if (taskIndex === -1) {
      throw new Error("Tarea no encontrada");
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const { error } = await supabase
      .from("projects")
      .update({ tasks })
      .eq("id", projectId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating task:", error);
    throw new Error(
      `Error al actualizar la tarea: ${error.message || "Error desconocido"}`
    );
  }
};

export const deleteTask = async (
  projectId: string,
  taskId: string
): Promise<void> => {
  try {
    const { data: project } = await supabase
      .from("projects")
      .select("tasks")
      .eq("id", projectId)
      .single();

    const tasks = project?.tasks || [];
    const filteredTasks = tasks.filter((task: Task) => task.id !== taskId);

    const { error } = await supabase
      .from("projects")
      .update({ tasks: filteredTasks })
      .eq("id", projectId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting task:", error);
    throw new Error(
      `Error al eliminar la tarea: ${error.message || "Error desconocido"}`
    );
  }
};

export const getContracts = async (): Promise<Contract[]> => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Mapea los campos de la base de datos al modelo Contract
    return (data || []).map((contract: any) => ({
      id: contract.id,
      clientName: contract.client_name,
      service: contract.service,
      amount: contract.amount,
      deliverables: contract.deliverables,
      startDate: contract.start_date || undefined,
      endDate: contract.delivery_date || undefined,
    })) as Contract[];
  } catch (error: any) {
    console.error("Error getting contracts:", error);
    throw new Error("Error al obtener los contratos");
  }
};

const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter((task) => task.status === "done");
  return Math.round((completedTasks.length / tasks.length) * 100);
};
