import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing DEEPSEEK_API_KEY" }, { status: 500 });
        }

        const body = await req.json();
        const { tasks } = body || {};

        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return NextResponse.json(
                { error: "La lista de tareas es requerida y no puede estar vacía." },
                { status: 400 }
            );
        }

        const userPrompt = `
Optimiza las prioridades y el orden de esta lista de tareas. 
Debes analizar:
- Título
- Descripción
- Fecha límite (dueDate)
- Horas estimadas (estimatedHours)
- Estado actual (status)

Reglas obligatorias:
1. Mantén los IDs EXACTOS tal como vienen.
2. No elimines tareas, no crees nuevas.
3. Devuelve prioridad: "high", "medium", "low".
4. Devuelve un campo "order" que indique el orden óptimo (1 = más importante).
5. NO agregues texto fuera del JSON estricto.

Tareas a optimizar:
${JSON.stringify(tasks, null, 2)}

Formato JSON ESTRICTO:
{
  "tasks": [
    {
      "id": "id-de-la-tarea",
      "priority": "high",
      "order": 1
    }
  ]
}
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
                            "Eres un asistente experto en gestión de proyectos. Devuelve SIEMPRE JSON válido, sin explicaciones ni texto adicional.",
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
                {
                    error: is402
                        ? "Saldo insuficiente en DeepSeek. Recarga tu cuenta o usa otra API Key."
                        : text,
                },
                { status: resp.status }
            );
        }

        const data = await resp.json();
        const content = data?.choices?.[0]?.message?.content || "{}";

        const parsed = JSON.parse(content);

        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
            return NextResponse.json(
                { error: "Respuesta inválida del modelo IA" },
                { status: 500 }
            );
        }

        const sanitized = parsed.tasks.map((t: any) => ({
            id: t.id,
            priority: ["high", "medium", "low"].includes(t.priority)
                ? t.priority
                : "medium",
            order: typeof t.order === "number" ? t.order : 999,
        }));

        return NextResponse.json({ tasks: sanitized });
    } catch (e: any) {
        console.error("Error optimizing priorities:", e);
        return NextResponse.json(
            { error: e?.message || "Error al optimizar prioridades" },
            { status: 500 }
        );
    }
}
