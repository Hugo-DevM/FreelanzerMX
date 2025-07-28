import { NextResponse } from "next/server";
import { getTasksDueSoon } from "@/services/taskService";
import { sendTaskNotificationEmail } from "@/services/emailService";

export async function GET() {
  try {
    const tasks = await getTasksDueSoon();
    const results = [];

    for (const task of tasks) {
      const res = await sendTaskNotificationEmail(
        task.user.email,
        task.user.name,
        task.title, // Cambiado de task.name a task.title
        new Date(task.dueDate).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      results.push({
        taskId: task.id,
        email: task.user.email,
        status: "sent",
        res,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const tasks = await getTasksDueSoon();
    const results = [];

    for (const task of tasks) {
      const res = await sendTaskNotificationEmail(
        task.user.email,
        task.user.name,
        task.title, // Cambiado de task.name a task.title
        new Date(task.dueDate).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      results.push({
        taskId: task.id,
        email: task.user.email,
        status: "sent",
        res,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
