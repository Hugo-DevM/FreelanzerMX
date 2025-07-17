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
