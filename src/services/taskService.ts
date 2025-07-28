import { getSupabaseAdmin } from "../lib/supabase";

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO string
  user: {
    email: string;
    name: string;
  };
}

// Interfaces for Supabase query results
interface ProjectTask {
  id: string;
  title: string;
  due_date: string;
  projects: {
    user_id: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
}

export async function getTasksDueSoon(): Promise<Task[]> {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
    const dayAfterTomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 horas

    // Consultar tareas que vencen en las próximas 48 horas
    const { data: tasks, error } = (await getSupabaseAdmin()
      .from("project_tasks")
      .select(
        `
        id,
        title,
        due_date,
        projects!inner(
          user_id
        )
      `
      )
      .gte("due_date", now.toISOString().split("T")[0])
      .lte("due_date", dayAfterTomorrow.toISOString().split("T")[0])
      .eq("status", "todo") // Solo tareas pendientes
      .order("due_date", { ascending: true })) as {
      data: ProjectTask[] | null;
      error: any;
    };

    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }

    console.log("Tareas encontradas:", tasks?.length || 0);

    // Obtener información de usuarios para las tareas encontradas
    const userIds = [
      ...new Set(
        tasks?.map((task) => task.projects?.user_id).filter(Boolean) || []
      ),
    ];

    console.log("User IDs encontrados:", userIds);

    const { data: profiles, error: profilesError } = (await getSupabaseAdmin()
      .from("profiles")
      .select("id, email, first_name, last_name, display_name")
      .in("id", userIds)) as { data: UserProfile[] | null; error: any };

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log("Perfiles encontrados:", profiles?.length || 0);
    console.log("Perfiles:", profiles);

    // Crear un mapa de usuarios para acceso rápido
    const userMap = new Map(
      profiles?.map((profile) => [profile.id, profile]) || []
    );

    // Transformar los datos al formato esperado
    const tasksWithUserInfo: Task[] =
      tasks?.map((task) => {
        const userId = task.projects?.user_id;
        const user = userMap.get(userId);

        console.log(`Task ${task.id}: userId=${userId}, user=`, user);

        return {
          id: task.id,
          title: task.title,
          dueDate: task.due_date,
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

    console.log("Tareas con info de usuario:", tasksWithUserInfo);

    return tasksWithUserInfo;
  } catch (error) {
    console.error("Error in getTasksDueSoon:", error);
    return [];
  }
}

// Función adicional para obtener tareas por usuario específico
export async function getTasksDueSoonForUser(userId: string): Promise<Task[]> {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: tasks, error } = (await getSupabaseAdmin()
      .from("project_tasks")
      .select(
        `
        id,
        title,
        due_date,
        projects!inner(
          user_id
        )
      `
      )
      .gte("due_date", now.toISOString().split("T")[0])
      .lte("due_date", tomorrow.toISOString().split("T")[0])
      .eq("status", "todo")
      .eq("projects.user_id", userId)
      .order("due_date", { ascending: true })) as {
      data: ProjectTask[] | null;
      error: any;
    };

    if (error) {
      console.error("Error fetching user tasks:", error);
      throw error;
    }

    // Obtener información del usuario
    const { data: profile, error: profileError } = (await getSupabaseAdmin()
      .from("profiles")
      .select("id, email, first_name, last_name, display_name")
      .eq("id", userId)
      .single()) as { data: UserProfile | null; error: any };

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Transformar los datos al formato esperado
    const tasksWithUserInfo: Task[] =
      tasks?.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.due_date,
        user: {
          email: profile?.email || "usuario@ejemplo.com",
          name:
            profile?.display_name ||
            `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
            profile?.email ||
            "Usuario",
        },
      })) || [];

    return tasksWithUserInfo;
  } catch (error) {
    console.error("Error in getTasksDueSoonForUser:", error);
    return [];
  }
}
