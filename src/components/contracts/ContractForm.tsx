"use client";
import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ContractPreview from "./ContractPreview";
import { useAuthContext } from "../../contexts/AuthContext";
import { createContract } from "../../services/contractService";
import { getUserQuotes, QuoteData } from "../../services/quoteService";

export interface ContractFormData {
  freelancerName: string;
  clientName: string;
  service: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  startDate: string;
  deliveryDate: string;
  city: string;
  quoteId?: string;
}

interface ContractFormProps {
  onBack?: () => void;
  onShowPreviewChange?: (data: ContractFormData) => void;
  initialData?: Partial<ContractFormData>;
}

const ContractForm: React.FC<ContractFormProps> = ({
  onBack,
  onShowPreviewChange,
  initialData,
}) => {
  const { user, userProfile } = useAuthContext();
  const [formData, setFormData] = useState<ContractFormData>({
    freelancerName:
      initialData?.freelancerName ||
      (userProfile
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : "") ||
      user?.displayName ||
      "",
    clientName: initialData?.clientName || "",
    service: initialData?.service || "",
    amount: initialData?.amount ?? (undefined as any),
    currency: initialData?.currency || "MXN",
    paymentMethod: initialData?.paymentMethod || "",
    startDate:
      initialData?.startDate ||
      (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })(),
    deliveryDate:
      initialData?.deliveryDate ||
      (() => {
        const today = new Date();
        today.setDate(today.getDate() + 7);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })(),
    city: initialData?.city || "",
    quoteId: initialData?.quoteId || "",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [JSON.stringify(initialData)]);

  useEffect(() => {
    if (onShowPreviewChange && showPreview) {
      onShowPreviewChange(formData);
    }
  }, [showPreview, onShowPreviewChange, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (name === "amount") {
      // Manejar específicamente el campo de monto
      const numericValue = value.replace(/[^0-9]/g, ""); // Solo permitir números
      const parsedValue = numericValue === "" ? 0 : parseInt(numericValue, 10);
      setFormData({
        ...formData,
        [name]: parsedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!user) {
      setError("Debes iniciar sesión para crear un contrato.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createContract({
        user_id: user.uid,
        freelancer_name: formData.freelancerName,
        client_name: formData.clientName,
        service: formData.service,
        amount: formData.amount,
        currency: formData.currency,
        payment_method: formData.paymentMethod,
        start_date: formData.startDate,
        delivery_date: formData.deliveryDate,
        city: formData.city,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onBack) onBack();
      }, 1200);
    } catch (e: any) {
      setError(e.message || "Error al guardar el contrato");
    } finally {
      setSaving(false);
    }
  };

  if (showPreview) {
    return (
      <div>
        <ContractPreview
          contractData={formData}
          onBack={() => setShowPreview(false)}
        />
        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Contrato"}
          </Button>
        </div>
        {success && (
          <div className="mt-4 text-green-600 font-semibold">
            ¡Contrato guardado exitosamente!
          </div>
        )}
        {error && (
          <div className="mt-4 text-red-600 font-semibold">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
          Nuevo Contrato
        </h1>
        <p className="text-[#666666]">
          Completa los datos para generar un contrato profesional
        </p>
      </div>
      <Card className="shadow-md border border-[#F1F1F1] rounded-xl">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <Input
            label="Nombre del Freelancer"
            name="freelancerName"
            value={formData.freelancerName}
            onChange={handleChange}
            required
          />
          <Input
            label="Nombre del Cliente"
            name="clientName"
            placeholder="Ej: Laura González"
            value={formData.clientName}
            onChange={handleChange}
            required
          />
          <Input
            label="Servicio Ofrecido"
            name="service"
            placeholder="Ej: Desarrollo de una landing page responsiva"
            value={formData.service}
            onChange={handleChange}
            required
          />
          <div className="flex gap-4 items-end">
            <Input
              label="Monto"
              name="amount"
              type="number"
              placeholder="Ej: 8000"
              value={formData.amount === undefined ? "" : formData.amount}
              onChange={handleChange}
              required
              className="w-40"
              min="0"
              step="1"
            />
            <div className="flex flex-col w-full">
              <label className="mb-1 font-medium text-sm text-[#1A1A1A]">
                Moneda
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleSelectChange}
                required
                className="w-full h-[56px] px-4 py-4 border border-[#E5E7EB] rounded-lg bg-white text-[#0E0E2C] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#9ae600] text-base"
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <Input
            label="Forma de Pago"
            name="paymentMethod"
            placeholder="Ej: 50% al inicio, 50% contra entrega"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          />
          <div className="flex gap-4">
            <Input
              label="Fecha de Inicio"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <Input
              label="Fecha de Entrega Estimada"
              name="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            label="Ciudad/Jurisdicción"
            name="city"
            placeholder="Ej: Ciudad de México"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <div className="flex justify-end gap-4">
            <Button type="submit">Vista Previa</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Formulario para crear contrato desde cotización
export const ContractFromQuoteForm: React.FC<{
  onBack?: () => void;
  onShowPreviewChange?: (data: ContractFormData) => void;
  acceptedQuotes?: QuoteData[]; // Cotizaciones filtradas que ya no han sido convertidas
}> = ({ onBack, onShowPreviewChange, acceptedQuotes = [] }) => {
  const { user } = useAuthContext();
  const [quotes, setQuotes] = React.useState<QuoteData[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = React.useState<string>("");
  const [formData, setFormData] = React.useState<ContractFormData>({
    freelancerName: "",
    clientName: "",
    service: "",
    amount: undefined as any,
    currency: "MXN",
    paymentMethod: "",
    startDate: new Date().toISOString().split("T")[0],
    deliveryDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split("T")[0];
    })(),
    city: "",
    quoteId: "",
  });
  const [showPreview, setShowPreview] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (acceptedQuotes.length > 0) {
      setQuotes(acceptedQuotes);
    } else if (user) {
      // Fallback: cargar todas las cotizaciones aprobadas si no se pasan las filtradas
      getUserQuotes(user.uid).then((all) => {
        setQuotes(all.filter((q) => q.status === "approved"));
      });
    }
  }, [user, acceptedQuotes]);
  React.useEffect(() => {
    if (selectedQuoteId) {
      const quote = quotes.find((q) => q.id === selectedQuoteId);
      if (quote) {
        setFormData({
          freelancerName: quote.freelancer_name,
          clientName: quote.client_name,
          service: quote.services.map((s) => s.description).join(", "),
          amount: quote.total,
          currency: quote.currency || "MXN",
          paymentMethod: quote.payment_terms || "",
          startDate:
            quote.delivery_date || new Date().toISOString().split("T")[0],
          deliveryDate:
            quote.delivery_date || new Date().toISOString().split("T")[0],
          city: quote.city,
          quoteId: quote.id,
        });
      }
    }
  }, [selectedQuoteId, quotes]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // Manejar específicamente el campo de monto
      const numericValue = value.replace(/[^0-9]/g, ""); // Solo permitir números
      const parsedValue = numericValue === "" ? 0 : parseInt(numericValue, 10);
      setFormData({
        ...formData,
        [name]: parsedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
    if (onShowPreviewChange) onShowPreviewChange(formData);
  };
  const handleSave = async () => {
    if (!user) {
      setError("Debes iniciar sesión para crear un contrato.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createContract({
        user_id: user.uid,
        freelancer_name: formData.freelancerName,
        client_name: formData.clientName,
        service: formData.service,
        amount: formData.amount,
        currency: formData.currency,
        payment_method: formData.paymentMethod,
        start_date: formData.startDate,
        delivery_date: formData.deliveryDate,
        city: formData.city,
        quote_id: formData.quoteId,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onBack) onBack();
      }, 1200);
    } catch (e: any) {
      setError(e.message || "Error al guardar el contrato");
    } finally {
      setSaving(false);
    }
  };
  if (showPreview) {
    return (
      <div>
        <ContractPreview
          contractData={formData}
          onBack={() => setShowPreview(false)}
        />
        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={() => setShowPreview(false)} variant="outline">
            Atrás
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Contrato"}
          </Button>
        </div>
        {success && (
          <div className="mt-4 text-green-600 font-semibold">
            ¡Contrato guardado exitosamente!
          </div>
        )}
        {error && (
          <div className="mt-4 text-red-600 font-semibold">{error}</div>
        )}
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div>
        <label className="block mb-2 font-semibold">
          Seleccionar Cotización
        </label>
        <select
          className="w-full h-[48px] px-4 border border-[#E5E7EB] rounded-lg bg-white text-[#0E0E2C] focus:outline-none focus:ring-2 focus:ring-[#9ae600]"
          value={selectedQuoteId}
          onChange={(e) => setSelectedQuoteId(e.target.value)}
          required
        >
          <option value="">Selecciona una cotización</option>
          {quotes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.client_name} -{" "}
              {q.services.map((s) => s.description).join(", ")} -{" "}
              {q.total.toLocaleString("es-MX", {
                style: "currency",
                currency: q.currency || "MXN",
              })}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Nombre del Freelancer"
        name="freelancerName"
        value={formData.freelancerName}
        onChange={handleChange}
        required
      />
      <Input
        label="Nombre del Cliente"
        name="clientName"
        value={formData.clientName}
        onChange={handleChange}
        required
      />
      <Input
        label="Servicio Ofrecido"
        name="service"
        value={formData.service}
        onChange={handleChange}
        required
      />
      <div className="flex gap-4 items-end">
        <Input
          label="Monto"
          name="amount"
          type="number"
          value={formData.amount === undefined ? "" : formData.amount}
          onChange={handleChange}
          required
          className="w-40"
          min="0"
          step="1"
        />
        <div className="flex flex-col w-full">
          <label className="mb-1 font-medium text-sm text-[#1A1A1A]">
            Moneda
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            required
            className="w-full h-[56px] px-4 py-4 border border-[#E5E7EB] rounded-lg bg-white text-[#0E0E2C] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#9ae600] text-base"
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <Input
        label="Forma de Pago"
        name="paymentMethod"
        value={formData.paymentMethod}
        onChange={handleChange}
        required
      />
      <div className="flex gap-4">
        <Input
          label="Fecha de Inicio"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
        <Input
          label="Fecha de Entrega Estimada"
          name="deliveryDate"
          type="date"
          value={formData.deliveryDate}
          onChange={handleChange}
          required
        />
      </div>
      <Input
        label="Ciudad/Jurisdicción"
        name="city"
        value={formData.city}
        onChange={handleChange}
        required
      />
      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button type="submit">Vista Previa</Button>
      </div>
    </form>
  );
};

// Modal para el formulario de contrato desde cotización
export const ContractFromQuoteModal: React.FC<{
  onClose: () => void;
  onShowPreviewChange?: (data: ContractFormData) => void;
  acceptedQuotes?: QuoteData[]; // Cotizaciones filtradas que ya no han sido convertidas
}> = ({ onClose, onShowPreviewChange, acceptedQuotes }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="p-0">
          <div className="flex justify-between items-center px-8 pt-8 pb-2">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">
                Contrato desde cotización
              </h1>
            </div>
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#1A1A1A] transition-colors text-2xl font-bold"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <div className="px-8 pb-8 pt-2">
            <ContractFromQuoteForm
              onBack={onClose}
              onShowPreviewChange={onShowPreviewChange}
              acceptedQuotes={acceptedQuotes}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContractForm;
