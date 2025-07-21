import { supabase } from "../lib/supabase";

// Función auxiliar para limpiar valores undefined
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cleanUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanUndefinedValues(value);
    }
  }
  return cleaned;
};

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company?: string;
  website?: string;
  bio?: string;
  photo_url?: string;
  plan: "free" | "pro" | "team";
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  business_info?: {
    business_name: string;
    tax_id?: string;
    business_type?: string;
    industry?: string;
  };
  preferences?: {
    currency: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserProfileData {
  id: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company?: string;
  website?: string;
  bio?: string;
  plan?: "free" | "pro" | "team";
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  business_info?: {
    business_name: string;
    tax_id?: string;
    business_type?: string;
    industry?: string;
  };
}

export const createUserProfile = async (
  userData: CreateUserProfileData
): Promise<void> => {
  try {
    const existingProfile = await getUserProfile(userData.id);
    if (existingProfile) {
      console.log("Profile already exists, skipping creation");
      return;
    }

    const cleanedUserData = cleanUndefinedValues(userData);
    const userProfile: UserProfile = {
      ...cleanedUserData,
      plan: userData.plan || "free", // Asignar plan 'free' por defecto
      preferences: {
        currency: "MXN",
        language: "es",
        timezone: "America/Mexico_City",
        notifications: {
          email: true,
          push: true,
        },
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").insert([userProfile]);

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    throw new Error(
      `Error al crear el perfil de usuario: ${
        error.message || "Error desconocido"
      }`
    );
  }
};

export const getUserProfile = async (
  id: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, display_name, first_name, last_name, phone, company, website, bio, photo_url, plan, address, business_info, preferences, created_at, updated_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw new Error("Error al obtener el perfil de usuario");
  }
};

export const updateUserProfile = async (
  id: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const cleanedUpdates = cleanUndefinedValues(updates);

    if (Object.keys(cleanedUpdates).length === 0) {
      console.warn("❗ No hay datos que actualizar.");
      return; // No sigas si no hay cambios
    }

    const { error } = await supabase
      .from("profiles")
      .update(cleanedUpdates)
      .eq("id", id);

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    throw new Error(
      `Error al actualizar el perfil: ${error.message || "Error desconocido"}`
    );
  }
};

export const userProfileExists = async (id: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return false;
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
};

export const getUserByEmail = async (
  email: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw new Error("Error al buscar usuario por email");
  }
};

export const updateUserPreferences = async (
  id: string,
  preferences: Partial<UserProfile["preferences"]>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ preferences })
      .eq("id", id);

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating user preferences:", error);
    throw new Error(
      `Error al actualizar las preferencias: ${
        error.message || "Error desconocido"
      }`
    );
  }
};

export const updateBusinessInfo = async (
  id: string,
  businessInfo: Partial<UserProfile["business_info"]>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ business_info: businessInfo })
      .eq("id", id);

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating business info:", error);
    throw new Error(
      `Error al actualizar la información de negocio: ${
        error.message || "Error desconocido"
      }`
    );
  }
};

export const checkDisplayNameExists = async (
  displayName: string
): Promise<boolean> => {
  try {
    console.log("Checking display name:", displayName);

    // Verificar en la tabla profiles con búsqueda exacta
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("display_name", displayName)
      .maybeSingle();

    if (error) {
      console.error("Error checking display name:", error);
      return false;
    }

    // Si se encuentra en profiles, retornar true
    if (data) {
      console.log("Display name found in profiles:", displayName);
      return true;
    }

    console.log("Display name not found in profiles:", displayName);
    return false;
  } catch (error) {
    console.error("Error checking display name:", error);
    return false;
  }
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    console.log("Checking email:", email);

    // Verificar en la tabla profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error checking email in profiles:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return false;
    }

    // Si se encuentra en profiles, retornar true
    if (data) {
      console.log("Email found in profiles:", email);
      return true;
    }

    console.log("Email not found in profiles:", email);

    // Debug: verificar si hay algún email en la tabla
    const { data: allEmails, error: debugError } = await supabase
      .from("profiles")
      .select("email")
      .limit(5);

    if (debugError) {
      console.error("Debug error fetching emails:", debugError);
    } else {
      console.log("Sample emails in profiles table:", allEmails);
    }

    return false;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

