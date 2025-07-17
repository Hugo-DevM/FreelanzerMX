"use client";

import React from "react";
import { GoogleIcon } from "./icons";

interface GoogleButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  className = "",
  children = "Continuar con Google",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full flex items-center justify-center gap-3 px-4 py-3 
        border border-gray-300 rounded-lg 
        bg-white text-gray-700 font-medium
        hover:bg-gray-50 hover:border-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <GoogleIcon size={20} />
      )}
      <span>{children}</span>
    </button>
  );
};

export default GoogleButton; 