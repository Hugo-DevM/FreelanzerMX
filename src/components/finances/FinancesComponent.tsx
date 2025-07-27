"use client";

import React, { useState, useEffect, useTransition } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuthContext } from "../../contexts/AuthContext";
import { useFinances } from "../../contexts/FinanceContext";
import { supabase } from "../../lib/supabase";
import { getUserProjects } from "../../services/projectService";
import { Project } from "../../types/project";
import ErrorModal from "../shared/ErrorModal";

interface Transaction {
  id: string;
  tipo: "ingreso" | "egreso";
  concepto: string;
  categoria: string;
  monto: number;
  fecha: string;
  user_id: string;
  project_id?: string;
}

function getLocalDateString() {
  const today = new Date();
  const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

const initialForm = {
  tipo: "ingreso",
  concepto: "",
  categoria: "",
  monto: "",
  fecha: getLocalDateString(),
  project_id: "",
};

export default function FinancesComponent() {
  const { user } = useAuthContext();
  const { finances, loading, error, fetched, fetchData, refreshData } =
    useFinances();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!loading && !fetched) {
      startTransition(() => {
        fetchData();
      });
    }
  }, [loading, fetched, fetchData, startTransition]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (err) {
      setProjects([]);
    }
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tipo" && value === "egreso") {
      setForm({ ...form, tipo: value, project_id: "", monto: "" });
      return;
    }

    if (name === "project_id") {
      const selected = projects.find((p) => p.id === value);
      setForm({
        ...form,
        project_id: value,
        concepto: selected ? selected.name : form.concepto,
        categoria: selected ? "Pago de proyecto" : form.categoria,
        monto: selected && selected.amount ? selected.amount.toString() : "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async () => {
    if (
      !form.concepto ||
      !form.categoria ||
      !form.monto ||
      !form.fecha ||
      !user
    )
      return;

    setModalLoading(true);
    setModalError("");

    // Timeout de seguridad para evitar que se quede colgado
    const timeoutId = setTimeout(() => {
      setModalLoading(false);
      setModalError("Tiempo de espera agotado. Intenta de nuevo.");
    }, 10000);

    try {
      const insertData: any = {
        tipo: form.tipo,
        concepto: form.concepto,
        categoria: form.categoria,
        monto: parseFloat(form.monto),
        fecha: form.fecha,
        user_id: user.uid,
      };

      if (form.tipo === "ingreso" && form.project_id) {
        insertData.project_id = form.project_id;
      }

      const { error: insertError } = await supabase
        .from("transactions")
        .insert([insertData]);

      if (insertError) throw insertError;

      clearTimeout(timeoutId);

      setShowModal(false);
      setForm(initialForm);
      setModalLoading(false);

      // Refrescar datos en segundo plano
      try {
        await refreshData();
      } catch (refreshError) {
        console.error("Error al refrescar datos:", refreshError);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Error al guardar movimiento:", err);
      setModalError("Error al guardar movimiento");
      setErrorMessage(err.message || "Error al guardar movimiento");
      setShowErrorModal(true);
      setModalLoading(false);
    }
  };

  const handleShowModal = () => {
    setForm({ ...initialForm, fecha: getLocalDateString() });
    setModalLoading(false);
    setModalError("");
    setShowModal(true);
  };

  const usedProjectIds = finances
    .filter((tx) => tx.tipo === "ingreso" && tx.project_id)
    .map((tx) => tx.project_id);
  const availableProjects = projects.filter(
    (p) => !usedProjectIds.includes(p.id)
  );

  const isFormValid =
    !!form.concepto &&
    !!form.categoria &&
    !!form.monto &&
    !isNaN(Number(form.monto)) &&
    Number(form.monto) > 0 &&
    !!form.fecha;

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando finanzas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Finanzas</h1>
          <p className="text-[#666] text-base mt-1">
            Administra y visualiza tus ingresos y egresos de manera sencilla.
          </p>
        </div>
        <Button onClick={handleShowModal} color="primary">
          + Nuevo Movimiento
        </Button>
      </div>
      <Card className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="py-3 px-4 text-sm font-medium text-[#666666] text-left">
                  Tipo
                </th>
                <th className="py-3 px-4 text-sm font-medium text-[#666666] text-left">
                  Concepto
                </th>
                <th className="py-3 px-4 text-sm font-medium text-[#666666] text-left">
                  Categoría
                </th>
                <th className="py-3 px-4 text-sm font-medium text-[#666666] text-right">
                  Monto
                </th>
                <th className="py-3 px-4 text-sm font-medium text-[#666666] text-right">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {finances.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-[#999]">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
              {finances.map((tx) => (
                <tr key={tx.id} className="border-b border-[#E5E7EB]">
                  <td
                    className={`py-3 px-4 text-sm font-medium text-left ${
                      tx.tipo === "ingreso" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.tipo.charAt(0).toUpperCase() + tx.tipo.slice(1)}
                  </td>
                  <td className="py-3 px-4 text-sm text-left">{tx.concepto}</td>
                  <td className="py-3 px-4 text-sm text-left">
                    {tx.categoria}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm font-semibold text-right ${
                      tx.tipo === "ingreso" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.tipo === "ingreso" ? "+" : "-"}$
                    {Number(tx.monto).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#666] text-right">
                    {formatDate(tx.fecha)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nuevo Movimiento</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleInput}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9ae700]"
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
            {form.tipo === "ingreso" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Proyecto asociado (opcional)
                </label>
                <select
                  name="project_id"
                  value={form.project_id}
                  onChange={handleInput}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9ae700]"
                >
                  <option value="">Sin proyecto asociado</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {availableProjects.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-2">
                    No hay proyectos disponibles para asociar, pero puedes
                    registrar un ingreso normal.
                  </p>
                )}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Concepto</label>
              <Input
                name="concepto"
                value={form.concepto}
                onChange={handleInput}
                placeholder="Ej: Pago de cliente"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Categoría
              </label>
              <Input
                name="categoria"
                value={form.categoria}
                onChange={handleInput}
                placeholder="Ej: Servicios, Gastos, etc."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Monto</label>
              <Input
                name="monto"
                type="number"
                min="0"
                value={form.monto}
                onChange={handleInput}
                placeholder="0.00"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <Input
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={handleInput}
              />
            </div>
            {modalError && (
              <div className="text-red-500 text-sm mb-2">{modalError}</div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setModalLoading(false);
                  setModalError("");
                  setForm(initialForm);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={modalLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                color="primary"
                disabled={modalLoading || !isFormValid}
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
      {showErrorModal && (
        <ErrorModal
          open={showErrorModal}
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
}
