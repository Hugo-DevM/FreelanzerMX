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
  const { user, loading: authLoading } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    // Esperar a que el auth termine de cargar antes de intentar cargar datos
    if (authLoading) return;
    if (!user) {
      // Si no hay usuario pero hay datos en cache, mantenerlos por un tiempo
      // Esto evita que se pierdan los datos cuando la sesión se pierde temporalmente
      if (projects.length > 0) {
        // No limpiar inmediatamente, esperar a que la sesión se recupere
        return;
      }
      return;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchData = useCallback(async () => {
    if (authLoading) return;
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
  }, [user, authLoading]);

  const refreshData = useCallback(async () => {
    if (authLoading) return;
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
  }, [user, authLoading]);

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
