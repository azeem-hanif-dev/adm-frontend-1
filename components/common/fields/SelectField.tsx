import React, { useEffect, useRef, useState } from "react";

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  icon?: string;
  options: { label: string; value: string | number; disabled?: boolean }[];
  readOnly?: boolean;
  error?: string;
  searchable?: boolean; // 🔹 optional flag
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  required,
  icon,
  options,
  readOnly,
  error,
  className,
  disabled,
  value,
  onChange,
  searchable = true,
  ...rest
}) => {
  const isViewMode = readOnly || disabled;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  const filteredOptions = options.filter((o) =>
    o.label?.toString().toLowerCase().includes(search.toLowerCase())
  );

  const ChevronDown = ({ open }: { open: boolean }) => (
    <svg
      className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt: any) => {
    if (opt.disabled) return;

    onChange?.({
      target: { value: opt.value, name: rest.name },
    } as React.ChangeEvent<HTMLSelectElement>);

    setOpen(false);
    setSearch("");
  };
  const truncateText = (text: string, maxLength = 30) => {
    return text?.length > maxLength ? text?.slice(0, maxLength) + "..." : text;
  };
  return (
    <div className="flex flex-col gap-1 w-full" ref={wrapperRef}>
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

      {/* Field */}
      <div className="relative">
        <div
          onClick={() => !isViewMode && setOpen((p) => !p)}
          className={`w-full bg-white border border-[#e2e8f0] flex justify-between items-center rounded-xl px-4 py-4 focus:border-[#8B5CF6] outline-none text-[#1a1a2e] truncate
    ${
      isViewMode
        ? "text-[#808080] cursor-not-allowed border-[#D9D9D9]"
        : "text-black border-[#D9D9D9] cursor-pointer"
    } ${className || ""}`}
        >
          <span className="truncate">
            {selectedOption?.label || `Select ${truncateText(label ?? "", 20)}`}
          </span>

          {/* Arrow */}
          {!isViewMode && (
            <span
              className={`ml-2 ${
                isViewMode ? "text-[#B0B0B0]" : "text-gray-500"
              }`}
            >
              <ChevronDown open={open} />
            </span>
          )}
        </div>

        {icon && (
          <div
            className="absolute top-[27px] bottom-0 right-0 flex items-center justify-center rounded-r"
            style={{ width: "40px", backgroundColor: "#D9D9D9" }}
          >
            <img src={icon} alt="icon" width={16} height={16} />
          </div>
        )}

        {/* Dropdown */}
        {open && !isViewMode && (
          <div className="absolute z-50 left-0 mt-1 w-full bg-white border rounded shadow-lg">
            {searchable && (
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 border-b outline-none text-sm"
              />
            )}

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 && (
                <div className="p-2 text-sm text-gray-400">
                  No options found
                </div>
              )}

              {filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`p-2 text-sm cursor-pointer truncate
                    ${
                      opt.disabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  title={opt.label}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
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
