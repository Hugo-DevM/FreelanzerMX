import React from "react";
import Card from "../ui/Card";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: string; // Nueva prop opcional para personalización
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant,
}) => {
  const isProfileSuccess = variant === "profile-success";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-4 text-[#1A1A1A] text-center">
          {title}
        </h2>
        <p className="mb-6 text-[#444] text-center">{message}</p>
        <div
          className={
            isProfileSuccess ? "flex justify-center" : "flex justify-end gap-4"
          }
        >
          {!isProfileSuccess && cancelText && (
            <button
              className="px-4 py-2 rounded bg-gray-200 text-[#222] font-semibold hover:bg-gray-300 transition"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            className={
              isProfileSuccess
                ? "px-6 py-2 rounded bg-[#9ae700] text-white font-bold hover:bg-[#7fc400] transition text-lg"
                : "px-4 py-2 rounded bg-[#e11d48] text-white font-semibold hover:bg-[#991b1b] transition"
            }
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;
