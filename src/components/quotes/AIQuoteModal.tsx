"use client";

import React, { useState } from "react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Button from "../ui/Button";
import { generateQuoteWithAI, GenerateAIQuoteInput } from "../../services/aiService";
import { QuoteData } from "../../services/quoteService";

type Props = {
    open: boolean;
    onClose: () => void;
    defaultFreelancerName?: string;
    onGenerated: (data: Partial<QuoteData>) => void;
};

export default function AIQuoteModal({
    open,
    onClose,
    defaultFreelancerName,
    onGenerated,
}: Props) {
    const [values, setValues] = useState<GenerateAIQuoteInput>({
        freelancerName: defaultFreelancerName || "",
        clientName: "",
        projectSummary: "",
        servicesDraft: [],
        city: "",
        currency: "MXN",
        validity: 15,
        deliveryTime: 10,
        paymentTerms: "50% anticipo, 50% contra entrega",
        tone: "formal",
    });
    const [servicesInput, setServicesInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const run = async () => {
        try {
            setLoading(true);
            setError(null);
            const input: GenerateAIQuoteInput = {
                ...values,
                servicesDraft: servicesInput
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
            };
            const ai = await generateQuoteWithAI(input);
            onGenerated(ai);
            onClose();
        } catch (e: any) {
            setError(e?.message || "Error al generar cotización");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 sm:p-6">
            <Card className="relative w-full max-w-3xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-2">
                    Generar cotización con IA
                </h3>

                <fieldset disabled={loading} className="grid grid-cols-1 gap-4">
                    <Input
                        label="Tu nombre o marca"
                        value={values.freelancerName}
                        onChange={(e: any) =>
                            setValues((v) => ({ ...v, freelancerName: e.target.value }))
                        }
                    />
                    <Input
                        label="Cliente"
                        value={values.clientName}
                        onChange={(e: any) =>
                            setValues((v) => ({ ...v, clientName: e.target.value }))
                        }
                    />
                    <TextArea
                        label="Resumen del proyecto (objetivos, alcance, entregables)"
                        value={values.projectSummary}
                        onChange={(e: any) =>
                            setValues((v) => ({ ...v, projectSummary: e.target.value }))
                        }
                    />
                    <TextArea
                        label="Servicios (uno por línea)"
                        placeholder="Diseño de landing page\nImplementación en Next.js\nOptimización SEO básica"
                        value={servicesInput}
                        onChange={(e: any) => setServicesInput(e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Ciudad"
                            value={values.city}
                            onChange={(e: any) =>
                                setValues((v) => ({ ...v, city: e.target.value }))
                            }
                        />
                        <Input
                            label="Moneda"
                            value={values.currency}
                            onChange={(e: any) =>
                                setValues((v) => ({ ...v, currency: e.target.value }))
                            }
                        />
                        <Input
                            type="number"
                            label="Validez (días)"
                            value={values.validity}
                            onChange={(e: any) =>
                                setValues((v) => ({ ...v, validity: Number(e.target.value) }))
                            }
                        />
                        <Input
                            type="number"
                            label="Tiempo de entrega (días)"
                            value={values.deliveryTime}
                            onChange={(e: any) =>
                                setValues((v) => ({
                                    ...v,
                                    deliveryTime: Number(e.target.value),
                                }))
                            }
                        />
                    </div>
                    <Input
                        label="Términos de pago"
                        value={values.paymentTerms}
                        onChange={(e: any) =>
                            setValues((v) => ({ ...v, paymentTerms: e.target.value }))
                        }
                    />
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                </fieldset>

                <div className="mt-6 flex justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={run}
                        disabled={loading || !values.clientName || !values.freelancerName}
                    >
                        {loading ? "Generando..." : "Generar"}
                    </Button>
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <div className="h-8 w-8 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin" />
                        <p className="text-sm text-[#1A1A1A]">Generando cotización con IA...</p>
                    </div>
                )}
            </Card>
        </div>
    );
}