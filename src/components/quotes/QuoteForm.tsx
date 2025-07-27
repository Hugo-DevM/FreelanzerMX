"use client";

import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Card from "../ui/Card";
import QuotePreview from "./QuotePreview";
import {
  createQuote,
  updateQuote,
  QuoteData,
} from "../../services/quoteService";
import { useAuthContext } from "../../contexts/AuthContext";

interface ServiceItem {
  id: string;
  description: string;
  price: number;
}

interface QuoteFormData {
  freelancerName: string;
  clientName: string;
  services: ServiceItem[];
  totalAmount: number;
  paymentTerms: string;
  validity: number;
  deliveryTime: number;
  city: string;
  date: string;
}

interface QuoteFormProps {
  initialData?: Partial<QuoteData>;
  onCancel?: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ initialData, onCancel }) => {
  const { user, userProfile } = useAuthContext();
  const [formData, setFormData] = useState<QuoteFormData>(() => {
    const initialFormData = initialData
      ? {
          freelancerName: initialData.freelancer_name || "",
          clientName: initialData.client_name || "",
          services: initialData.services || [
            { id: "1", description: "", price: 0 },
          ],
          totalAmount: initialData.total || 0,
          paymentTerms: initialData.payment_terms || "",
          validity: initialData.validity || 10, // Mapear desde initialData
          deliveryTime: initialData.delivery_time || 12, // Mapear desde initialData
          city: initialData.city || "",
          date:
            initialData.delivery_date || new Date().toISOString().split("T")[0],
        }
      : {
          freelancerName: "",
          clientName: "",
          services: [{ id: "1", description: "", price: 0 }],
          totalAmount: 0,
          paymentTerms: "",
          validity: 10,
          deliveryTime: 12,
          city: "",
          date: new Date().toISOString().split("T")[0],
        };

    // Debug: Log los valores para verificar (solo en desarrollo)
    if (initialData && process.env.NODE_ENV === "development") {
      console.log("InitialData recibido:", initialData);
      console.log("Valores mapeados:", {
        validity: initialData.validity,
        delivery_time: initialData.delivery_time,
        mappedValidity: initialFormData.validity,
        mappedDeliveryTime: initialFormData.deliveryTime,
      });
    }

    return initialFormData;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);

  useEffect(() => {
    const total = formData.services.reduce(
      (sum, service) => sum + service.price,
      0
    );
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [formData.services]);

  useEffect(() => {
    if (userProfile) {
      setFormData((prev) => ({
        ...prev,
        freelancerName: `${userProfile.first_name} ${userProfile.last_name}`,
        city: userProfile.address?.city || userProfile.address?.state || "",
      }));
    }
  }, [userProfile]);

  const addService = () => {
    const newId = (formData.services.length + 1).toString();
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        { id: newId, description: "", price: 0 },
      ],
    });
  };

  const removeService = (id: string) => {
    if (formData.services.length > 1) {
      setFormData({
        ...formData,
        services: formData.services.filter((service) => service.id !== id),
      });
    }
  };

  const updateService = (
    id: string,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setFormData({
      ...formData,
      services: formData.services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      if (initialData && initialData.id) {
        // Mapear campos camelCase a snake_case para la base de datos
        const updateData = {
          user_id: user.uid,
          freelancer_name: formData.freelancerName,
          client_name: formData.clientName,
          client_email: "",
          client_phone: "",
          client_address: "",
          service_description: formData.services
            .map((s) => s.description)
            .join(", "),
          services: formData.services,
          subtotal: formData.totalAmount,
          tax_rate: 0,
          tax_amount: 0,
          total: formData.totalAmount,
          currency: "MXN",
          payment_terms: formData.paymentTerms,
          delivery_date: formData.date,
          city: formData.city,
          status: initialData.status || "draft",
          validity: formData.validity,
          delivery_time: formData.deliveryTime,
        };
        await updateQuote(initialData.id, updateData);
        setSavedQuoteId(initialData.id);
      } else {
        // Mapear campos camelCase a snake_case para la base de datos
        const quoteData = {
          user_id: user.uid,
          freelancer_name: formData.freelancerName,
          client_name: formData.clientName,
          client_email: "", // Puedes obtenerlo de un campo si lo tienes
          client_phone: "", // Opcional, si tienes el campo
          client_address: "", // Opcional, si tienes el campo
          service_description: formData.services
            .map((s) => s.description)
            .join(", "),
          services: formData.services,
          subtotal: formData.totalAmount, // O calcula subtotal si hay impuestos
          tax_rate: 0, // Ajusta si tienes impuestos
          tax_amount: 0, // Ajusta si tienes impuestos
          total: formData.totalAmount,
          currency: "MXN", // O usa formData.currency si existe
          payment_terms: formData.paymentTerms,
          delivery_date: formData.date,
          city: formData.city,
          status: "draft",
          validity: formData.validity, // <-- Añadido
          delivery_time: formData.deliveryTime, // <-- Añadido
        };
        const quoteId = await createQuote(quoteData);
        setSavedQuoteId(quoteId);
      }

      setShowPreview(true);
    } catch (error) {
      console.error("Error creating/updating quote:", error);
      alert("Error al guardar la cotización. Por favor, inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = () => {
    alert("Funcionalidad de generación de PDF en desarrollo");
  };

  if (showPreview) {
    return (
      <QuotePreview
        quoteData={{
          id: savedQuoteId || "",
          status: initialData ? initialData.status || "draft" : "draft",
          user_id: user?.uid || "",
          created_at: new Date(),
          updated_at: new Date(),
          freelancer_name: formData.freelancerName,
          client_name: formData.clientName,
          client_email: "",
          client_phone: "",
          client_address: "",
          service_description: formData.services
            .map((s) => s.description)
            .join(", "),
          services: formData.services,
          subtotal: formData.totalAmount,
          tax_rate: 0,
          tax_amount: 0,
          total: formData.totalAmount,
          currency: "MXN",
          payment_terms: formData.paymentTerms,
          delivery_date: formData.date,
          city: formData.city,
          validity: formData.validity, // <-- Añadido
          delivery_time: formData.deliveryTime, // <-- Añadido
        }}
        onBack={() => {}}
        onGeneratePDF={handleGeneratePDF}
        showEdit={true}
      />
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
          {initialData ? "Editar Cotización" : "Nueva Cotización"}
        </h1>
        <p className="text-[#666666]">
          Completa los datos para {initialData ? "editar" : "generar"} una
          cotización profesional
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-md border border-[#F1F1F1] rounded-xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Información General
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre del Freelancer"
                placeholder="Ej: Hugo Martínez"
                value={formData.freelancerName}
                onChange={(e) =>
                  setFormData({ ...formData, freelancerName: e.target.value })
                }
                required
              />

              <Input
                label="Nombre del Cliente"
                placeholder="Ej: Laura González"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Input
                label="Ciudad"
                placeholder="Ej: Ciudad de México"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />

              <Input
                label="Fecha"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#1A1A1A]">
                Servicios y Precios
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addService}
              >
                + Agregar Servicio
              </Button>
            </div>

            <div className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={service.id} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      label={`Servicio ${index + 1}`}
                      placeholder="Ej: Diseño de branding, desarrollo de landing page"
                      value={service.description}
                      onChange={(e) =>
                        updateService(service.id, "description", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label="Precio (MXN)"
                      type="number"
                      placeholder="0"
                      value={service.price || ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value) || 0;
                        updateService(service.id, "price", value);
                      }}
                      required
                    />
                  </div>
                  {formData.services.length > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeService(service.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-right">
                <span className="text-lg font-semibold text-[#1A1A1A]">
                  Total: ${formData.totalAmount.toLocaleString("es-MX")} MXN
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Condiciones y Plazos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextArea
                label="Condiciones de Pago"
                placeholder="Ej: 50% anticipo, 50% contra entrega"
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value })
                }
                required
                rows={3}
              />

              <Input
                label="Vigencia (días naturales)"
                type="number"
                placeholder="10"
                value={formData.validity !== undefined ? formData.validity : ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                  setFormData({ ...formData, validity: value });
                }}
                required
              />
            </div>

            <div className="mt-6">
              <Input
                label="Tiempo Estimado de Entrega (días hábiles)"
                type="number"
                placeholder="12"
                value={
                  formData.deliveryTime !== undefined
                    ? formData.deliveryTime
                    : ""
                }
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                  setFormData({ ...formData, deliveryTime: value });
                }}
                required
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          {(onCancel || initialData) && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => window.history.back())}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            loading={isGenerating}
            disabled={!formData.freelancerName || !formData.clientName || !user}
          >
            {isGenerating
              ? initialData
                ? "Guardando..."
                : "Guardando..."
              : initialData
              ? "Guardar Cambios"
              : "Guardar y Generar Cotización"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;
