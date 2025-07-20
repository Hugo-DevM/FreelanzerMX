import jsPDF from "jspdf";
import { QuoteData } from "./quoteService";

export interface PDFContractData {
  freelancerName: string;
  clientName: string;
  service: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  startDate: string;
  deliveryDate: string;
  city: string;
}

export const generateQuotePDF = async (quoteData: QuoteData): Promise<Blob> => {
  const pdf = new jsPDF();

  const primaryColor = "#1A1A1A";
  const secondaryColor = "#666666";
  const accentColor = "#9ae600";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  function formatDateString(dateString: string) {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split("-");
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${year}`;
  }

  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 30;

  const addText = (text: string, x: number, y: number, options: any = {}) => {
    pdf.setFontSize(options.fontSize || 12);
    pdf.setTextColor(options.color || primaryColor);
    if (options.bold) pdf.setFont("helvetica", "bold");
    else pdf.setFont("helvetica", "normal");

    if (options.align === "center") {
      pdf.text(text, x, y, { align: "center" });
    } else if (options.align === "right") {
      pdf.text(text, x, y, { align: "right" });
    } else {
      pdf.text(text, x, y);
    }
  };

  const addLine = () => {
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pageWidth - margin, y);
  };

  // Título
  addText("COTIZACIÓN", pageWidth / 2, y, {
    fontSize: 20,
    bold: true,
    align: "center",
  });
  y += 8;
  addText("Servicios Profesionales", pageWidth / 2, y, {
    fontSize: 12,
    color: secondaryColor,
    align: "center",
  });
  y += 10;
  addLine();
  y += 10;

  // Info Freelancer y Cliente
  addText("Información del Freelancer", margin, y, {
    bold: true,
    fontSize: 12,
  });
  addText("Información del Cliente", pageWidth / 2 + 5, y, {
    bold: true,
    fontSize: 12,
  });
  y += 6;

  addText(`Nombre: ${quoteData.freelancer_name}`, margin, y);
  addText(`Nombre: ${quoteData.client_name}`, pageWidth / 2 + 5, y);
  y += 6;
  addText(`Ciudad: ${quoteData.city}`, margin, y);
  y += 6;
  addText(
    `Fecha: ${formatDateString(quoteData.delivery_date || "")}`,
    margin,
    y
  );
  y += 10;

  // Servicios
  addText("Servicios Cotizados", margin, y, { bold: true, fontSize: 12 });
  y += 8;

  quoteData.services.forEach((service) => {
    const desc = service.description;
    const price = `$${service.price.toLocaleString("es-MX")} MXN`;

    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");

    addText(desc, margin + 4, y + 7);
    addText(price, pageWidth - margin - 4, y + 7, {
      align: "right",
      bold: true,
    });

    y += 14;
  });

  // Total
  pdf.setFillColor(154, 230, 0);
  pdf.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
  addText(
    `Total: $${quoteData.total.toLocaleString("es-MX")} MXN`,
    pageWidth - margin - 4,
    y + 10,
    {
      fontSize: 14,
      bold: true,
      align: "right",
    }
  );
  y += 22;

  // Condiciones/Vigencia/Entrega
  addText("Condiciones de Pago", margin, y, { bold: true });
  addText("Vigencia", margin + contentWidth / 3, y, { bold: true });
  addText("Tiempo de Entrega", margin + (2 * contentWidth) / 3, y, {
    bold: true,
  });
  y += 6;
  addText(quoteData.payment_terms || "-", margin, y);
  addText(`${quoteData.validity} días naturales`, margin + contentWidth / 3, y);
  addText(
    `${quoteData.delivery_time} días hábiles`,
    margin + (2 * contentWidth) / 3,
    y
  );
  y += 16;

  // Footer
  addLine();
  y += 6;
  addText(
    `Esta cotización es válida por ${quoteData.validity} días naturales a partir de la fecha de emisión.`,
    pageWidth / 2,
    y,
    { align: "center", fontSize: 10, color: secondaryColor }
  );
  y += 5;
  addText(
    "Para cualquier consulta, no dude en contactarnos.",
    pageWidth / 2,
    y,
    {
      align: "center",
      fontSize: 10,
      color: secondaryColor,
    }
  );

  return pdf.output("blob");
};

export const downloadQuotePDF = async (
  quoteData: QuoteData,
  filename?: string
): Promise<void> => {
  try {
    const blob = await generateQuotePDF(quoteData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      filename ||
      `cotizacion-${quoteData.client_name}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Error al generar el PDF");
  }
};

