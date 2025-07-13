import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const to = formData.get("to") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;
    const pdfFile = formData.get("pdf") as File;

    if (!to || !subject || !body || !pdfFile) {
      return NextResponse.json(
        { success: false, message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
    });

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: body,
      attachments: [
        {
          filename: pdfFile.name,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: "Email enviado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, message: "Error al enviar el email" },
      { status: 500 }
    );
  }
}
