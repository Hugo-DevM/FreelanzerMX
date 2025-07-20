"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { User, AuthError, AuthState } from "../types/auth";
import {
  createUserProfile,
  getUserProfile,
  userProfileExists,
  UserProfile,
  getUserPlan,
  updateUserPlan,
  updateUserProfile,
} from "../services/userService";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "team">("free");

  const toCamelCaseProfile = (profile: any): UserProfile | null => {
    if (!profile) return null;
    return {
      ...profile,
      displayName: profile.display_name,
      firstName: profile.first_name,
      lastName: profile.last_name,
      businessInfo: profile.business_info,
      createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
      updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
    };
  };

  // Función para extraer datos de Google
  const extractGoogleData = (userMetadata: any) => {
    const fullName =
      userMetadata?.full_name ||
      userMetadata?.name ||
      userMetadata?.display_name ||
      "";

    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    return {
      display_name: userMetadata?.display_name || fullName,
      first_name: firstName,
      last_name: lastName,
      phone: userMetadata?.phone || "",
      company: userMetadata?.company || "",
      business_name: userMetadata?.display_name || fullName,
    };
  };

  const loadUserProfile = useCallback(async (id: string) => {
    try {
      setProfileLoading(true);
      const profile = await getUserProfile(id);
      const plan = await getUserPlan(id);
      setUserProfile(toCamelCaseProfile(profile));
      setUserPlan(plan);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const updatePlan = useCallback(
    async (plan: "free" | "pro" | "team") => {
      if (!authState.user) return;

      try {
        await updateUserPlan(authState.user.uid, plan);
        setUserPlan(plan);
      } catch (error) {
        console.error("Error updating user plan:", error);
        throw error;
      }
    },
    [authState.user]
  );

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const user: User = {
          uid: session.user.id,
          email: session.user.email || "",
          displayName: session.user.user_metadata?.display_name,
          photoURL: session.user.user_metadata?.avatar_url,
          createdAt: new Date(session.user.created_at),
        };
        setAuthState({ user, loading: false, error: null });
        loadUserProfile(session.user.id);
      } else {
        setAuthState({ user: null, loading: false, error: null });
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user: User = {
          uid: session.user.id,
          email: session.user.email || "",
          displayName: session.user.user_metadata?.display_name,
          photoURL: session.user.user_metadata?.avatar_url,
          createdAt: new Date(session.user.created_at),
        };
        setAuthState({ user, loading: false, error: null });

        // Verificar si el usuario ya tiene un perfil
        const profileExists = await userProfileExists(session.user.id);

        if (!profileExists) {
          // Crear perfil automáticamente para usuarios de Google
          try {
            const googleData = extractGoogleData(session.user.user_metadata);

            await createUserProfile({
              id: session.user.id,
              email: session.user.email || "",
              display_name: googleData.display_name,
              first_name: googleData.first_name,
              last_name: googleData.last_name,
              phone: googleData.phone,
              company: googleData.company,
              business_info: {
                business_name: googleData.business_name,
              },
            });
          } catch (error) {
            console.error(
              "Error creating user profile for Google user:",
              error
            );
          }
        } else {
          // Si el perfil existe, verificar si necesita actualización con datos de Google
          try {
            const existingProfile = await getUserProfile(session.user.id);

            // Verificar si el usuario se registró con Google
            const isGoogleUser =
              session.user.app_metadata?.provider === "google" ||
              session.user.user_metadata?.provider === "google" ||
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.avatar_url;

            if (existingProfile && isGoogleUser) {
              const googleData = extractGoogleData(session.user.user_metadata);

              // Solo actualizar si los campos están vacíos (no sobrescribir datos existentes)
              const needsUpdate =
                !existingProfile.first_name ||
                !existingProfile.last_name ||
                !existingProfile.display_name ||
                existingProfile.first_name === "EMPTY" ||
                existingProfile.last_name === "EMPTY" ||
                existingProfile.display_name === "EMPTY";

              if (needsUpdate) {
                // Actualizar perfil existente con datos de Google SOLO si están vacíos
                await updateUserProfile(session.user.id, {
                  display_name:
                    existingProfile.display_name || googleData.display_name,
                  first_name:
                    existingProfile.first_name || googleData.first_name,
                  last_name: existingProfile.last_name || googleData.last_name,
                  phone: googleData.phone || existingProfile.phone || "",
                  company: googleData.company || existingProfile.company || "",
                  business_info: {
                    ...existingProfile.business_info,
                    business_name:
                      existingProfile.business_info?.business_name ||
                      googleData.business_name ||
                      "",
                  },
                });
              }
            }
            // Si no es usuario de Google, NO hacer nada - respetar los datos existentes
          } catch (error) {
            console.error(
              "Error updating existing profile with Google data:",
              error
            );
          }
        }

        loadUserProfile(session.user.id);
      } else {
        setAuthState({ user: null, loading: false, error: null });
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  useEffect(() => {
    if (!authState.user || !authState.user.uid) return;
    // Suscribirse a cambios en el perfil del usuario actual
    const channel = supabase
      .channel("profile-realtime-" + authState.user.uid)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${authState.user.uid}`,
        },
        () => {
          // Refrescar el perfil automáticamente si hay cambios
          loadUserProfile(authState.user!.uid);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [authState.user, loadUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      const authError: AuthError = {
        code: error.status || "unknown",
        message: getErrorMessage(error.message),
      };
      setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
      throw authError;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
            scope: "email profile",
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      const authError: AuthError = {
        code: error.status || "unknown",
        message: getErrorMessage(error.message),
      };
      setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
      throw authError;
    }
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      userData: {
        firstName: string;
        lastName: string;
        displayName: string;
        phone?: string;
        company?: string;
      }
    ) => {
      try {
        setAuthState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: userData.displayName,
              first_name: userData.firstName,
              last_name: userData.lastName,
              phone: userData.phone,
              company: userData.company,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // El perfil se creará automáticamente por el trigger de la base de datos
          const user: User = {
            uid: data.user.id,
            email: data.user.email || email,
            displayName: userData.displayName,
            photoURL: data.user.user_metadata?.avatar_url,
            createdAt: new Date(data.user.created_at),
          };

          setAuthState({ user, loading: false, error: null });

          // Guarda el email para la pantalla de verificación
          if (typeof window !== "undefined") {
            localStorage.setItem("pendingVerificationEmail", email);
          }

          // Redirige a la pantalla de verificación
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);

          // Si quieres seguir intentando cargar el perfil, puedes dejar el setTimeout
        }
      } catch (error: any) {
        console.error("SignUp error details:", error);
        const authError: AuthError = {
          code: error.status || "unknown",
          message: error.message || "Ocurrió un error inesperado",
        };
        setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
        throw authError;
      }
    },
    [loadUserProfile, router]
  );

  const signOut = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      const authError: AuthError = {
        code: error.status || "unknown",
        message: getErrorMessage(error.message),
      };
      setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
      throw authError;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setAuthState((prev) => ({ ...prev, loading: false }));
    } catch (error: any) {
      const authError: AuthError = {
        code: error.status || "unknown",
        message: getErrorMessage(error.message),
      };
      setAuthState((prev) => ({ ...prev, loading: false, error: authError }));
      throw authError;
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (!authState.user) return;

    try {
      setProfileLoading(true);
      const profile = await getUserProfile(authState.user.uid);
      setUserProfile(toCamelCaseProfile(profile));
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, [authState.user]);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    userProfile,
    profileLoading,
    userPlan,
    updatePlan,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    refreshUserProfile,
    clearError,
  };
};

// Función auxiliar para traducir errores
const getErrorMessage = (message: string): string => {
  const errorMessages: { [key: string]: string } = {
    "Invalid login credentials": "Credenciales inválidas",
    "Email not confirmed": "Email no confirmado",
    "User already registered": "Usuario ya registrado",
    "Password should be at least 6 characters":
      "La contraseña debe tener al menos 6 caracteres",
    "Unable to validate email address":
      "No se pudo validar la dirección de email",
    "auth/user-not-found": "No existe una cuenta con este correo electrónico",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/email-already-in-use": "Este correo electrónico ya está en uso",
    "auth/weak-password": "La contraseña es demasiado débil",
    "auth/invalid-email": "Correo electrónico inválido",
  };
  return errorMessages[message] || message;
};
