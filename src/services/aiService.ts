import { QuoteData } from "./quoteService";

export type GenerateAIQuoteInput = {
    freelancerName: string;
    clientName: string;
    projectSummary: string;
    servicesDraft?: string[];
    city?: string;
    currency?: string;
    validity?: number;
    deliveryTime?: number;
    paymentTerms?: string;
    tone?: "formal" | "neutral" | "convincing";
};

export async function generateQuoteWithAI(
    input: GenerateAIQuoteInput
): Promise<Partial<QuoteData>> {
    const res = await fetch("/api/ai/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo generar la cotización con IA");
    }
    const json = await res.json();
    return json.quote as Partial<QuoteData>;
}