// Función de debug para verificar el contenido de la tabla profiles
export const debugProfilesTable = async () => {
  try {
    console.log("=== DEBUG: Checking profiles table ===");

    // Verificar si podemos acceder a la tabla
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Error fetching profiles:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return;
    }

    if (data && data.length > 0) {
      console.log(
        "📧 Sample emails:",
        data.map((p) => p.email)
      );
      console.log(
        "👤 Sample display names:",
        data.map((p) => p.display_name)
      );
    } else {
      console.log("⚠️ No profiles found in database");
    }

    console.log("=== END DEBUG ===");
  } catch (error) {
    console.error("❌ Error in debugProfilesTable:", error);
  }
};

// Función para verificar si un email específico existe
export const debugEmailCheck = async (email: string) => {
  try {
    console.log(`=== DEBUG: Checking email "${email}" ===`);

    // Verificar en profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("❌ Error checking email:", error);
      return;
    }

    if (data) {
      console.log("✅ Email found in profiles:", data);
    } else {
      console.log("❌ Email not found in profiles");
    }

    console.log("=== END DEBUG ===");
  } catch (error) {
    console.error("❌ Error in debugEmailCheck:", error);
  }
};

// Función de debug completa para diagnosticar el problema
export const debugAuthSystem = async () => {
  try {
    console.log("=== 🔍 COMPLETE AUTH SYSTEM DEBUG ===");

    // 1. Verificar perfiles en profiles (esto sabemos que funciona)
    console.log("📋 Step 1: Checking profiles table...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError);
    } else {
      console.log("✅ Profiles in database:", profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        console.log(
          "📧 Sample profile emails:",
          profiles.map((p) => p.email)
        );
      } else {
        console.log("⚠️ No profiles found in database");
      }
    }

    // 2. Verificar el usuario actual (si está autenticado)
    console.log("📋 Step 2: Checking current user...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ Error getting current user:", userError);
    } else if (user) {
      console.log("✅ Current user:", user.email);
      console.log("🆔 Current user ID:", user.id);

      // Verificar si el usuario actual tiene perfil
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Error checking current user profile:", profileError);
      } else if (currentProfile) {
        console.log("✅ Current user has profile:", currentProfile);
      } else {
        console.log("❌ Current user has NO profile - this is the problem!");
      }
    } else {
      console.log("⚠️ No user currently authenticated");
    }

    console.log("=== 🎯 DIAGNOSIS SUMMARY ===");

    if (profiles && profiles.length === 0) {
      console.log("🚨 PROBLEM IDENTIFIED: No profiles in database");
      console.log(
        "💡 SOLUTION: Need to create trigger or manually create profiles"
      );
      console.log("📝 NEXT STEPS:");
      console.log("   1. Check if trigger exists in Supabase");
      console.log("   2. Create trigger if missing");
      console.log("   3. Manually sync existing users");
    } else if (profiles && profiles.length > 0) {
      console.log("✅ Profiles table has data - system should be working");
    }

    console.log("=== END DEBUG ===");
  } catch (error) {
    console.error("❌ Error in debugAuthSystem:", error);
  }
};

