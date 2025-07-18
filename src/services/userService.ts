import { supabase } from "../lib/supabase";

// Función auxiliar para limpiar valores undefined
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
    // Verificar si el perfil ya existe (creado por el trigger)
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
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No encontrado
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
    const { error } = await supabase
      .from("profiles")
      .update(cleanedUpdates)
      .eq("id", id);

    if (error) throw error;
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
  } catch (error: any) {
    console.error("Error updating business info:", error);
    throw new Error(
      `Error al actualizar la información de negocio: ${
        error.message || "Error desconocido"
      }`
    );
  }
};

export const updateUserPlan = async (
  userId: string,
  plan: "free" | "pro" | "team"
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", userId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating user plan:", error);
    throw new Error(
      `Error al actualizar el plan: ${error.message || "Error desconocido"}`
    );
  }
};

export const getUserPlan = async (
  userId: string
): Promise<"free" | "pro" | "team"> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data.plan || "free";
  } catch (error: any) {
    console.error("Error getting user plan:", error);
    return "free"; // Plan por defecto en caso de error
  }
};

export const canCreateProject = async (userId: string): Promise<boolean> => {
  try {
    const plan = await getUserPlan(userId);

    if (plan === "free") {
      // Verificar si ya tiene 2 proyectos
      const { data: projects, error } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", userId);

      if (error) throw error;
      return (projects || []).length < 2;
    }

    // Planes pro y team pueden crear proyectos ilimitados
    return true;
  } catch (error) {
    console.error("Error checking project creation limit:", error);
    return false; // En caso de error, no permitir crear
  }
};

export const getProjectLimit = (plan: "free" | "pro" | "team"): number => {
  switch (plan) {
    case "free":
      return 2;
    case "pro":
    case "team":
      return Infinity;
    default:
      return 2;
  }
};
