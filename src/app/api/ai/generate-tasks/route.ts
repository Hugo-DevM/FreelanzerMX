import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing DEEPSEEK_API_KEY" }, { status: 500 });
        }

        const body = await req.json();
        const { projectDescription, projectName, projectDueDate } = body || {};

        if (!projectDescription || projectDescription.trim() === "") {
            return NextResponse.json(
                { error: "La descripción del proyecto es requerida" },
                { status: 400 }
            );
        }

        const userPrompt = `
Genera una lista de tareas específicas y accionables para el siguiente proyecto en formato JSON ESTRICTO (sin texto adicional).

Contexto del proyecto:
- Nombre: ${projectName || "Proyecto sin nombre"}
- Descripción: ${projectDescription}
${projectDueDate ? `- Fecha límite: ${projectDueDate}` : ""}

Genera entre 3 y 8 tareas relevantes basadas en la descripción del proyecto. Cada tarea debe incluir:
- title: Título claro y específico de la tarea (máximo 60 caracteres)
- description: Descripción breve de lo que implica la tarea (opcional, máximo 150 caracteres)
- estimatedHours: Horas estimadas para completar la tarea (número entero, entre 1 y 40 horas)

Formato JSON requerido:
{
  "tasks": [
    {
      "title": "Título de la tarea",
      "description": "Descripción opcional de la tarea",
      "estimatedHours": 4
    }
  ]
}

Las tareas deben ser:
1. Específicas y accionables
2. Ordenadas lógicamente (desde las más básicas hasta las más complejas)
3. Realistas en términos de tiempo estimado
4. Relevantes para el tipo de proyecto descrito
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
                            "Eres un asistente experto en gestión de proyectos y planificación de tareas para freelancers. Responde únicamente con JSON válido, sin texto adicional antes o después.",
                    },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.3,
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

        // Validar y formatear las tareas
        const tasks = (parsed.tasks || []).map((task: any) => ({
            title: task.title || "Tarea sin título",
            description: task.description || undefined,
            estimatedHours: task.estimatedHours
                ? Math.max(1, Math.min(40, Math.round(task.estimatedHours)))
                : 4,
        }));

        if (tasks.length === 0) {
            return NextResponse.json(
                { error: "No se pudieron generar tareas. Por favor, intenta con una descripción más detallada." },
                { status: 400 }
            );
        }

        return NextResponse.json({ tasks });
    } catch (e: any) {
        console.error("Error generating tasks:", e);
        return NextResponse.json(
            { error: e?.message || "Error al generar las tareas con IA" },
            { status: 500 }
        );
    }
}

