import { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value?: Option | null;
  placeholder?: string;
  onChange: (option: Option) => void;
};

const SearchableDropdown = ({
  options,
  value,
  placeholder = "Select option",
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt?.label?.toLowerCase().includes(search?.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={ref}>
      {/* Selected value */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="border rounded-lg shadow-md px-3 py-2 bg-white cursor-pointer text-sm
             flex items-center justify-between w-full"
      >
        <span className="truncate w-32" title={value?.label || placeholder}>
          {value?.label || placeholder}
        </span>
        <span className="text-gray-400 shrink-0">▾</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg">
          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 text-sm border-b outline-none"
          />

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 truncate"
                  title={opt.label}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