// Función para crear manualmente un perfil para el usuario actual
export const createProfileForCurrentUser = async () => {
  try {
    console.log("=== 🔧 CREATING PROFILE FOR CURRENT USER ===");

    // Obtener usuario actual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ No user authenticated");
      return false;
    }

    console.log("✅ Current user:", user.email);

    // Verificar si ya tiene perfil
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error checking existing profile:", checkError);
      return false;
    }

    if (existingProfile) {
      console.log("✅ User already has profile");
      return true;
    }

    // Crear perfil manualmente
    const profileData = {
      id: user.id,
      email: user.email!,
      display_name:
        user.user_metadata?.display_name || user.email!.split("@")[0],
      first_name: user.user_metadata?.first_name || "",
      last_name: user.user_metadata?.last_name || "",
      phone: user.user_metadata?.phone || null,
      company: user.user_metadata?.company || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("📝 Creating profile with data:", profileData);

    const { error: createError } = await supabase
      .from("profiles")
      .insert([profileData]);

    if (createError) {
      console.error("❌ Error creating profile:", createError);
      return false;
    }

    console.log("✅ Profile created successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error in createProfileForCurrentUser:", error);
    return false;
  }
};

// Función para obtener el plan del usuario
export const getUserPlan = async (
  userId: string
): Promise<"free" | "pro" | "team"> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return "free"; // Plan por defecto si no existe perfil
      throw error;
    }

    return data?.plan || "free";
  } catch (error) {
    console.error("Error getting user plan:", error);
    return "free"; // Plan por defecto en caso de error
  }
};

// Función para actualizar el plan del usuario
export const updateUserPlan = async (
  userId: string,
  plan: "free" | "pro" | "team"
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ plan, updated_at: new Date() })
      .eq("id", userId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating user plan:", error);
    throw new Error(
      `Error al actualizar el plan del usuario: ${
        error.message || "Error desconocido"
      }`
    );
  }
};

export const deleteUserProfile = async (userId: string): Promise<void> => {
  try {
    // Usar el endpoint de API que maneja la eliminación completa
    const response = await fetch("/api/delete-user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar usuario");
    }

    console.log("User deleted successfully");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error(
      `Error al eliminar usuario: ${error.message || "Error desconocido"}`
    );
  }
};

// Función para verificar si un usuario puede ser eliminado
export const canDeleteUser = async (
  userId: string
): Promise<{
  canDelete: boolean;
  reason?: string;
  dependencies?: string[];
}> => {
  try {
    // Verificar si el usuario tiene proyectos
    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId);

    // Verificar si el usuario tiene contratos
    const { data: contracts } = await supabase
      .from("contracts")
      .select("id")
      .eq("user_id", userId);

    // Verificar si el usuario tiene cotizaciones
    const { data: quotes } = await supabase
      .from("quotes")
      .select("id")
      .eq("user_id", userId);

    const dependencies: string[] = [];
    if (projects && projects.length > 0) {
      dependencies.push(`${projects.length} proyecto(s)`);
    }
    if (contracts && contracts.length > 0) {
      dependencies.push(`${contracts.length} contrato(s)`);
    }
    if (quotes && quotes.length > 0) {
      dependencies.push(`${quotes.length} cotización(es)`);
    }

    const canDelete = dependencies.length === 0;
    const reason = canDelete
      ? undefined
      : `El usuario tiene ${dependencies.join(", ")} asociados`;

    return {
      canDelete,
      reason,
      dependencies,
    };
  } catch (error) {
    console.error("Error checking if user can be deleted:", error);
    return {
      canDelete: false,
      reason: "Error al verificar dependencias del usuario",
    };
  }
};

// Función para verificar si un usuario puede crear proyectos
export const canCreateProject = async (userId: string): Promise<boolean> => {
  try {
    const plan = await getUserPlan(userId);
    const limit = getProjectLimit(plan);

    const { count, error } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching project count:", error);
      return false;
    }

    console.log("Plan:", plan, "Límite:", limit, "Proyectos actuales:", count);
    return (count || 0) < limit;
  } catch (error) {
    console.error("Error checking if user can create project:", error);
    return false;
  }
};

// Función para obtener el límite de proyectos según el plan
export const getProjectLimit = (plan: "free" | "pro" | "team"): number => {
  switch (plan) {
    case "free":
      return 2;
    case "pro":
      return 10;
    case "team":
      return 50;
    default:
      return 2;
  }
};
