"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Project } from "../types/project";
import { getUserProjects } from "../services/projectService";
import { useAuthContext } from "./AuthContext";

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    const cacheKey = `${user.uid}-projects`;
    const cached = localStorage.getItem(cacheKey);
    let loadedFromCache = false;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setProjects(parsed);
          setFetched(true);
          setLoading(false);
          loadedFromCache = true;
        }
      } catch {
        setFetched(false);
        setLoading(false);
      }
    }

    if (!loadedFromCache && !loading) {
      fetchData();
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProjects(user.uid);
      setProjects(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-projects`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al cargar proyectos");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Refrescando proyectos desde Supabase...");
      const data = await getUserProjects(user.uid);
      setProjects(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-projects`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al recargar proyectos");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <ProjectContext.Provider
      value={{ projects, loading, error, fetched, fetchData, refreshData }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx)
    throw new Error("useProjects must be used within a ProjectProvider");
  return ctx;
};
