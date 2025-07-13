"use client";

import React, { forwardRef } from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, rows = 3, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full px-4 py-4 border rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-[#0E0E2C] placeholder-[#6B7280] resize-none";

    const stateClasses = error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : "border-[#E5E7EB] focus:border-[#9ae600] focus:ring-[#9ae600]";

    const classes = `${baseClasses} ${stateClasses} ${className}`;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[#0E0E2C]">
            {label}
          </label>
        )}

        <textarea ref={ref} rows={rows} className={classes} {...props} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="text-sm text-[#666666]">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
