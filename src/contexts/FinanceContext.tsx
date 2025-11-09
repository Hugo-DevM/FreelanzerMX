"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "./AuthContext";

export interface Transaction {
  id: string;
  tipo: "ingreso" | "egreso";
  concepto: string;
  categoria: string;
  monto: number;
  fecha: string;
  user_id: string;
  project_id?: string;
}

interface FinanceContextType {
  finances: Transaction[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuthContext();
  const [finances, setFinances] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    // Esperar a que el auth termine de cargar antes de intentar cargar datos
    if (authLoading) return;
    if (!user) {
      // Si no hay usuario pero hay datos en cache, mantenerlos por un tiempo
      // Esto evita que se pierdan los datos cuando la sesión se pierde temporalmente
      if (finances.length > 0) {
        // No limpiar inmediatamente, esperar a que la sesión se recupere
        return;
      }
      return;
    }
    const cacheKey = `${user.uid}-finances`;
    const cached = localStorage.getItem(cacheKey);
    let loadedFromCache = false;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setFinances(parsed);
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
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id, tipo, concepto, categoria, monto, fecha, user_id, project_id"
        )
        .eq("user_id", user.uid)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFinances((data as Transaction[]) || []);
      setFetched(true);
      localStorage.setItem(`${user.uid}-finances`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al cargar movimientos");
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
      console.log("Refrescando movimientos desde Supabase...");
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id, tipo, concepto, categoria, monto, fecha, user_id, project_id"
        )
        .eq("user_id", user.uid)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFinances((data as Transaction[]) || []);
      setFetched(true);
      localStorage.setItem(`${user.uid}-finances`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al recargar movimientos");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <FinanceContext.Provider
      value={{ finances, loading, error, fetched, fetchData, refreshData }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinances = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx)
    throw new Error("useFinances must be used within a FinanceProvider");
  return ctx;
};
