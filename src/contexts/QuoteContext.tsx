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
  setQuotes: React.Dispatch<React.SetStateAction<QuoteData[]>>;
  userId: string | null;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuthContext();
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    // Esperar a que el auth termine de cargar antes de intentar cargar datos
    if (authLoading) return;
    if (!user) {
      // Si no hay usuario pero hay datos en cache, mantenerlos por un tiempo
      // Esto evita que se pierdan los datos cuando la sesión se pierde temporalmente
      if (quotes.length > 0) {
        // No limpiar inmediatamente, esperar a que la sesión se recupere
        return;
      }
      return;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchData = useCallback(async () => {
    if (authLoading) return;
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
  }, [user, authLoading]);

  const refreshData = useCallback(async () => {
    if (authLoading) return;
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
  }, [user, authLoading]);

  return (
    <QuoteContext.Provider
      value={{
        quotes,
        loading,
        error,
        fetched,
        fetchData,
        refreshData,
        setQuotes,
        userId: user?.uid || null,
      }}
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
