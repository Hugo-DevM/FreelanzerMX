"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import dynamic from "next/dynamic";
import {
  getUserQuotes,
  QuoteData,
  updateQuoteStatus,
  deleteQuote,
} from "../../services/quoteService";
import ConfirmModal from "../../components/ui/ConfirmModal";

// Lazy load de componentes pesados
const QuoteForm = dynamic(() => import("../../components/quotes/QuoteForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9ae600]"></div>
      <span className="ml-3 text-[#666666]">Cargando formulario...</span>
    </div>
  ),
  ssr: false,
});

const QuotePreview = dynamic(
  () => import("../../components/quotes/QuotePreview"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9ae600]"></div>
        <span className="ml-3 text-[#666666]">Cargando vista previa...</span>
      </div>
    ),
    ssr: false,
  }
);

// Corrige desfase de fechas por zona horaria
const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

function QuotesContent() {
  const { user } = useAuthContext();
  const [showForm, setShowForm] = useState(false);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadQuotes();
    }
  }, [user]);

  const loadQuotes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userQuotes = await getUserQuotes(user.uid);
      setQuotes(userQuotes);
    } catch (error) {
      console.error("Error loading quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    quoteId: string,
    newStatus: "draft" | "sent" | "approved" | "rejected"
  ) => {
    try {
      await updateQuoteStatus(quoteId, newStatus);
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) =>
          q.id === quoteId ? { ...q, status: newStatus } : q
        )
      );
    } catch (error) {
      console.error("Error updating quote status:", error);
      alert("Error al actualizar el estado de la cotización");
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
      await loadQuotes();
      if (selectedQuote && selectedQuote.id === quoteToDelete) {
        setSelectedQuote(null);
      }
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert("Error al eliminar la cotización");
    } finally {
      setDeleting(false);
    }
  };
  const cancelDeleteQuote = () => setQuoteToDelete(null);

  const handleDeleteFromPreview = async (quoteId: string) => {
    setQuoteToDelete(quoteId);
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
      <div className="p-4">
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowForm(false);
              loadQuotes();
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
      </div>
    );
  }

  if (selectedQuote) {
    return (
      <>
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
      </>
    );
  }

  return (
    <div className="p-4 w-full">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Cotizaciones</h1>
            <p className="text-[#666666]">
              Gestiona tus cotizaciones y propuestas
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} size="lg">
            + Nueva Cotización
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600] mx-auto"></div>
            <p className="text-[#666666] mt-4">Cargando cotizaciones...</p>
          </div>
        ) : quotes.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
            {quotes.map((quote) => (
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
                    )}`}
                  >
                    {getStatusText(quote.status)}
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
                      ? parseLocalDate(quote.delivery_date).toLocaleDateString(
                          "es-MX",
                          { day: "2-digit", month: "2-digit", year: "numeric" }
                        )
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
                    className="custom-select"
                  >
                    <option value="draft">Borrador</option>
                    <option value="sent">Enviada</option>
                    <option value="approved">Aprobada</option>
                    <option value="rejected">Rechazada</option>
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedQuote(quote)}
                  >
                    Ver
                  </Button>
                </div>
              </Card>
            ))}
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
    </div>
  );
}

export default function QuotesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <QuotesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
