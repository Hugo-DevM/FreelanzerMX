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
  status: string;
  quote_id?: string;
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
  quote_id?: string;
}

export const createContract = async (
  contractData: CreateContractData
): Promise<string> => {
  try {
    console.log("createContract - Datos recibidos:", contractData);

    // Verificar que todos los campos requeridos estén presentes
    const requiredFields = [
      "user_id",
      "freelancer_name",
      "client_name",
      "service",
      "amount",
      "currency",
      "payment_method",
      "start_date",
      "delivery_date",
      "city",
    ]; // quote_id es opcional

    const missingFields = requiredFields.filter((field) => {
      const value = contractData[field as keyof CreateContractData];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      throw new Error(`Campos faltantes: ${missingFields.join(", ")}`);
    }

    // Filtrar campos opcionales que estén vacíos
    const cleanContractData = { ...contractData };
    if (!cleanContractData.quote_id || cleanContractData.quote_id === "") {
      delete cleanContractData.quote_id;
    }

    const { data, error } = await supabase
      .from("contracts")
      .insert([cleanContractData])
      .select("id")
      .single();

    console.log("createContract - Respuesta de Supabase:", { data, error });

    if (error) {
      console.error("createContract - Error de Supabase:", error);
      throw error;
    }

    console.log("createContract - Contrato creado exitosamente:", data);
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
      .select(
        "id, client_name, freelancer_name, service, amount, currency, payment_method, start_date, delivery_date, city, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) {
      return [];
    }
    return data.map((contract: Record<string, any>) => ({
      ...contract,
      created_at: new Date(contract.created_at),
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

export const getConvertedQuoteIds = async (
  userId: string
): Promise<string[]> => {
  try {
    console.log("Buscando contratos para usuario:", userId);

    // Una sola consulta para obtener todos los contratos del usuario
    const { data, error } = await supabase
      .from("contracts")
      .select("quote_id")
      .eq("user_id", userId);

    if (error) throw error;

    if (!data) {
      return [];
    }

    const quoteIds = data
      .map((contract: { quote_id?: string | null }) => contract.quote_id)
      .filter((quoteId: string | null | undefined): quoteId is string =>
        quoteId !== null && quoteId !== undefined
      );

    console.log("IDs de cotizaciones convertidas:", quoteIds);

    return quoteIds;
  } catch (error: any) {
    console.error("Error getting converted quote IDs:", error);
    throw new Error("Error al obtener las cotizaciones convertidas");
  }
};
