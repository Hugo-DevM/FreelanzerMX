import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing DEEPSEEK_API_KEY" }, { status: 500 });
        }

        const body = await req.json();
        const {
            freelancerName,
            clientName,
            projectSummary,
            servicesDraft,
            city,
            currency = "MXN",
            validity = 15,
            deliveryTime = 10,
            paymentTerms = "50% anticipo, 50% contra entrega",
            tone = "formal",
        } = body || {};

        const userPrompt = `
Genera una cotización profesional y muy clara en JSON ESTRICTO (sin texto adicional).
Campos requeridos:
{
  "client": { "name": "${clientName}", "email": "", "phone": "", "address": "" },
  "freelancer": { "name": "${freelancerName}" },
  "city": "${city || ""}",
  "currency": "${currency}",
  "validity": ${validity},
  "delivery_time": ${deliveryTime},
  "payment_terms": "${paymentTerms}",
  "tax": { "rate": 0, "amount": 0 },
  "delivery_date": "${new Date().toISOString().slice(0, 10)}",
  "services": [
    // lista con: name, description, quantity, unit_price, total
  ],
  "notes": "términos adicionales si aplica"
}

Contexto del proyecto: ${projectSummary || ""}

Servicios tentativos: ${(servicesDraft || []).join("; ")}

Estilo de redacción: ${tone}.
Asegúrate que "total" en cada servicio sea quantity * unit_price y que el JSON sea válido.
`;

        const resp = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content:
                            "Eres un asistente experto en redacción de cotizaciones para freelancers en español. Responde únicamente con JSON válido.",
                    },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.2,
                response_format: { type: "json_object" },
            }),
        });

        if (!resp.ok) {
            const text = await resp.text();
            const is402 = resp.status === 402 || text.includes("Insufficient Balance");
            return NextResponse.json(
                { error: is402 ? "Saldo insuficiente en DeepSeek. Recarga tu cuenta o usa otra API Key." : text },
                { status: resp.status }
            );
        }

        const data = await resp.json();
        const content = data?.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(content);

        const services = (parsed.services || []).map((s: any, i: number) => ({
            id: String(i + 1),
            description: `${s.name}: ${s.description}`,
            price: Number(s.total) || 0,
        }));

        const subtotal = services.reduce((acc: number, s: any) => acc + (s.price || 0), 0);
        const taxRate = Number(parsed?.tax?.rate || 0);
        const taxAmount = Number(parsed?.tax?.amount || 0);
        const total = subtotal + taxAmount;

        const mapped = {
            freelancer_name: freelancerName || parsed?.freelancer?.name || "",
            client_name: clientName || parsed?.client?.name || "",
            client_email: parsed?.client?.email || "",
            client_phone: parsed?.client?.phone || "",
            client_address: parsed?.client?.address || "",
            service_description: services.map((s: any) => s.description).join(", "),
            services,
            subtotal,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total,
            currency,
            payment_terms: parsed?.payment_terms || paymentTerms,
            delivery_date: parsed?.delivery_date || new Date().toISOString().slice(0, 10),
            delivery_time: parsed?.delivery_time ?? deliveryTime,
            city: parsed?.city || city || "",
            status: "draft",
            validity: parsed?.validity ?? validity,
        };

        return NextResponse.json({ quote: mapped });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "AI error" }, { status: 500 });
    }
}