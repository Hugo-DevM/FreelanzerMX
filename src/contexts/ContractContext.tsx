"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ContractData } from "../services/contractService";
import { getUserContracts } from "../services/contractService";
import { useAuthContext } from "./AuthContext";

interface ContractContextType {
  contracts: ContractData[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const ContractContext = createContext<ContractContextType | undefined>(
  undefined
);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuthContext();
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    // Esperar a que el auth termine de cargar antes de intentar cargar datos
    if (authLoading) return;
    if (!user) {
      // Si no hay usuario pero hay datos en cache, mantenerlos por un tiempo
      // Esto evita que se pierdan los datos cuando la sesión se pierde temporalmente
      if (contracts.length > 0) {
        // No limpiar inmediatamente, esperar a que la sesión se recupere
        return;
      }
      return;
    }
    const cacheKey = `${user.uid}-contracts`;
    const cached = localStorage.getItem(cacheKey);
    let loadedFromCache = false;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setContracts(parsed);
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
      const data = await getUserContracts(user.uid);
      setContracts(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-contracts`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al cargar contratos");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const refreshData = useCallback(async () => {
    if (authLoading) return;
    if (!user) return;
    console.log(
      "refreshData - Iniciando refresco de contratos para usuario:",
      user.uid
    );
    setLoading(true);
    setError(null);
    try {
      console.log("Refrescando contratos desde Supabase...");
      const data = await getUserContracts(user.uid);
      console.log("refreshData - Contratos obtenidos:", data.length);
      setContracts(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-contracts`, JSON.stringify(data));
      console.log("refreshData - Refresco completado exitosamente");
    } catch (err: any) {
      console.error("refreshData - Error:", err);
      setError(err.message || "Error al recargar contratos");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <ContractContext.Provider
      value={{ contracts, loading, error, fetched, fetchData, refreshData }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => {
  const ctx = useContext(ContractContext);
  if (!ctx)
    throw new Error("useContracts must be used within a ContractProvider");
  return ctx;
};
