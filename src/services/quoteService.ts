import { supabase } from "../lib/supabase";

export interface ServiceItem {
  id: string;
  description: string;
  price: number;
}

export interface QuoteData {
  id: string;
  user_id: string;
  freelancer_name: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  service_description: string;
  services: ServiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  payment_terms?: string;
  delivery_date?: string;
  delivery_time?: number;
  city: string;
  status: "draft" | "sent" | "approved" | "rejected";
  created_at: Date;
  updated_at: Date;
  validity?: number;
}

export interface CreateQuoteData {
  user_id: string;
  freelancer_name: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  service_description: string;
  services: ServiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  payment_terms?: string;
  delivery_date?: string;
  delivery_time?: number;
  city: string;
  validity?: number;
}

export interface QuoteWithId extends QuoteData {
  id: string;
}

export const createQuote = async (
  quoteData: CreateQuoteData
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("quotes")
      .insert([quoteData])
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (error: any) {
    console.error("Error creating quote:", error);
    throw new Error(
      `Error al crear la cotización: ${error.message || "Error desconocido"}`
    );
  }
};

export const getUserQuotes = async (
  userId: string,
  limit: number = 20
): Promise<QuoteData[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Solo selecciona los campos necesarios para la vista principal
    const { data, error } = await supabase
      .from("quotes")
      .select(
        "id, client_name, services, total, status, delivery_date, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      if (error.code === "ABORT_ERR") {
        throw new Error("Timeout: La carga tardó demasiado");
      }
      throw error;
    }

    return (data || []).map((quote) => ({
      ...quote,
      created_at: new Date(quote.created_at),
    })) as QuoteData[];
  } catch (error: any) {
    console.error("Error getting user quotes:", error);
    if (error.message?.includes("Timeout")) {
      throw new Error("Error de timeout: La carga tardó demasiado");
    }
    throw new Error("Error al obtener las cotizaciones");
  }
};

export const getQuote = async (
  quoteId: string
): Promise<QuoteWithId | null> => {
  try {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    } as QuoteWithId;
  } catch (error: any) {
    console.error("Error getting quote:", error);
    throw new Error("Error al obtener la cotización");
  }
};

export const updateQuote = async (
  quoteId: string,
  updates: Partial<QuoteData>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("quotes")
      .update(updates)
      .eq("id", quoteId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating quote:", error);
    throw new Error(
      `Error al actualizar la cotización: ${
        error.message || "Error desconocido"
      }`
    );
  }
};

export const deleteQuote = async (quoteId: string): Promise<void> => {
  try {
    const { error } = await supabase.from("quotes").delete().eq("id", quoteId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting quote:", error);
    throw new Error(
      `Error al eliminar la cotización: ${error.message || "Error desconocido"}`
    );
  }
};

export const updateQuoteStatus = async (
  quoteId: string,
  status: QuoteData["status"]
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("quotes")
      .update({ status })
      .eq("id", quoteId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating quote status:", error);
    throw new Error(
      `Error al actualizar el estado: ${error.message || "Error desconocido"}`
    );
  }
};

export const getQuoteStats = async (userId: string) => {
  try {
    const quotes = await getUserQuotes(userId);

    const stats = {
      total: quotes.length,
      draft: quotes.filter((q) => q.status === "draft").length,
      sent: quotes.filter((q) => q.status === "sent").length,
      approved: quotes.filter((q) => q.status === "approved").length,
      rejected: quotes.filter((q) => q.status === "rejected").length,
      totalAmount: quotes.reduce((sum, q) => sum + q.total, 0),
      approvedAmount: quotes
        .filter((q) => q.status === "approved")
        .reduce((sum, q) => sum + q.total, 0),
    };

    return stats;
  } catch (error) {
    console.error("Error getting quote stats:", error);
    throw new Error("Error al obtener estadísticas de cotizaciones");
  }
};
