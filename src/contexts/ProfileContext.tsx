"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { UserProfile, getUserProfile } from "../services/userService";
import { useAuthContext } from "./AuthContext";

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchData = useCallback(async () => {
    if (authLoading) return;
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile(user.uid);
      setProfile(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-profile`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al cargar perfil");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Esperar a que el auth termine de cargar antes de intentar cargar datos
    if (authLoading) return;
    if (!user) {
      // Si no hay usuario pero hay datos en cache, mantenerlos por un tiempo
      // Esto evita que se pierdan los datos cuando la sesión se pierde temporalmente
      if (profile) {
        // No limpiar inmediatamente, esperar a que la sesión se recupere
        return;
      }
      return;
    }

    const cacheKey = `${user.uid}-profile`;
    const cached = localStorage.getItem(cacheKey);
    let loadedFromCache = false;

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) {
          setProfile(parsed);
          setFetched(true);
          setLoading(false);
          loadedFromCache = true;
        }
      } catch (error) {
        setFetched(false);
        setLoading(false);
      }
    }

    if (!loadedFromCache && !loading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, fetchData]);

  const refreshData = useCallback(async () => {
    if (authLoading) return;
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile(user.uid);
      setProfile(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-profile`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al recargar perfil");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <ProfileContext.Provider
      value={{ profile, loading, error, fetched, fetchData, refreshData }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
};
