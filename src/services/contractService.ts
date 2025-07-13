import { supabase } from "../lib/supabase";

export interface ContractData {
  id: string;
  user_id: string;
  freelancer_name: string;
  client_name: string;
  service: string;
  amount: number;
  currency: string;
  payment_method: string;
  start_date: string;
  delivery_date: string;
  city: string;
  status: string; // 'pendiente' | 'en proceso' | 'completado'
  created_at: Date;
  updated_at: Date;
}

export interface CreateContractData {
  user_id: string;
  freelancer_name: string;
  client_name: string;
  service: string;
  amount: number;
  currency: string;
  payment_method: string;
  start_date: string;
  delivery_date: string;
  city: string;
}

export const createContract = async (
  contractData: CreateContractData
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .insert([contractData])
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (error: any) {
    console.error("Error creating contract:", error);
    throw new Error(
      `Error al crear el contrato: ${error.message || "Error desconocido"}`
    );
  }
};

export const getUserContracts = async (
  userId: string
): Promise<ContractData[]> => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((contract) => ({
      ...contract,
      created_at: new Date(contract.created_at),
      updated_at: new Date(contract.updated_at),
    })) as ContractData[];
  } catch (error: any) {
    console.error("Error getting user contracts:", error);
    throw new Error("Error al obtener los contratos");
  }
};

export const getContract = async (
  contractId: string
): Promise<ContractData | null> => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    } as ContractData;
  } catch (error: any) {
    console.error("Error getting contract:", error);
    throw new Error("Error al obtener el contrato");
  }
};

export const updateContract = async (
  contractId: string,
  updates: Partial<ContractData>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("contracts")
      .update(updates)
      .eq("id", contractId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating contract:", error);
    throw new Error(
      `Error al actualizar el contrato: ${error.message || "Error desconocido"}`
    );
  }
};

export const deleteContract = async (contractId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("contracts")
      .delete()
      .eq("id", contractId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting contract:", error);
    throw new Error(
      `Error al eliminar el contrato: ${error.message || "Error desconocido"}`
    );
  }
};
