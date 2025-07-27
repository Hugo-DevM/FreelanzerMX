import nodemailer from "nodemailer";

// Configuración de Brevo SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.BREVO_SMTP_USER, // Tu email de Brevo
    pass: process.env.BREVO_SMTP_PASS, // Tu contraseña SMTP de Brevo
  },
});

export async function sendTaskNotificationEmail(
  toEmail: string,
  toName: string,
  taskName: string,
  dueDate: string
) {
  const mailOptions = {
    // Actualizar el remitente con tu nuevo dominio
    from: `"Freelanzer" <freelanzer@freelanzer.mx>`,
    to: `${toName} <${toEmail}>`,
    subject: `Tarea próxima a vencer: ${taskName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Hola ${toName}!</h2>
        <p>La tarea <strong>${taskName}</strong> está próxima a vencer el <strong>${dueDate}</strong>.</p>
        <p style="color: #666;">¡No la dejes pasar!</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Saludos,<br/>Freelanzer</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
}

// NUEVO: Función para enviar notificaciones de proyectos próximos a vencer
export async function sendProjectNotificationEmail(
  toEmail: string,
  toName: string,
  projectName: string,
  dueDate: string
) {
  const mailOptions = {
    from: `"Freelanzer" <freelanzer@freelanzer.mx>`,
    to: `${toName} <${toEmail}>`,
    subject: `Proyecto próximo a vencer: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Hola ${toName}!</h2>
        <p>El proyecto <strong>${projectName}</strong> está próximo a vencer el <strong>${dueDate}</strong>.</p>
        <p style="color: #666;">¡Asegúrate de completarlo a tiempo!</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Saludos,<br/>Freelanzer</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email de proyecto enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error enviando email de proyecto:", error);
    throw error;
  }
}
