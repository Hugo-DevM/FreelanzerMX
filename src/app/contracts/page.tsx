"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  getUserContracts,
  ContractData,
  createContract,
} from "../../services/contractService";
import { getUserQuotes, QuoteData } from "../../services/quoteService";
import { useAuthContext } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import SelectCreationModal from "../../components/shared/SelectCreationModal";
import { FileTextIcon, PlusIcon } from "../../components/ui/icons";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { ContractFromQuoteModal } from "../../components/contracts/ContractForm";
import ContractPreview from "../../components/contracts/ContractPreview";

// Lazy load del formulario de contratos
const ContractForm = dynamic(
  () => import("../../components/contracts/ContractForm"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9ae600]"></div>
        <span className="ml-3 text-[#666666]">Cargando formulario...</span>
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

export default function ContractsPage() {
  const { user } = useAuthContext();
  const [showForm, setShowForm] = useState(false);
  const [showFromQuote, setShowFromQuote] = useState(false);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [acceptedQuotes, setAcceptedQuotes] = useState<QuoteData[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadContracts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userContracts = await getUserContracts(user.uid);
      setContracts(userContracts);
    } catch (error) {
      console.error("Error loading contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAcceptedQuotes = async () => {
    if (!user) return;
    try {
      const quotes = await getUserQuotes(user.uid);
      setAcceptedQuotes(quotes.filter((q) => q.status === "approved"));
    } catch (error) {
      console.error("Error loading accepted quotes:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadContracts();
      loadAcceptedQuotes();
    }
  }, [user]);

  if (showPreview && previewData) {
    // Muestra la vista previa como página completa
    const handleSaveContract = async () => {
      if (!user) {
        setSaveError("Debes iniciar sesión para crear un contrato.");
        return;
      }
      setSaving(true);
      setSaveError(null);
      try {
        await createContract({
          user_id: user.uid,
          freelancer_name: previewData.freelancerName,
          client_name: previewData.clientName,
          service: previewData.service,
          amount: previewData.amount,
          currency: previewData.currency,
          payment_method: previewData.paymentMethod,
          start_date: previewData.startDate,
          delivery_date: previewData.deliveryDate,
          city: previewData.city,
        });
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setShowPreview(false);
          setShowForm(false);
          setShowFromQuote(false);
          setShowCreationModal(false);
          setSelectedQuote(null);
          loadContracts();
        }, 1200);
      } catch (e: any) {
        setSaveError(e.message || "Error al guardar el contrato");
      } finally {
        setSaving(false);
      }
    };
    return (
      <div className="p-4">
        <ContractPreview
          contractData={previewData}
          onBack={() => setShowPreview(false)}
          onSave={handleSaveContract}
          saving={saving}
        />
        {saveSuccess && (
          <div className="mt-4 text-green-600 font-semibold">
            ¡Contrato guardado exitosamente!
          </div>
        )}
        {saveError && (
          <div className="mt-4 text-red-600 font-semibold">{saveError}</div>
        )}
      </div>
    );
  }

  if (showForm || showFromQuote) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setSelectedQuote(null);
              } else {
                setShowFromQuote(false);
                setShowCreationModal(true);
              }
            }}
          >
            ← Volver a Contratos
          </Button>
        </div>
        {showForm ? (
          <ContractForm
            initialData={previewData || undefined}
            onBack={() => {
              setShowForm(false);
              setSelectedQuote(null);
              loadContracts();
            }}
            onShowPreviewChange={(data: any) => {
              setPreviewData(data);
              setShowPreview(true);
            }}
          />
        ) : (
          <ContractFromQuoteModal
            onClose={() => {
              setShowFromQuote(false);
              setShowCreationModal(true);
            }}
            onShowPreviewChange={(data: any) => {
              setPreviewData(data);
              setShowPreview(true);
            }}
          />
        )}
      </div>
    );
  }

  const handleDeleteContract = async () => {
    if (!contractToDelete) return;
    setDeleting(true);
    try {
      // Suponiendo que tienes una función deleteContract en contractService
      const { deleteContract } = await import("../../services/contractService");
      await deleteContract(contractToDelete);
      setContractToDelete(null);
      loadContracts();
    } catch (error) {
      console.error("Error deleting contract:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 w-full">
      <div>
        <div className="flex flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Contratos</h1>
            <p className="text-[#666666]">
              Genera y descarga contratos profesionales para tus servicios.
            </p>
          </div>
          <Button
            onClick={() => {
              setShowCreationModal(true);
            }}
            size="lg"
            className="bg-[#9ae600] text-white hover:bg-[#7fc400] font-semibold px-4 py-2 rounded shadow"
          >
            + Nuevo Contrato
          </Button>
        </div>
        {showFromQuote && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Selecciona una cotización aceptada
            </h2>
            {acceptedQuotes.length === 0 ? (
              <p className="text-gray-500">No tienes cotizaciones aceptadas.</p>
            ) : (
              <ul className="space-y-4">
                {acceptedQuotes.map((quote) => (
                  <li
                    key={quote.id}
                    className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="font-bold text-lg text-[#1A1A1A]">
                        {quote.client_name}
                      </div>
                      <div className="text-[#666]">
                        {quote.services.map((s) => s.description).join(", ")}
                      </div>
                      <div className="text-sm text-[#888]">
                        {quote.delivery_date
                          ? new Date(quote.delivery_date).toLocaleDateString(
                              "es-MX",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </div>
                    </div>
                    <Button
                      className="mt-2 md:mt-0"
                      onClick={() => {
                        setSelectedQuote(quote);
                        setShowForm(true);
                        setShowFromQuote(false);
                      }}
                    >
                      Seleccionar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {showCreationModal && (
          <SelectCreationModal
            title="Crear Contrato"
            onClose={() => setShowCreationModal(false)}
            options={[
              {
                icon: (
                  <FileTextIcon className="text-[#9ae600] text-xl group-hover:text-white transition-colors" />
                ),
                title: "Crear desde Cotización",
                description: "Usar datos de una cotización aceptada",
                onClick: () => {
                  setShowFromQuote(true);
                  setShowForm(false);
                  setSelectedQuote(null);
                  setShowCreationModal(false);
                },
              },
              {
                icon: (
                  <PlusIcon className="text-[#9ae600] text-xl group-hover:text-white transition-colors" />
                ),
                title: "Crear desde Cero",
                description: "Crear un contrato completamente nuevo",
                onClick: () => {
                  setShowForm(true);
                  setShowFromQuote(false);
                  setSelectedQuote(null);
                  setShowCreationModal(false);
                },
              },
            ]}
          />
        )}
        {/* Lista de contratos hechos */}
        {contracts.length === 0 && (
          <div className="w-full">
            <div className="bg-white rounded-xl shadow p-10 flex flex-col items-center w-full">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                No hay contratos
              </h3>
              <p className="text-[#666666] mb-6">
                Crea tu primer contrato para empezar
              </p>
              <button
                className="bg-[#9ae600] text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-[#7fc400] transition"
                onClick={() => setShowCreationModal(true)}
              >
                Crear Primer Contrato
              </button>
            </div>
          </div>
        )}
        {contracts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Contratos realizados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="max-w-md bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-[#e5e7eb] hover:shadow-2xl transition-shadow duration-200"
                >
                  <div className="mb-2">
                    <span className="font-bold text-xl text-[#1A1A1A]">
                      {contract.service}
                    </span>
                  </div>
                  <div className="font-semibold text-base mb-1">
                    <span className="text-[#888]">Cliente:</span>{" "}
                    <span className="text-[#2563eb]">
                      {contract.client_name}
                    </span>
                  </div>
                  <div className="flex flex-row gap-4 text-sm text-[#555] mb-2">
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="font-semibold text-[#888]">
                          Fecha inicio:
                        </span>{" "}
                        {contract.start_date
                          ? (typeof contract.start_date === "string"
                              ? parseLocalDate(contract.start_date)
                              : contract.start_date
                            ).toLocaleDateString("es-MX", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </div>
                      <div>
                        <span className="font-semibold text-[#888]">
                          Fecha fin:
                        </span>{" "}
                        {contract.delivery_date
                          ? (typeof contract.delivery_date === "string"
                              ? parseLocalDate(contract.delivery_date)
                              : contract.delivery_date
                            ).toLocaleDateString("es-MX", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 justify-end">
                    <Button
                      size="sm"
                      className="bg-[#2563eb] text-white hover:bg-[#1746a2] font-semibold px-4 py-2 rounded shadow border-none"
                      onClick={async () => {
                        const { downloadContractPDF } = await import(
                          "../../services/pdfService"
                        );
                        await downloadContractPDF({
                          freelancerName: contract.freelancer_name,
                          clientName: contract.client_name,
                          service: contract.service,
                          amount: contract.amount,
                          currency: contract.currency,
                          paymentMethod: contract.payment_method,
                          startDate: contract.start_date,
                          deliveryDate: contract.delivery_date,
                          city: contract.city,
                        });
                      }}
                    >
                      Descargar PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-[#e11d48] text-white hover:bg-[#991b1b] font-semibold px-4 py-2 rounded shadow"
                      onClick={() => setContractToDelete(contract.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <ConfirmModal
              open={!!contractToDelete}
              message="¿Estás seguro de que quieres eliminar este contrato?"
              confirmText="Eliminar"
              cancelText="Cancelar"
              onConfirm={handleDeleteContract}
              onCancel={() => setContractToDelete(null)}
              loading={deleting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
