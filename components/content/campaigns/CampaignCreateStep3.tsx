import GlassCard from "@/components/common/GlassCard";
import FilterPopup from "@/components/common/popup/FilterPopup";
import { TableSkeleton } from "@/components/common/skeleton/TableSkeleton";
import { fetchCustomersByType } from "@/services/customers.service";
import { API_HANDLER } from "@/utils/apiHandler";
import {
  CheckSquare,
  ChevronRight,
  Filter,
  Info,
  Sparkles,
  Square,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type CompanyTypes = {
  label: string;
  value: string;
};

const CampaignCreateStep3 = ({
  initialCampaign,
  selectedCountry,
  setSelectedCountry,
  setIsFilterOpen,
  isFilterOpen,
  countries,
  setCurrentPage,
  eligibleLeads,
  selectedLeadIds,
  reRunAutoFilteredCount,
  currentPage,
  setSelectedLeadIds,
  LeadStatus,
  toggleLead,
  perPage,
  setPerPage,
  setCampaignLeads,
  setFormData,
  setStep,
}) => {
  const [leadSearch, setLeadSearch] = useState("");
  const [companyTypes, setCompanyTypes] = useState<CompanyTypes[]>([]);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string | null>(
    null
  );
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    const fetchCompanyTypes = async () => {
      try {
        const res = await API_HANDLER<any>("GET", "company-types");
        if (res.status) {
          setCompanyTypes(res.data);
        }
      } catch (error) {
        console.error("Failed to load company types", error);
      }
    };

    fetchCompanyTypes();
  }, []);

  const fetchLeadsByCompanyType = async (type: string) => {
    setLoadingLeads(true);
    setCurrentPage(1);
    setSelectedLeadIds(new Set());

    try {
      const leads = await fetchCustomersByType(type);
      setCampaignLeads(leads);

      setFormData((prev) => ({
        ...prev,
        targetIndustry: type,
      }));
    } catch (error) {
      console.error("Failed to load leads", error);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (selectedCompanyType) {
      fetchLeadsByCompanyType(selectedCompanyType);
    }
  }, [selectedCompanyType]);

  const filteredLeads = useMemo(() => {
    return eligibleLeads.filter((lead) => {
      const matchesSearch =
        lead?.contactName?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        lead?.email?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        lead?.companyName?.toLowerCase().includes(leadSearch.toLowerCase());

      const matchesCountry = selectedCountry
        ? lead.country === selectedCountry
        : true;

      return matchesSearch && matchesCountry;
    });
  }, [eligibleLeads, leadSearch, selectedCountry]);

  const paginatedLeads = useMemo(() => {
    if (perPage === -1) return filteredLeads;

    const start = (currentPage - 1) * perPage;
    return filteredLeads.slice(start, start + perPage);
  }, [filteredLeads, currentPage, perPage]);

  const toggleAllVisible = () => {
    const allVisibleSelected = paginatedLeads.every((l) =>
      selectedLeadIds.has(l.id)
    );
    const next = new Set(selectedLeadIds);
    if (allVisibleSelected) {
      paginatedLeads.forEach((l) => next.delete(l.id));
    } else {
      paginatedLeads.forEach((l) => next.add(l.id));
    }
    setSelectedLeadIds(next);
  };

  return (
    <GlassCard className="p-10 space-y-8 border-[#f1f5f9]" glow="none">
      <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center space-y-2 justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users size={24} className="text-[#8B5CF6]" />

            <select
              value={selectedCompanyType ?? ""}
              onChange={(e) => setSelectedCompanyType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
            >
              <option value="" disabled>
                Select Company Type
              </option>

              {companyTypes?.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {initialCampaign && (
            <p className="text-xs font-bold text-purple-600 mt-2 flex items-center gap-2">
              <Sparkles size={14} /> Re-run Mode: Focusing on non-replied leads
              from original batch.
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {selectedCountry && (
            <div className="flex items-center gap-2 p-2 bg-white border border-[#e2e8f0] rounded-md text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              {selectedCountry}
            </div>
          )}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 p-2 bg-white border border-[#e2e8f0] rounded-md text-sm font-medium text-gray-400 hover:bg-gray-50 transition-all"
          >
            <Filter size={18} /> Filter
          </button>

          <FilterPopup
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            countries={countries}
            onClear={() => {
              setSelectedCountry(null);
            }}
            onSearch={() => {
              setCurrentPage(1);
              setIsFilterOpen(false);
            }}
          />
          <button
            onClick={toggleAllVisible}
            className="flex items-center gap-2 p-2 rounded-md bg-white border border-[#e2e8f0] text-xs font-bold text-[#1a1a2e]"
          >
            {eligibleLeads.every((l) => selectedLeadIds.has(l.id)) ? (
              <CheckSquare size={16} className="text-[#8B5CF6]" />
            ) : (
              <Square size={16} className="text-gray-300" />
            )}
            Select All
          </button>
        </div>
      </div>

      {initialCampaign && reRunAutoFilteredCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <Info className="text-amber-500 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-bold text-amber-800">
              Interested Leads Auto-Excluded
            </p>
            <p className="text-xs text-amber-600 font-medium">
              We've automatically de-selected{" "}
              <span className="font-bold underline">
                {reRunAutoFilteredCount} leads
              </span>{" "}
              who already replied to your previous run to ensure a high-quality
              experience.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-y-auto max-h-[400px] border border-[#f1f5f9] rounded-2xl bg-[#f8fafc]/50">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-gray-500 text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-2 py-5 w-20"></th>
              <th className="px-2 py-5">Customer Name</th>
              <th className="px-2 py-5">Company</th>
              <th className="px-2 py-5">Country</th>
              <th className="px-2 py-5">Status</th>
            </tr>
          </thead>
          {loadingLeads ? (
            <TableSkeleton rows={6} />
          ) : (
            <tbody className="divide-y divide-[#f1f5f9] bg-white">
              {paginatedLeads.map((lead) => {
                const isSelected = lead.email === initialCampaign?.mailFrom;
                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-purple-50/30 transition-colors ${
                      lead.status === LeadStatus.REPLIED ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-2 py-5 text-center">
                      <button
                        onClick={() => toggleLead(lead.id)}
                        disabled={lead.status === LeadStatus.REPLIED}
                      >
                        {selectedLeadIds.has(lead.id) ? (
                          // {isSelected ? (
                          <CheckSquare size={18} className="text-[#8B5CF6]" />
                        ) : (
                          <Square size={18} className="text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-2 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1a1a2e]">
                          {lead.contactName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {lead.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-5 text-gray-500 font-medium">
                      {lead.companyName}
                    </td>

                    <td className="px-2 py-5 text-gray-500 font-medium">
                      {lead.country}
                    </td>
                    <td className="px-2 py-5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                          lead.status === LeadStatus.REPLIED
                            ? "bg-green-50 text-green-600 border-green-100"
                            : lead.status === LeadStatus.SENT
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
      {/* Per Page Selector */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-xs text-gray-500 mr-2 font-medium">Show</label>
          <select
            value={perPage}
            onChange={(e) => {
              const value =
                e.target.value === "all" ? -1 : parseInt(e.target.value);
              setPerPage(value);
              setCurrentPage(1);
            }}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6]"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={-1}>All</option>
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Showing {paginatedLeads.length} of {filteredLeads.length} leads
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-4 bg-[#71717a] text-white rounded-2xl font-bold"
        >
          Back
        </button>
        <button
          disabled={selectedLeadIds.size === 0}
          onClick={() => setStep(4)}
          className="flex-[2] py-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#8B5CF6]/20"
        >
          Confirm: Targeting {selectedLeadIds.size} Leads{" "}
          <ChevronRight size={20} />
        </button>
      </div>
    </GlassCard>
  );
};

export default CampaignCreateStep3;
