import React from "react";
import Button from "../ui/Button";

interface ErrorModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          ¡Ocurrió un error!
        </h2>
        <p className="text-[#1A1A1A] mb-6">{message}</p>
        <Button variant="secondary" onClick={onClose} className="w-full">
          OK
        </Button>
      </div>
    </div>
  );
};

export default ErrorModal;
