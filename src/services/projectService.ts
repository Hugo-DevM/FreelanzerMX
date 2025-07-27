import { supabase, supabaseAdmin } from "../lib/supabase";
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
      contract_id: projectData.contractId,
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
        "id, name, description, client, status, priority, due_date, deliverables, amount, created_at, contract_id"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Obtener tareas para cada proyecto
    const projects = await Promise.all(
      (data || []).map(async (project: any) => {
        const tasks = await getProjectTasks(project.id);
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          client: project.client,
          status: project.status,
          priority: project.priority,
          dueDate: project.due_date,
          deliverables: project.deliverables,
          amount: project.amount,
          contractId: project.contract_id,
          tasks,
          progress: calculateProgress(tasks),
          createdAt: new Date(project.created_at),
        };
      })
    );
    return projects as Project[];
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

    // Obtener tareas desde la tabla relacional
    const tasks = await getProjectTasks(projectId);
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      client: data.client,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date,
      deliverables: data.deliverables,
      tasks,
      progress: calculateProgress(tasks),
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
    // Nota: progress se calcula dinámicamente, no se almacena en la base de datos

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

// NUEVO: Servicio para obtener tareas de un proyecto
export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((task: any) => ({
    ...task,
    dueDate: task.due_date, // mapeo correcto
    estimatedHours: task.estimated_hours, // mapeo correcto
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
  }));
};

// NUEVO: Agregar tarea a la tabla relacional
export const addTaskToProject = async (
  projectId: string,
  taskData: CreateTaskData
): Promise<void> => {
  console.log("Intentando agregar tarea:", { projectId, taskData });
  const { data, error } = await supabase.from("project_tasks").insert([
    {
      project_id: projectId,
      title: taskData.title,
      description: taskData.description,
      status: "todo",
      due_date: taskData.dueDate,
      estimated_hours: taskData.estimatedHours,
    },
  ]);
  if (error) {
    console.error("Error al agregar tarea:", error);
    throw error;
  }
  console.log("Tarea agregada correctamente:", data);
};

// NUEVO: Actualizar tarea
export const updateTask = async (
  taskId: string,
  updates: UpdateTaskData
): Promise<void> => {
  console.log("Intentando actualizar tarea:", { taskId, updates });
  const { data, error } = await supabase
    .from("project_tasks")
    .update({
      ...updates,
      updated_at: new Date(),
    })
    .eq("id", taskId);
  if (error) {
    console.error("Error al agregar tarea:", error);
    throw error;
  }
  console.log("Tarea actualizada correctamente:", data);
};

// NUEVO: Eliminar tarea
export const deleteTask = async (taskId: string): Promise<void> => {
  const { error } = await supabase
    .from("project_tasks")
    .delete()
    .eq("id", taskId);
  if (error) throw error;
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

export const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter((task) => task.status === "done");
  return Math.round((completedTasks.length / tasks.length) * 100);
};

export const getUsedContractIds = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("contract_id")
      .eq("user_id", userId)
      .not("contract_id", "is", null);

    if (error) throw error;

    const usedIds = data.map((p) => p.contract_id).filter(Boolean);
    return usedIds;
  } catch (error: any) {
    console.error("Error al obtener contratos ya usados:", error);
    return [];
  }
};

// NUEVO: Obtener proyectos próximos a vencer (próximas 48 horas)
export interface ProjectDueSoon {
  id: string;
  name: string;
  dueDate: string; // ISO string
  user: {
    email: string;
    name: string;
  };
}

export async function getProjectsDueSoon(): Promise<ProjectDueSoon[]> {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
    const dayAfterTomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 horas

    // CAMBIADO: Usar supabaseAdmin en lugar de supabase
    const { data: projects, error } = await supabaseAdmin
      .from("projects")
      .select(
        `
        id,
        name,
        due_date,
        user_id
      `
      )
      .gte("due_date", now.toISOString().split("T")[0])
      .lte("due_date", dayAfterTomorrow.toISOString().split("T")[0])
      .in("status", ["pending", "in-progress"]) // Proyectos pendientes O en proceso
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }

    console.log("Proyectos encontrados:", projects?.length || 0);

    // Obtener información de usuarios para los proyectos encontrados
    const userIds = [
      ...new Set(
        projects?.map((project) => project.user_id).filter(Boolean) || []
      ),
    ];

    console.log("User IDs encontrados:", userIds);

    // CAMBIADO: Usar supabaseAdmin
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, last_name, display_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log("Perfiles encontrados:", profiles?.length || 0);

    // Crear un mapa de usuarios para acceso rápido
    const userMap = new Map(
      profiles?.map((profile) => [profile.id, profile]) || []
    );

    // Transformar los datos al formato esperado
    const projectsWithUserInfo: ProjectDueSoon[] =
      projects?.map((project) => {
        const userId = project.user_id;
        const user = userMap.get(userId);

        console.log(`Project ${project.id}: userId=${userId}, user=`, user);

        return {
          id: project.id,
          name: project.name,
          dueDate: project.due_date,
          user: {
            email: user?.email || "usuario@ejemplo.com",
            name:
              user?.display_name ||
              `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
              user?.email ||
              "Usuario",
          },
        };
      }) || [];

    console.log("Proyectos con info de usuario:", projectsWithUserInfo);

    return projectsWithUserInfo;
  } catch (error) {
    console.error("Error in getProjectsDueSoon:", error);
    return [];
  }
}

// NUEVO: Obtener proyectos próximos a vencer para un usuario específico
export async function getProjectsDueSoonForUser(
  userId: string
): Promise<ProjectDueSoon[]> {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // CAMBIADO: Usar supabaseAdmin
    const { data: projects, error } = await supabaseAdmin
      .from("projects")
      .select(
        `
        id,
        name,
        due_date,
        user_id
      `
      )
      .gte("due_date", now.toISOString().split("T")[0])
      .lte("due_date", tomorrow.toISOString().split("T")[0])
      .in("status", ["pending", "in-progress"]) // Proyectos pendientes O en proceso
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching user projects:", error);
      throw error;
    }

    // Obtener información del usuario
    // CAMBIADO: Usar supabaseAdmin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, last_name, display_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Transformar los datos al formato esperado
    const projectsWithUserInfo: ProjectDueSoon[] =
      projects?.map((project) => ({
        id: project.id,
        name: project.name,
        dueDate: project.due_date,
        user: {
          email: profile?.email || "usuario@ejemplo.com",
          name:
            profile?.display_name ||
            `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
            profile?.email ||
            "Usuario",
        },
      })) || [];

    return projectsWithUserInfo;
  } catch (error) {
    console.error("Error in getProjectsDueSoonForUser:", error);
    return [];
  }
}
