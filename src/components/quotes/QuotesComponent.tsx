"use client";

import { useState, useEffect, useTransition } from "react";
import { useQuotes } from "../../contexts/QuoteContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  QuoteData,
  updateQuoteStatus,
  deleteQuote,
  getQuote,
} from "../../services/quoteService";
import ConfirmModal from "../ui/ConfirmModal";
import ErrorModal from "../shared/ErrorModal";
import { supabase } from "../../lib/supabase";
import { PlusIcon, EyeIcon } from "lucide-react";
import QuoteForm from "./QuoteForm";
import QuotePreview from "./QuotePreview";
import { QuoteTableSkeleton } from "../ui/SkeletonLoader";

// Corrige desfase de fechas por zona horaria
const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export default function QuotesComponent() {
  const { quotes, loading, error, refreshData } = useQuotes();
  const [showForm, setShowForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPending] = useTransition();
  const [optimisticQuotes, setOptimisticQuotes] = useState<QuoteData[]>([]);
  const [updatingQuotes, setUpdatingQuotes] = useState<Set<string>>(new Set());

  // Sincronizar estado optimista con cotizaciones reales solo en la carga inicial
  useEffect(() => {
    if (quotes.length > 0 && optimisticQuotes.length === 0) {
      setOptimisticQuotes(quotes);
    } else if (quotes.length === 0 && !loading && optimisticQuotes.length > 0) {
      setOptimisticQuotes([]);
    } else if (quotes.length > optimisticQuotes.length) {
      // Si hay nuevas cotizaciones, agregarlas al estado optimista
      setOptimisticQuotes(quotes);
    }
  }, [quotes, loading, optimisticQuotes.length]);

  // SUSCRIPCIÓN REALTIME
  useEffect(() => {
    const channel = supabase
      .channel("quotes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quotes",
        },
        (payload) => {
          // Recargar cotizaciones solo si hay cambios relevantes
          refreshData();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  const handleStatusChange = async (
    quoteId: string,
    newStatus: "draft" | "sent" | "approved" | "rejected"
  ) => {
    console.log(
      "handleStatusChange - Iniciando cambio de estado:",
      quoteId,
      "a:",
      newStatus
    );

    try {
      // Marcar como actualizando
      setUpdatingQuotes((prev) => new Set(prev).add(quoteId));

      // Actualización optimista: actualizar el estado local inmediatamente
      const updatedQuotes = optimisticQuotes.map((quote) =>
        quote.id === quoteId ? { ...quote, status: newStatus } : quote
      );
      setOptimisticQuotes(updatedQuotes);
      console.log("handleStatusChange - Estado optimista actualizado");

      // Actualizar en la base de datos en segundo plano
      console.log("handleStatusChange - Actualizando en base de datos...");
      await updateQuoteStatus(quoteId, newStatus);
      console.log(
        "handleStatusChange - Base de datos actualizada exitosamente"
      );

      // Remover del estado de actualización
      setUpdatingQuotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(quoteId);
        return newSet;
      });

      // No refrescar datos para evitar parpadeo - el estado optimista ya está correcto
    } catch (error) {
      console.error("handleStatusChange - Error:", error);
      setLocalError("Error al actualizar el estado de la cotización");
      // Revertir el cambio en caso de error
      setOptimisticQuotes(quotes);
      // Remover del estado de actualización
      setUpdatingQuotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(quoteId);
        return newSet;
      });
      // Refrescar datos para asegurar sincronización
      refreshData();
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    setQuoteToDelete(quoteId);
  };

  const confirmDeleteQuote = async () => {
    if (!quoteToDelete) return;
    setDeleting(true);
    try {
      await deleteQuote(quoteToDelete);
      setQuoteToDelete(null);
      await refreshData();
      if (selectedQuote && selectedQuote.id === quoteToDelete) {
        setSelectedQuote(null);
      }
    } catch (error) {
      console.error("Error deleting quote:", error);
      setLocalError("Error al eliminar la cotización");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteQuote = () => setQuoteToDelete(null);

  const handleDeleteFromPreview = async (quoteId: string) => {
    setQuoteToDelete(quoteId);
  };

  const handleViewQuote = async (quoteId: string) => {
    console.log("handleViewQuote llamado con ID:", quoteId);
    try {
      const fullQuoteData = await getQuote(quoteId);
      console.log("Datos obtenidos:", fullQuoteData);
      if (fullQuoteData) {
        setSelectedQuote(fullQuoteData);
        console.log("selectedQuote establecido");
      } else {
        console.log("No se encontraron datos para la cotización");
        setLocalError("No se pudo cargar la cotización");
      }
    } catch (error) {
      console.error("Error loading quote:", error);
      setLocalError("Error al cargar la cotización");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-[#10B981]";
      case "sent":
        return "text-[#F59E0B]";
      case "rejected":
        return "text-[#EF4444]";
      default:
        return "text-[#6B7280]";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobada";
      case "sent":
        return "Enviada";
      case "rejected":
        return "Rechazada";
      case "draft":
        return "Borrador";
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (showForm) {
    return (
      <div className="w-full p-6">
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowForm(false);
              refreshData();
            }}
          >
            ← Volver a Cotizaciones
          </Button>
        </div>
        <QuoteForm />
        <ConfirmModal
          open={!!quoteToDelete}
          message="¿Estás seguro de que quieres eliminar esta cotización?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteQuote}
          onCancel={cancelDeleteQuote}
          loading={deleting}
        />

        {/* Error Modal */}
        <ErrorModal
          open={!!localError}
          message={localError || ""}
          onClose={() => setLocalError(null)}
        />
      </div>
    );
  }

  if (selectedQuote) {
    console.log("Renderizando QuotePreview con:", selectedQuote);
    return (
      <div className="w-full p-6">
        <QuotePreview
          quoteData={selectedQuote}
          onBack={() => setSelectedQuote(null)}
          onGeneratePDF={() => {}}
          extraActions={({ quoteData }) => (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleDeleteFromPreview(quoteData.id)}
              >
                Eliminar
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const { downloadQuotePDF } = await import(
                    "../../services/pdfService"
                  );
                  await downloadQuotePDF(quoteData);
                }}
              >
                Descargar PDF
              </Button>
            </div>
          )}
        />
        <ConfirmModal
          open={!!quoteToDelete}
          message="¿Estás seguro de que quieres eliminar esta cotización?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteQuote}
          onCancel={cancelDeleteQuote}
          loading={deleting}
        />

        {/* Error Modal */}
        <ErrorModal
          open={!!localError}
          message={localError || ""}
          onClose={() => setLocalError(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Cotizaciones</h1>
            <p className="text-[#666666]">
              Gestiona tus cotizaciones y propuestas
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Nueva Cotización
          </Button>
        </div>

        {loading || isPending ? (
          <QuoteTableSkeleton />
        ) : error ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                Error al cargar cotizaciones
              </h3>
              <p className="text-[#666666] mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </Card>
        ) : !optimisticQuotes || optimisticQuotes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                No hay cotizaciones
              </h3>
              <p className="text-[#666666] mb-6">
                Crea tu primera cotización para empezar
              </p>
              <Button onClick={() => setShowForm(true)}>
                Crear Primera Cotización
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Título Cotizaciones realizadas */}
            <h2 className="text-xl font-semibold mb-4">
              Cotizaciones realizadas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
              {optimisticQuotes.map((quote) => (
                <Card
                  key={quote.id}
                  className="max-w-md p-6 bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] border border-[#e5e7eb] shadow-lg hover:shadow-2xl transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">
                      Cotización #{quote.id.slice(-6)}
                    </h3>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        quote.status
                      )} ${
                        updatingQuotes.has(quote.id) ? "animate-pulse" : ""
                      }`}
                    >
                      {getStatusText(quote.status)}
                      {updatingQuotes.has(quote.id) && (
                        <span className="ml-1 text-xs">⏳</span>
                      )}
                    </span>
                  </div>

                  <p className="text-[#666666] mb-2">
                    <strong>Cliente:</strong> {quote.client_name}
                  </p>

                  <p className="text-[#666666] mb-4">
                    {quote.services.length} servicio
                    {quote.services.length !== 1 ? "s" : ""}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-[#1A1A1A]">
                      ${(quote.total || 0).toLocaleString("es-MX")}
                    </span>
                    <span className="text-sm text-[#666666]">
                      {quote.delivery_date
                        ? parseLocalDate(
                            quote.delivery_date
                          ).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : formatDate(quote.created_at)}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <select
                      value={quote.status}
                      onChange={(e) =>
                        handleStatusChange(
                          quote.id,
                          e.target.value as
                            | "draft"
                            | "sent"
                            | "approved"
                            | "rejected"
                        )
                      }
                      className={`custom-select ${
                        updatingQuotes.has(quote.id) ? "opacity-75" : ""
                      }`}
                      disabled={updatingQuotes.has(quote.id)}
                    >
                      <option value="draft">Borrador</option>
                      <option value="sent">Enviada</option>
                      <option value="approved">Aprobada</option>
                      <option value="rejected">Rechazada</option>
                    </select>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewQuote(quote.id)}
                      className="flex items-center gap-1"
                    >
                      <EyeIcon size={16} />
                      Ver
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        open={!!quoteToDelete}
        message="¿Estás seguro de que quieres eliminar esta cotización?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteQuote}
        onCancel={cancelDeleteQuote}
        loading={deleting}
      />

      {/* Error Modal */}
      <ErrorModal
        open={!!localError}
        message={localError || ""}
        onClose={() => setLocalError(null)}
      />
    </div>
  );
}
