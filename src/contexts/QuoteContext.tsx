"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { QuoteData } from "../services/quoteService";
import { getUserQuotes } from "../services/quoteService";
import { useAuthContext } from "./AuthContext";

interface QuoteContextType {
  quotes: QuoteData[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    const cacheKey = `${user.uid}-quotes`;
    const cached = localStorage.getItem(cacheKey);
    let loadedFromCache = false;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setQuotes(parsed);
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
      const data = await getUserQuotes(user.uid);
      setQuotes(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-quotes`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al cargar cotizaciones");
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
      console.log("Refrescando cotizaciones desde Supabase...");
      const data = await getUserQuotes(user.uid);
      setQuotes(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-quotes`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al recargar cotizaciones");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <QuoteContext.Provider
      value={{ quotes, loading, error, fetched, fetchData, refreshData }}
    >
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuotes = () => {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuotes must be used within a QuoteProvider");
  return ctx;
};
