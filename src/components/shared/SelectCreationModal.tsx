import React from "react";
import Card from "../ui/Card";
import { XIcon } from "../ui/icons";

interface Option {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

interface SelectCreationModalProps {
  title: string;
  onClose: () => void;
  options: Option[];
}

const SelectCreationModal: React.FC<SelectCreationModalProps> = ({
  title,
  onClose,
  options,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            <XIcon />
          </button>
        </div>
        <div className="space-y-4">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={opt.onClick}
              className="w-full p-4 border-2 border-dashed border-[#9ae600] rounded-lg hover:bg-[#9ae600] hover:bg-opacity-10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                {opt.icon}
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{opt.title}</h3>
                  <p className="text-sm text-[#666666] group-hover:text-white transition-colors">
                    {opt.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SelectCreationModal;
