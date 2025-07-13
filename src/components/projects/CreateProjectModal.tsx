"use client";

import React, { useState, useEffect } from "react";
import { Contract, CreateProjectData } from "../../types/project";
import { createProject, getContracts } from "../../services/projectService";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import { XIcon, FileTextIcon, PlusIcon } from "../ui/icons";

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: () => void;
  userId: string;
}

type CreationMode = "select" | "contract" | "scratch";

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onProjectCreated,
  userId,
}) => {
  const [mode, setMode] = useState<CreationMode>("select");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    amount: "",
  });

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const userContracts = await getContracts();
      setContracts(userContracts);
    } catch (err: any) {
      console.error("Error loading contracts:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContractSelect = (contractId: string) => {
    setSelectedContract(contractId);
    const contract = contracts.find((c) => c.id === contractId);
    if (contract) {
      let endDate: Date | undefined;
      if (contract.endDate instanceof Date) {
        endDate = contract.endDate;
      } else if (typeof contract.endDate === "string") {
        endDate = new Date(contract.endDate);
      } else if ((contract.endDate as any)?.toDate) {
        endDate = (contract.endDate as any).toDate();
      }
      setFormData({
        name: contract.service,
        description: `Proyecto basado en contrato con ${contract.clientName}`,
        client: contract.clientName,
        priority: "medium",
        dueDate:
          endDate && !isNaN(endDate.getTime())
            ? endDate.toISOString().split("T")[0]
            : "",
        amount: contract.amount?.toString() || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const projectData: CreateProjectData = {
        name: formData.name,
        description: formData.description,
        client: formData.client,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        createdFromContract: mode === "contract",
        contractId: mode === "contract" ? selectedContract : undefined,
        deliverables:
          mode === "contract" && selectedContract
            ? contracts.find((c) => c.id === selectedContract)?.deliverables
            : undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
      };

      await createProject(userId, projectData);
      onProjectCreated();
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Error al crear el proyecto");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      client: "",
      priority: "medium",
      dueDate: "",
      amount: "",
    });
    setSelectedContract("");
    setError(null);
  };

  const handleBack = () => {
    setMode("select");
    resetForm();
  };

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "Sin fecha";
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "Sin fecha";
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (mode === "select") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <Card className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Crear Proyecto</h2>
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#1A1A1A] transition-colors"
            >
              <XIcon />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode("contract")}
              className="w-full p-4 border-2 border-dashed border-[#9ae600] rounded-lg hover:bg-[#9ae600] hover:bg-opacity-10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <FileTextIcon className="text-[#9ae600] text-xl group-hover:text-white transition-colors" />
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">
                    Crear desde Contrato
                  </h3>
                  <p className="text-sm text-[#666666] group-hover:text-white transition-colors">
                    Usar datos de un contrato existente
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode("scratch")}
              className="w-full p-4 border-2 border-dashed border-[#9ae600] rounded-lg hover:bg-[#9ae600] hover:bg-opacity-10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <PlusIcon className="text-[#9ae600] text-xl group-hover:text-white transition-colors" />
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">
                    Crear desde Cero
                  </h3>
                  <p className="text-sm text-[#666666] group-hover:text-white transition-colors">
                    Crear un proyecto completamente nuevo
                  </p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            {mode === "contract" ? "Crear desde Contrato" : "Crear desde Cero"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "contract" && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Seleccionar Contrato
              </label>
              <select
                name="contract"
                value={selectedContract}
                onChange={(e) => handleContractSelect(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9ae600] focus:border-[#9ae600]"
                required
              >
                <option value="">Selecciona un contrato</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.clientName} - {contract.service} (
                    {formatCurrency(contract.amount)})
                  </option>
                ))}
              </select>

              {selectedContract && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">
                    Detalles del Contrato
                  </h4>
                  {(() => {
                    const contract = contracts.find(
                      (c) => c.id === selectedContract
                    );
                    if (!contract) return null;
                    return (
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Cliente:</strong> {contract.clientName}
                        </p>
                        <p>
                          <strong>Servicio:</strong> {contract.service}
                        </p>
                        <p>
                          <strong>Monto:</strong>{" "}
                          {formatCurrency(contract.amount)}
                        </p>
                        <p>
                          <strong>Fecha inicio:</strong>{" "}
                          {formatDate(contract.startDate)}
                        </p>
                        <p>
                          <strong>Fecha fin:</strong>{" "}
                          {(() => {
                            const end = contract.endDate;
                            if (!end) return "Sin fecha";
                            if (
                              typeof end === "string" &&
                              /^\d{4}-\d{2}-\d{2}$/.test(end as string)
                            ) {
                              const [y, m, d] = (end as string).split("-");
                              return `${d}/${m}/${y}`;
                            }
                            if (end instanceof Date && !isNaN(end.getTime())) {
                              const d = end
                                .getDate()
                                .toString()
                                .padStart(2, "0");
                              const m = (end.getMonth() + 1)
                                .toString()
                                .padStart(2, "0");
                              const y = end.getFullYear();
                              return `${d}/${m}/${y}`;
                            }
                            if (
                              typeof end === "object" &&
                              end !== null &&
                              typeof (end as any).toDate === "function"
                            ) {
                              const dObj = (end as any).toDate();
                              if (
                                dObj instanceof Date &&
                                !isNaN(dObj.getTime())
                              ) {
                                const d = dObj
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0");
                                const m = (dObj.getMonth() + 1)
                                  .toString()
                                  .padStart(2, "0");
                                const y = dObj.getFullYear();
                                return `${d}/${m}/${y}`;
                              }
                              return "Sin fecha";
                            }
                            return "Sin fecha";
                          })()}
                        </p>
                        <div>
                          <strong>Entregables:</strong>
                          <ul className="list-disc list-inside mt-1 ml-2">
                            {(contract.deliverables || []).map(
                              (deliverable, index) => (
                                <li key={index}>{deliverable}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          <Input
            label="Nombre del Proyecto"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: Desarrollo de aplicación web"
            required
          />

          <TextArea
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe el proyecto..."
            rows={3}
          />

          <Input
            label="Cliente"
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            placeholder="Nombre del cliente"
            required
          />

          <Input
            label="Monto del Proyecto"
            name="amount"
            type="number"
            value={formData.amount || ""}
            onChange={handleInputChange}
            placeholder="0.00"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Prioridad
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-4 h-[52px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9ae600] focus:border-[#9ae600]"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <Input
              label="Fecha Límite"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              Atrás
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              {loading ? "Creando..." : "Crear Proyecto"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateProjectModal;
