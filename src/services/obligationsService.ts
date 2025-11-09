// src/services/obligationsService.ts
import { supabase } from "../lib/supabase";

export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
}

export interface ServiceKeyword {
  id: number;
  category_id: number;
  keyword: string;
  weight: number;
}

export interface FreelancerObligation {
  id: number;
  category_id: number | null;
  obligation: string;
  is_base_obligation: boolean;
  order_index: number;
}

export const detectServiceCategory = async (
  serviceDescription: string
): Promise<ServiceCategory | null> => {
  try {
    const serviceLower = serviceDescription.toLowerCase();

    // Obtener todas las palabras clave con sus categorías
    const { data: keywords, error } = await supabase
      .from("service_keywords")
      .select(
        `
        *,
        service_categories (
          id,
          name,
          description
        )
      `
      )
      .order("weight", { ascending: false });

    if (error) throw error;

    // Encontrar la categoría con mayor puntuación
    let bestMatch: { category: ServiceCategory; score: number } | null = null;

    if (keywords) {
      for (const keyword of keywords) {
        if (serviceLower.includes(keyword.keyword.toLowerCase())) {
          const score = keyword.weight;

          if (!bestMatch || score > bestMatch.score) {
            bestMatch = {
              category: keyword.service_categories,
              score: score,
            };
          }
        }
      }
    }

    return bestMatch ? bestMatch.category : null;
  } catch (error) {
    console.error("Error detecting service category:", error);
    return null;
  }
};

export const getFreelancerObligations = async (
  serviceDescription: string
): Promise<string[]> => {
  try {
    // Detectar categoría del servicio
    const category = await detectServiceCategory(serviceDescription);

    // Obtener obligaciones base
    const { data: baseObligations, error: baseError } = await supabase
      .from("freelancer_obligations")
      .select("obligation")
      .eq("is_base_obligation", true)
      .order("order_index");

    if (baseError) throw baseError;

    // Obtener obligaciones específicas de la categoría
    let specificObligations: string[] = [];

    if (category) {
      const { data: categoryObligations, error: categoryError } = await supabase
        .from("freelancer_obligations")
        .select("obligation")
        .eq("category_id", category.id)
        .eq("is_base_obligation", false)
        .order("order_index");

      if (categoryError) throw categoryError;
      specificObligations = categoryObligations?.map((o: { obligation: string }) => o.obligation) || [];
    }

    // Combinar obligaciones específicas + base
    const allObligations = [
      ...specificObligations,
      ...(baseObligations?.map((o: { obligation: string }) => o.obligation) || []),
    ];

    return allObligations;
  } catch (error) {
    console.error("Error getting freelancer obligations:", error);
    // Fallback a obligaciones genéricas
    return [
      `Ejecutar el servicio de "${serviceDescription}" de manera profesional y eficiente.`,
      "Cumplir con todos los entregables acordados en el contrato.",
      "Mantener estándares de calidad profesionales en todo el trabajo realizado.",
      "Entregar el trabajo dentro del plazo establecido.",
      "Realizar hasta dos rondas de ajustes menores sin costo adicional.",
    ];
  }
};
