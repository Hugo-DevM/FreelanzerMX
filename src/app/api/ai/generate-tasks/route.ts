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

        const today = new Date().toISOString().split("T")[0];

        const userPrompt = `
Genera una lista COMPLETA y EXHAUSTIVA de tareas específicas para el siguiente proyecto.

REQUISITOS IMPORTANTES:
- Cada tarea debe ser MUY específica y accionable.
- Prohibido crear tareas generales o ambiguas.
- Divide tareas grandes en microtareas.
- NO limites la cantidad de tareas. Genera tantas como sean necesarias.
- Cada tarea debe tener su propia fecha límite realista (dueDate).

CÓMO CALCULAR LA FECHA LÍMITE (dueDate):
1. Hoy es: ${today}
2. La fecha límite del proyecto es: ${projectDueDate || "No proporcionada"}
3. Calcula cuántos días hay entre hoy y la fecha límite.
4. Reparte ese tiempo entre todas las tareas generadas.
5. Las tareas tempranas deben tener fechas más próximas.
6. La última tarea puede coincidir con la fecha límite del proyecto.
7. Prohibido asignar a todas las tareas la fecha final del proyecto.

FORMATO JSON ESTRICTO:
{
  "tasks": [
    {
      "title": "texto",
      "description": "texto",
      "estimatedHours": número,
      "dueDate": "YYYY-MM-DD"
    }
  ]
}

Contexto del proyecto:
- Nombre: ${projectName || "Proyecto sin nombre"}
- Descripción: ${projectDescription}
${projectDueDate ? `- Fecha límite del proyecto: ${projectDueDate}` : ""}

Devuelve SOLO JSON válido.
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
                            "Eres un experto en gestión de proyectos. Responde siempre en JSON estricto y válido.",
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
            dueDate: task.dueDate || projectDueDate || null,
        }));

        if (tasks.length === 0) {
            return NextResponse.json(
                { error: "No se generaron tareas. Intenta con una descripción más detallada." },
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
