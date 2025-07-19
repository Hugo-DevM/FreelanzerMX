"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { DashboardData } from "../types/dashboard";
import { getDashboardData } from "../services/dashboardService";
import { useAuthContext } from "./AuthContext";

interface DashboardContextType {
  dashboard: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    const cacheKey = `${user.uid}-dashboard`;
    const cached = localStorage.getItem(cacheKey);
    let loadedFromCache = false;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) {
          setDashboard(parsed);
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
      const data = await getDashboardData(user.uid);
      setDashboard(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-dashboard`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al cargar dashboard");
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
      console.log("Refrescando dashboard desde Supabase...");
      const data = await getDashboardData(user.uid);
      setDashboard(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-dashboard`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al recargar dashboard");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <DashboardContext.Provider
      value={{ dashboard, loading, error, fetched, fetchData, refreshData }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
};
