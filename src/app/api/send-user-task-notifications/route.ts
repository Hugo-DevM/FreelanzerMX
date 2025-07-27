import { NextRequest, NextResponse } from "next/server";
import { getTasksDueSoonForUser } from "@/services/taskService";
import { sendTaskNotificationEmail } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const tasks = await getTasksDueSoonForUser(userId);
    const results = [];

    for (const task of tasks) {
      const res = await sendTaskNotificationEmail(
        task.user.email,
        task.user.name,
        task.title,
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

    return NextResponse.json({
      success: true,
      results,
      totalTasks: tasks.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
