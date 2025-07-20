import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { ContractFormData } from "./ContractForm";
import { downloadContractPDF } from "../../services/pdfService";
import { getFreelancerObligations } from "../../services/obligationsService";

interface ContractPreviewProps {
  contractData: ContractFormData;
  onBack: () => void;
  onSave?: () => void;
  saving?: boolean;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({
  contractData,
  onBack,
  onSave,
  saving,
}) => {
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

  const [obligations, setObligations] = useState<string[]>([]);
  const [loadingObligations, setLoadingObligations] = useState(true);

  useEffect(() => {
    const loadObligations = async () => {
      try {
        setLoadingObligations(true);
        const serviceObligations = await getFreelancerObligations(service);
        setObligations(serviceObligations);
      } catch (error) {
        console.error("Error loading obligations:", error);
        // Fallback a obligaciones genéricas
        setObligations([
          `Ejecutar el servicio de "${service}" de manera profesional y eficiente.`,
          "Cumplir con todos los entregables acordados en el contrato.",
          "Mantener estándares de calidad profesionales en todo el trabajo realizado.",
          "Entregar el trabajo dentro del plazo establecido.",
          "Realizar hasta dos rondas de ajustes menores sin costo adicional.",
        ]);
      } finally {
        setLoadingObligations(false);
      }
    };

    if (service) {
      loadObligations();
    }
  }, [service]);

  const handleDownloadPDF = () => {
    downloadContractPDF(
      contractData,
      `contrato-${contractData.clientName}-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  // Formatea una fecha YYYY-MM-DD a DD/MM/YYYY
  const formatDate = (dateString: string | undefined | null) => {
    if (
      !dateString ||
      typeof dateString !== "string" ||
      !dateString.includes("-")
    )
      return "-";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between mb-4 mt-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Volver al Formulario
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} size="sm" variant="outline">
            Descargar PDF
          </Button>
          <Button
            onClick={onBack}
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Editar
          </Button>
          {onSave && (
            <Button
              onClick={onSave}
              size="sm"
              className="bg-[#9ae600] text-white hover:bg-[#7fc400] font-semibold px-4 py-2 rounded shadow"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar Contrato"}
            </Button>
          )}
        </div>
      </div>
      <Card>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            CONTRATO DE PRESTACIÓN DE SERVICIOS FREELANCE
          </h1>
          <div className="mb-6 text-[#222]">
            <div className="mb-2">Entre:</div>
            <div>
              Freelancer: <b>{freelancerName}</b>
            </div>
            <div>
              Cliente: <b>{clientName}</b>
            </div>
            <div>
              Ciudad: <b>{city}</b>
            </div>
            <div>
              Fecha de inicio: <b>{startDate}</b>
            </div>
            <div>
              Fecha de entrega: <b>{deliveryDate}</b>
            </div>
          </div>

          <h2 className="font-bold mt-6 mb-2">1. Objeto del contrato</h2>
          <p className="mb-4">
            El presente contrato tiene por objeto la prestación del servicio de{" "}
            {service} por parte del freelancer <b>{freelancerName}</b> para la
            cliente <b>{clientName}</b>, conforme a los términos y condiciones
            que se detallan a continuación.
          </p>

          <h2 className="font-bold mb-2">2. Obligaciones del freelancer</h2>
          {loadingObligations ? (
            <div className="mb-4 text-gray-500">Cargando obligaciones...</div>
          ) : (
            <ul className="mb-4 list-disc pl-6">
              {obligations.map((obligation, index) => (
                <li key={index} className="mb-2">
                  {obligation}
                </li>
              ))}
            </ul>
          )}

          <h2 className="font-bold mb-2">3. Obligaciones del cliente</h2>
          <ul className="mb-4 list-disc pl-6">
            <li>
              Proporcionar toda la información y recursos necesarios para el
              desarrollo del proyecto.
            </li>
            <li>Realizar los pagos en los plazos acordados.</li>
            <li>Revisar y aprobar entregables en un tiempo razonable.</li>
            <li>
              No solicitar cambios fuera del alcance sin previa negociación.
            </li>
          </ul>

          <h2 className="font-bold mb-2">4. Forma de pago</h2>
          <p className="mb-4">
            El monto acordado por los servicios es de{" "}
            <b>
              $
              {(typeof amount === "number" && !isNaN(amount)
                ? amount
                : 0
              ).toLocaleString("es-MX")}
            </b>{" "}
            {currency || "MXN"}, pagaderos de la siguiente manera:
            <br />
            {paymentMethod}
          </p>

          <h2 className="font-bold mb-2">5. Propiedad intelectual</h2>
          <p className="mb-4">
            Una vez realizado el pago total, todos los derechos de uso del
            trabajo entregado serán transferidos a la cliente. El freelancer se
            reserva el derecho de incluir el trabajo en su portafolio personal.
          </p>

          <h2 className="font-bold mb-2">6. Confidencialidad</h2>
          <p className="mb-4">
            Ambas partes se comprometen a mantener confidencial cualquier
            información sensible compartida durante la ejecución del proyecto.
          </p>

          <h2 className="font-bold mb-2">7. Terminación anticipada</h2>
          <p className="mb-4">
            Cualquiera de las partes podrá dar por terminado este contrato si la
            otra parte incumple con las obligaciones aquí establecidas. En caso
            de cancelación anticipada, el freelancer retendrá el pago
            correspondiente al trabajo ya realizado.
          </p>

          <h2 className="font-bold mb-2">8. Legislación aplicable</h2>
          <p className="mb-4">
            Este contrato se rige por las leyes vigentes en <b>{city}</b>,
            renunciando las partes a cualquier otro fuero que pudiera
            corresponderles.
          </p>

          <h2 className="font-bold mb-2">9. Firmas</h2>
          <div className="mt-8 flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1 text-center">
              <div className="mb-8 border-b border-gray-400 h-10"></div>
              <div className="font-semibold">{freelancerName}</div>
              <div>Freelancer</div>
            </div>
            <div className="flex-1 text-center">
              <div className="mb-8 border-b border-gray-400 h-10"></div>
              <div className="font-semibold">{clientName}</div>
              <div>Cliente</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContractPreview;
