"use client";

import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { QuoteData } from "../../services/quoteService";
import { downloadQuotePDF } from "../../services/pdfService";

import QuoteForm from "./QuoteForm";

interface QuotePreviewProps {
  quoteData: QuoteData;
  onBack: () => void;
  onGeneratePDF: () => void;
  extraActions?: (props: { quoteData: QuoteData }) => React.ReactNode;
  showEdit?: boolean;
}

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

const QuotePreview: React.FC<QuotePreviewProps> = ({
  quoteData,
  onBack,
  onGeneratePDF,
  extraActions,
  showEdit = false,
}) => {
  // Debug: Log los datos recibidos (solo en desarrollo)
  if (process.env.NODE_ENV === "development") {
    console.log("QuotePreview - Datos recibidos:", {
      freelancer_name: quoteData.freelancer_name,
      city: quoteData.city,
      payment_terms: quoteData.payment_terms,
      validity: quoteData.validity,
      delivery_time: quoteData.delivery_time,
      fullData: quoteData,
    });
  }
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Estado para fechas y montos formateados
  const [formattedDate, setFormattedDate] = useState("");
  const [formattedTotal, setFormattedTotal] = useState("");
  const [formattedServicePrices, setFormattedServicePrices] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (quoteData.delivery_date) {
      setFormattedDate(
        new Date(quoteData.delivery_date).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
  }, [quoteData.delivery_date]);

  useEffect(() => {
    setFormattedTotal((quoteData.total || 0).toLocaleString("es-MX"));
  }, [quoteData.total]);

  useEffect(() => {
    setFormattedServicePrices(
      quoteData.services.map((service) => service.price.toLocaleString("es-MX"))
    );
  }, [quoteData.services]);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadQuotePDF(quoteData);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <QuoteForm initialData={quoteData} onCancel={() => setIsEditing(false)} />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        {!showEdit && (
          <Button variant="outline" size="sm" onClick={onBack}>
            ← Volver a Cotizaciones
          </Button>
        )}
        <div className="flex flex-wrap gap-2 justify-end">
          {extraActions ? (
            extraActions({ quoteData })
          ) : (
            <>
              <Button
                onClick={handleGeneratePDF}
                loading={isGeneratingPDF}
                variant="outline"
                size="sm"
              >
                Descargar PDF
              </Button>
            </>
          )}
          {showEdit && (
            <Button
              onClick={handleEdit}
              size="sm"
              style={{
                backgroundColor: "#2563eb",
                color: "#FFF",
                border: "1px solid #2563eb",
              }}
            >
              Editar
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              COTIZACIÓN
            </h1>
            <p className="text-[#666666]">Servicios Profesionales</p>
          </div>

          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                Información del Freelancer
              </h3>
              <p className="text-[#666666] mb-1">
                <strong>Nombre:</strong> {quoteData.freelancer_name}
              </p>
              <p className="text-[#666666] mb-1">
                <strong>Ciudad:</strong> {quoteData.city}
              </p>
              <p className="text-[#666666]">
                <strong>Fecha:</strong>{" "}
                {formatDateString(quoteData.delivery_date || "")}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                Información del Cliente
              </h3>
              <p className="text-[#666666]">
                <strong>Nombre:</strong> {quoteData.client_name}
              </p>
            </div>
          </div>

          {/* Servicios */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Servicios Cotizados
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {quoteData.services.map((service, index) => (
                <div
                  key={service.id}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-[#1A1A1A]">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1A1A1A]">
                      ${formattedServicePrices[index]} MXN
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="text-right mb-8 p-4 bg-[#9ae600] bg-opacity-10 rounded-lg">
            <p className="text-2xl font-bold text-[#1A1A1A]">
              Total: ${formattedTotal} MXN
            </p>
          </div>

          {/* Condiciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                Condiciones de Pago
              </h3>
              <p className="text-[#666666]">{quoteData.payment_terms}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                Vigencia
              </h3>
              <p className="text-[#666666]">
                {quoteData.validity
                  ? `${quoteData.validity} días naturales`
                  : "-"}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
              Tiempo de Entrega
            </h3>
            <p className="text-[#666666]">
              {quoteData.delivery_time
                ? `${quoteData.delivery_time} días hábiles`
                : "-"}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-[#666666]">
              Esta cotización es válida por{" "}
              {quoteData.validity
                ? `${quoteData.validity} días naturales`
                : "-"}{" "}
              a partir de la fecha de emisión.
            </p>
            <p className="text-sm text-[#666666] mt-2">
              Para cualquier consulta, no dude en contactarnos.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuotePreview;
