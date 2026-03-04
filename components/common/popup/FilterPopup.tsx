import React, { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;

  // country
  countries: string[];
  selectedCountry: string | null;
  setSelectedCountry: (v: string | null) => void;

  // Company
  companies?: string[];
  selectedCompany?: string | null;
  setSelectedCompany?: (v: string | null) => void;

  onClear: () => void;
  onSearch: () => void;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
  isOpen,
  onClose,
  countries,
  selectedCountry,
  setSelectedCountry,
  companies,
  selectedCompany,
  setSelectedCompany,
  onClear,
  onSearch,
}) => {
  if (!isOpen) return null;
  const [isCountryFilterOpen, setIsCountryFilterOpen] = useState(false);
  const [localCountry, setLocalCountry] = useState<string | null>(
    selectedCountry
  );
  useEffect(() => {
    if (isOpen) {
      setLocalCountry(selectedCountry);
    }
  }, [isOpen, selectedCountry]);

  if (!isOpen) return null;

  const handleSearch = () => {
    setSelectedCountry(localCountry);
    onSearch();
  };

  const handleClear = () => {
    setLocalCountry(null);
    setSelectedCountry(null);
    onClear();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#F9FAFB] w-[520px] h-[420px] rounded-lg shadow-xl p-8 z-10">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-[#1a1a2e] mb-8">
          Select Country
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-6">
          {/* country Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCountryFilterOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 border border-purple-400 rounded-lg text-sm"
            >
              {localCountry ?? "Country..."}
              <ChevronDown size={16} />
            </button>

            {isCountryFilterOpen && (
              <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => {
                      setLocalCountry(country);
                      setIsCountryFilterOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50"
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company Dropdown */}
          {/* <div className="relative">
            <button className="w-full flex items-center justify-between px-4 py-3 border border-purple-400 rounded-lg text-sm">
              {selectedCompany ?? "Company..."}
              <ChevronDown size={16} />
            </button>

            <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50"
                >
                  {company}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-[90%] absolute bottom-5">
          <button
            onClick={handleClear}
            className="flex-1 py-3 border border-purple-500 text-purple-600 rounded-lg font-bold hover:bg-purple-50"
          >
            Clear filter
          </button>

          <button
            onClick={handleSearch}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
