import { NextRequest, NextResponse } from "next/server";
import { getProjectsDueSoonForUser } from "@/services/projectService";
import { sendProjectNotificationEmail } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const projects = await getProjectsDueSoonForUser(userId);
    const results = [];

    for (const project of projects) {
      // CORREGIDO: Formatear la fecha correctamente
      const dueDate = new Date(project.dueDate + "T00:00:00");
      const formattedDate = dueDate.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      console.log(
        `Proyecto: ${project.name}, Due Date Original: ${project.dueDate}, Formateado: ${formattedDate}`
      );

      const res = await sendProjectNotificationEmail(
        project.user.email,
        project.user.name,
        project.name,
        formattedDate
      );
      results.push({
        projectId: project.id,
        email: project.user.email,
        status: "sent",
        res,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      totalProjects: projects.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
