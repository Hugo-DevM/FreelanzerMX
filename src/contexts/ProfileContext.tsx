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
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (!user) return;

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
  }, [user, fetchData]);

  const refreshData = useCallback(async () => {
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
  }, [user]);

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
