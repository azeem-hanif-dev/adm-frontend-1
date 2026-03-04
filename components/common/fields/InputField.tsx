import React, { InputHTMLAttributes, useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  icon?: string;
  error?: string;
  isTextarea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  icon,
  error,
  type,
  isTextarea,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;

  const isViewMode = props.disabled || props.readOnly;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          className={`text-sm font-bold ${
            isViewMode ? "text-[#808080]" : "text-[#1a1a2e]"
          }`}
        >
          {label}:{" "}
          {!isViewMode && required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-4 focus:ring-2 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] outline-none text-[#1a1a2e] 
            ${isViewMode ? "text-[#808080]" : "text-black"} ${
            props.className || ""
          }`}
        />

        {icon && type !== "password" && (
          <div className="absolute right-0 top-0 cursor-pointer bg-[#D9D9D9] w-10 flex justify-center items-center rounded-r-sm h-full">
            <img src={icon} alt="icon" height={18} width={18} />
          </div>
        )}

        {type === "password" && !isViewMode && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
          >
            {showPassword ? (
              <FaEye size={18} color="#474747" className="cursor-pointer" />
            ) : (
              <FaEyeSlash
                size={18}
                color="#474747"
                className="cursor-pointer"
              />
            )}
          </button>
        )}
      </div>

      {/* Keep space consistent but hide error/placeholder in view mode */}
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

export default InputField;
