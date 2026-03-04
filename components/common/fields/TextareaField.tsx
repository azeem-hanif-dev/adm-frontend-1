import React, { TextareaHTMLAttributes } from "react";

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  required,
  error,
  icon,
  ...props
}) => {
  const isViewMode = props.disabled || props.readOnly;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          className={`text-sm font-bold ${
            isViewMode ? "text-[#808080]" : "text-[#1a1a2e]"
          }`}
        >
          {label}
          {!isViewMode && required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        <textarea
          {...props}
          className={`w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-4
          focus:ring-2 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6]
          outline-none resize-none text-[#1a1a2e]
          ${isViewMode ? "text-[#808080]" : "text-black"}
          ${props.className || ""}`}
        />

        {icon && (
          <div className="absolute bottom-4 right-4 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {/* Error space preserved for layout stability */}
      <p
        className={`text-xs min-h-[16px] ${
          !isViewMode
            ? error
              ? "text-red-500"
              : "text-transparent"
            : "invisible"
        }`}
      >
        {!isViewMode ? error || "placeholder" : ""}
      </p>
    </div>
  );
};

export default TextareaField;