export const generateContractPDF = async (
  contractData: PDFContractData
): Promise<Blob> => {
  const pdf = new jsPDF();
  const {
    freelancerName,
    clientName,
    service,
    amount,
    currency,
    paymentMethod,
    startDate,
    deliveryDate,
    city,
  } = contractData;

  let y = 30;
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("CONTRATO DE PRESTACIÓN DE SERVICIOS FREELANCE", 105, y, {
    align: "center",
  });
  y += 18;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("Entre:", 20, y);
  y += 10;
  pdf.setFont("helvetica", "bold");
  pdf.text(`Freelancer: ${freelancerName}`, 20, y);
  y += 9;
  pdf.text(`Cliente: ${clientName}`, 20, y);
  y += 9;
  pdf.text(`Ciudad: ${city}`, 20, y);
  y += 9;
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  pdf.text(
    `Fecha de inicio: ${parseLocalDate(startDate).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    20,
    y
  );
  y += 9;
  pdf.text(
    `Fecha de entrega: ${parseLocalDate(deliveryDate).toLocaleDateString(
      "es-MX",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    )}`,
    20,
    y
  );
  y += 18;

  function ensureSpace(pdf: jsPDF, y: number, needed: number = 20): number {
    if (y + needed > 270) {
      pdf.addPage();
      return 30;
    }
    return y;
  }

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("1. Objeto del contrato", 20, y);
  y += 9;
  pdf.setFont("helvetica", "normal");
  let lines = pdf.splitTextToSize(
    `El presente contrato tiene por objeto la prestación del servicio de ${service} por parte del freelancer ${freelancerName} para la cliente ${clientName}, conforme a los términos y condiciones que se detallan a continuación.`,
    170
  );
  y = ensureSpace(pdf, y, lines.length * 7 + 4);
  pdf.text(lines, 20, y);
  y += lines.length * 7 + 4;

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("2. Obligaciones del freelancer", 20, y);
  y += 9;
  pdf.setFont("helvetica", "normal");
  lines = pdf.splitTextToSize(
    `- Diseñar y desarrollar una landing page responsiva según los requerimientos previamente acordados.\n- Entregar el trabajo dentro del plazo establecido.\n- Realizar hasta dos rondas de ajustes menores sin costo adicional.\n- Mantener comunicación regular con la cliente sobre el avance del proyecto.`,
    170
  );
  y = ensureSpace(pdf, y, lines.length * 7 + 4);
  pdf.text(lines, 20, y);
  y += lines.length * 7 + 4;

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("3. Obligaciones del cliente", 20, y);
  y += 9;
  pdf.setFont("helvetica", "normal");
  lines = pdf.splitTextToSize(
    `- Proporcionar toda la información y recursos necesarios para el desarrollo del proyecto.\n- Realizar los pagos en los plazos acordados.\n- Revisar y aprobar entregables en un tiempo razonable.\n- No solicitar cambios fuera del alcance sin previa negociación.`,
    170
  );
  y = ensureSpace(pdf, y, lines.length * 7 + 4);
  pdf.text(lines, 20, y);
  y += lines.length * 7 + 4;

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("4. Forma de pago", 20, y);
  y += 9;
  pdf.setFont("helvetica", "normal");
  lines = pdf.splitTextToSize(
    `El monto acordado por los servicios es de $${amount.toLocaleString(
      "es-MX"
    )} ${
      currency || "MXN"
    }, pagaderos de la siguiente manera: ${paymentMethod}`,
    170
  );
  y = ensureSpace(pdf, y, lines.length * 7 + 4);
  pdf.text(lines, 20, y);
  y += lines.length * 7 + 4;

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("5. Propiedad intelectual", 20, y);
  y += 9;
  pdf.setFont("helvetica", "normal");
  lines = pdf.splitTextToSize(
    `Una vez realizado el pago total, todos los derechos de uso del trabajo entregado serán transferidos a la cliente. El freelancer se reserva el derecho de incluir el trabajo en su portafolio personal.`,
    170
  );
  y = ensureSpace(pdf, y, lines.length * 7 + 4);
  pdf.text(lines, 20, y);
  y += lines.length * 7 + 4;

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("6. Confidencialidad", 20, y);
  y += 9;
  pdf.setFont("helvetica", "normal");
  lines = pdf.splitTextToSize(
    `Ambas partes se comprometen a mantener confidencial cualquier información sensible compartida durante la ejecución del proyecto.`,
    170
  );
  y = ensureSpace(pdf, y, lines.length * 7 + 4);
  pdf.text(lines, 20, y);
  y += lines.length * 7 + 4;

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("7. Terminación anticipada", 20, y);
  y += 9;
  pdf.setFont("helvetica", "normal");
  lines = pdf.splitTextToSize(
    `Cualquiera de las partes podrá dar por terminado este contrato si la otra parte incumple con las obligaciones aquí establecidas. En caso de cancelación anticipada, el freelancer retendrá el pago correspondiente al trabajo ya realizado.`,
    170
  );
  y = ensureSpace(pdf, y, lines.length * 7 + 4);
  pdf.text(lines, 20, y);
  y += lines.length * 7 + 4;

  y = ensureSpace(pdf, y, 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("8. Legislación aplicable", 20, y);
  y += 9;
  pdf.setFont("helvetica", "normal");
  lines = pdf.splitTextToSize(
    `Este contrato se rige por las leyes vigentes en ${city}, renunciando las partes a cualquier otro fuero que pudiera corresponderles.`,
    170
  );
  y = ensureSpace(pdf, y, lines.length * 7 + 4);
  pdf.text(lines, 20, y);
  y += lines.length * 7 + 4;

  if (y > 230) {
    pdf.addPage();
  }
  pdf.setFont("helvetica", "normal");
  pdf.text("_______________________________", 25, y);
  pdf.text("_______________________________", 120, y);
  y += 14;
  pdf.text(freelancerName || "", 35, y);
  pdf.text(clientName || "", 130, y);
  y += 7;
  pdf.text("Freelancer", 35, y);
  pdf.text("Cliente", 130, y);

  return pdf.output("blob");
};

export const downloadContractPDF = async (
  contractData: PDFContractData,
  filename?: string
): Promise<void> => {
  try {
    const blob = await generateContractPDF(contractData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      filename ||
      `contrato-${contractData.clientName}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating contract PDF:", error);
    throw new Error("Error al generar el PDF del contrato");
  }
};
