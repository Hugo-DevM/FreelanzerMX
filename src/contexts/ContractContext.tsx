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
  const { user } = useAuthContext();
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  const fetchData = useCallback(async () => {
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
  }, [user]);

  const refreshData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      console.log("Refrescando contratos desde Supabase...");
      const data = await getUserContracts(user.uid);
      setContracts(data);
      setFetched(true);
      localStorage.setItem(`${user.uid}-contracts`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Error al recargar contratos");
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
