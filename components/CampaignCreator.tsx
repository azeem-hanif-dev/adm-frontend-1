import React, { useState, useRef, useMemo, useEffect } from "react";
import GlassCard from "./common/GlassCard";
import { Lead, Campaign, LeadStatus } from "../types";
import {
  FileText,
  Sparkles,
  Send,
  ChevronRight,
  Loader2,
  CloudUpload,
  Users,
  CheckSquare,
  Square,
  Search,
  Calendar,
  Rocket,
  CalendarDays,
  RefreshCw,
  Info,
  Filter,
} from "lucide-react";
import { analyzePoster } from "../services/geminiService";
import { base64ToFile } from "@/utils/base64ToFile";
import { createCampaign, sendCampaign } from "@/services/campaign.service";
import FilterPopup from "./common/popup/FilterPopup";
import CampaignCreateStep3 from "./content/campaigns/CampaignCreateStep3";

interface CampaignCreatorProps {
  leads: Lead[];
  onSave: () => void;
  onCancel: () => void;
  initialCampaign?: Campaign;
}

const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  leads,
  onSave,
  onCancel,
  initialCampaign,
}) => {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [campaignLeads, setCampaignLeads] = useState<Lead[]>(leads);
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    mailFrom: "sales.international@cappah.com",
    ccMail: "",
    tone: "Professional" as any,
    posterUrl: null as string | null,
    targetIndustry: "customers",
    scheduleType: "INSTANT" as "INSTANT" | "SCHEDULED",
    scheduledDate: "",
    scheduledTime: "10:00",
  });

  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(
    new Set()
  );
  const [leadSearch, setLeadSearch] = useState("");
  const [reRunAutoFilteredCount, setReRunAutoFilteredCount] = useState(0);

  // Populate data if re-running
  useEffect(() => {
    if (initialCampaign) {
      setFormData({
        name: `${initialCampaign.name} (Follow-up)`,
        goal: initialCampaign.goal,
        mailFrom: initialCampaign.mailFrom,
        ccMail: initialCampaign.ccMail || "",
        tone: initialCampaign.tone,
        posterUrl: initialCampaign.posterUrl,
        targetIndustry: "customers",
        scheduleType: initialCampaign.scheduledDate ? "SCHEDULED" : "INSTANT",
        scheduledDate: initialCampaign.scheduledDate || "",
        scheduledTime: initialCampaign.scheduledTime || "10:00",
      });
      setAnalysis(initialCampaign.analyzedContent || null);

      const originalTargetIds = initialCampaign.targetLeads;
      const filteredIds = originalTargetIds.filter((id) => {
        const lead = leads.find((l) => l.id === id);
        return lead && lead.status !== LeadStatus.REPLIED;
      });

      setReRunAutoFilteredCount(originalTargetIds.length - filteredIds.length);
      setSelectedLeadIds(new Set(filteredIds));
    }
  }, [initialCampaign, leads]);

  // Poster upload & analysis
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, posterUrl: base64String }));

        setIsAnalyzing(true);
        try {
          const result = await analyzePoster(base64String);
          setAnalysis(result);
        } catch (error) {
          console.error("Analysis failed", error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const eligibleLeads = useMemo(() => {
    const search = leadSearch.toLowerCase();

    return campaignLeads.filter((l) => {
      const company = l.companyName?.toLowerCase() || "";
      const contact = l.contactName?.toLowerCase() || "";

      return company.includes(search) || contact.includes(search);
    });
  }, [campaignLeads, leadSearch]);

  const paginatedLeadsList = useMemo(() => {
    if (perPage === -1) return eligibleLeads; // -1 = all
    const start = (currentPage - 1) * perPage;
    return eligibleLeads.slice(start, start + perPage);
  }, [eligibleLeads, currentPage, perPage]);

  const countries = useMemo(() => {
    return Array.from(
      new Set(eligibleLeads.map((l) => l.country).filter(Boolean))
    );
  }, [eligibleLeads]);

  const totalPages = useMemo(() => {
    return perPage === -1 ? 1 : Math.ceil(eligibleLeads.length / perPage);
  }, [eligibleLeads.length, perPage]);

  const toggleLead = (id: string) => {
    const next = new Set(selectedLeadIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLeadIds(next);
  };

  const handleCreate = async () => {
    try {
      if (selectedLeadIds.size === 0) throw new Error("No leads selected");

      // Map selected leads to API format
      const customers = leads
        .filter((l) => selectedLeadIds.has(l.id))
        .map((l) => ({
          email: l.email,
          name: l.contactName,
          company_name: l.companyName,
          country: l.country || "Unknown",
        }));

      // Extract MIME type from base64
      let brochure_image = null;
      let brochure_mime_type = null;
      if (formData.posterUrl) {
        const match = formData.posterUrl.match(
          /^data:(image\/[a-zA-Z]+);base64,(.*)$/
        );
        if (match) {
          brochure_mime_type = match[1];
          brochure_image = match[2];
        }
      }

      const payload = {
        campaign_name: formData.name,
        campaign_prompt: formData.goal,
        subject: formData.name,
        customers,
        company_type: formData.targetIndustry || "customers",
        brochure_image,
        brochure_mime_type,
      };

      // const result = await sendCampaign(formData, customers);
      const result = await createCampaign(payload);

      if (result?.status) {
        console.log("Campaign sent successfully", result.data);
      } else {
        console.log("Error creating campaign", result.data);
      }
      if (result?.status) {
        onSave();
      }
      // onSave({
      //   id: Math.random().toString(36).substring(2, 9),
      //   name: formData.name,
      //   goal: formData.goal,
      //   mailFrom: formData.mailFrom,
      //   ccMail: formData.ccMail,
      //   tone: formData.tone,
      //   posterUrl: formData.posterUrl,
      //   analyzedContent: analysis,
      //   targetLeads: Array.from(selectedLeadIds),
      //   status: formData.scheduleType === "INSTANT" ? "Sending" : "Scheduled",
      //   scheduledDate: formData.scheduledDate,
      //   scheduledTime: formData.scheduledTime,
      //   createdAt: Date.now(),
      //   runCount: initialCampaign ? initialCampaign.runCount + 1 : 1,
      // });
    } catch (error) {
      console.error("Campaign error:", error);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a2e]">
            {initialCampaign
              ? `Re-run Campaign: Run #${initialCampaign.runCount + 1}`
              : "Run New Campaign"}
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            {initialCampaign
              ? `Smart re-targeting active. Excluding recipients who already replied.`
              : "Run your campaign with AI-powered outreach assets."}
          </p>
        </div>
        <div className="flex items-center gap-12">
          <button
            onClick={onCancel}
            className="px-8 py-3 bg-[#71717a] text-white rounded-xl font-semibold hover:bg-[#52525b] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
              step >= s ? "bg-[#8B5CF6]" : "bg-[#e2e8f0]"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: STRATEGY & IDENTITY */}
          {step === 1 && (
            <GlassCard className="p-10 space-y-8 border-[#f1f5f9]" glow="none">
              <h3 className="text-xl font-bold flex items-center gap-3 text-[#1a1a2e]">
                <Rocket size={24} className="text-[#8B5CF6]" /> 1. Strategy &
                Identity
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1a1a2e]">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    placeholder="New Product Launch"
                    className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-4 focus:ring-2 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] outline-none text-[#1a1a2e]"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1a1a2e]">
                    Primary Objective
                  </label>
                  <div className="relative">
                    <textarea
                      placeholder="Promotion of new product"
                      rows={5}
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-4 focus:ring-2 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] outline-none text-[#1a1a2e] resize-none"
                      value={formData.goal}
                      onChange={(e) =>
                        setFormData({ ...formData, goal: e.target.value })
                      }
                    />
                    <FileText
                      className="absolute bottom-4 right-4 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a2e]">
                      Mail From
                    </label>
                    <select
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-4 focus:border-[#8B5CF6] outline-none text-[#1a1a2e]"
                      value={formData.mailFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, mailFrom: e.target.value })
                      }
                    >
                      <option>sales.international@cappah.com</option>
                      <option>sales@greenway.com</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a2e]">
                      CC Mail (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="sulman@gmail.com"
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-4 focus:border-[#8B5CF6] outline-none text-[#1a1a2e]"
                      value={formData.ccMail}
                      onChange={(e) =>
                        setFormData({ ...formData, ccMail: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={!formData.name || !formData.goal}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#8B5CF6]/20 disabled:opacity-50 transition-all"
                >
                  Next: Analysis <ChevronRight size={20} />
                </button>
              </div>
            </GlassCard>
          )}

          {/* STEP 2: ATTACH VISUAL ASSET */}
          {step === 2 && (
            <GlassCard className="p-10 space-y-8 border-[#f1f5f9]" glow="none">
              <h3 className="text-xl font-bold flex items-center gap-3 text-[#1a1a2e]">
                <FileText size={24} className="text-[#8B5CF6]" /> 2. Attach
                Visual Asset
              </h3>

              <div
                onClick={() =>
                  !formData.posterUrl && fileInputRef.current?.click()
                }
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
                  formData.posterUrl
                    ? "border-purple-200 bg-purple-50"
                    : "border-[#e2e8f0] hover:border-[#8B5CF6] cursor-pointer"
                }`}
              >
                {formData.posterUrl ? (
                  <div className="space-y-4">
                    <img
                      src={formData.posterUrl}
                      className="h-48 mx-auto rounded-xl shadow-md object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, posterUrl: null });
                        setAnalysis(null);
                      }}
                      className="text-red-500 font-bold text-sm hover:underline"
                    >
                      Remove and try again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                      <CloudUpload size={32} className="text-[#1a1a2e]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#1a1a2e]">
                        Choose a file or drag &drop it here
                      </h4>
                      <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-sm mx-auto">
                        You can add up to 10 poster through jpg , png file.
                      </p>
                    </div>
                    <button className="px-10 py-3 bg-[#8B5CF6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all">
                      Browse File
                    </button>
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                  </div>
                )}
              </div>

              {isAnalyzing && (
                <div className="flex items-center justify-center gap-3 text-[#8B5CF6] font-bold">
                  <Loader2 className="animate-spin" size={20} />
                  AI Analysis in progress...
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-[#71717a] text-white rounded-2xl font-bold"
                >
                  Back
                </button>
                <button
                  disabled={!formData.posterUrl || isAnalyzing}
                  onClick={() => setStep(3)}
                  className="flex-[2] py-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#8B5CF6]/20"
                >
                  Next: Select Leads <ChevronRight size={20} />
                </button>
              </div>
            </GlassCard>
          )}

          {/* STEP 3: SELECT LEAD AUDIENCE */}
          {step === 3 && (
            <CampaignCreateStep3
              initialCampaign={initialCampaign}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              setIsFilterOpen={setIsFilterOpen}
              isFilterOpen={isFilterOpen}
              countries={countries}
              setCurrentPage={setCurrentPage}
              // toggleAllVisible={toggleAllVisible}
              eligibleLeads={eligibleLeads}
              selectedLeadIds={selectedLeadIds}
              reRunAutoFilteredCount={reRunAutoFilteredCount}
              // paginatedLeads={paginatedLeads}
              currentPage={currentPage}
              setSelectedLeadIds={setSelectedLeadIds}
              LeadStatus={LeadStatus}
              toggleLead={toggleLead}
              perPage={perPage}
              setPerPage={setPerPage}
              // filteredLeads={filteredLeads}
              setStep={setStep}
              setCampaignLeads={setCampaignLeads}
              setFormData={setFormData}
            />
          )}

          {/* STEP 4: SCHEDULE & LAUNCH */}
          {step === 4 && (
            <GlassCard
              className="p-10 space-y-8 border-[#f1f5f9]"
              glow="purple"
            >
              <h3 className="text-xl font-bold flex items-center gap-3 text-[#1a1a2e]">
                <Calendar size={24} className="text-[#8B5CF6]" /> 4. Delivery
                Schedule
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div
                  onClick={() =>
                    setFormData({ ...formData, scheduleType: "INSTANT" })
                  }
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                    formData.scheduleType === "INSTANT"
                      ? "border-[#8B5CF6] bg-purple-50"
                      : "border-[#e2e8f0] bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        formData.scheduleType === "INSTANT"
                          ? "bg-[#8B5CF6] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Rocket size={24} />
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData.scheduleType === "INSTANT"
                          ? "border-[#8B5CF6]"
                          : "border-gray-200"
                      }`}
                    >
                      {formData.scheduleType === "INSTANT" && (
                        <div className="w-3 h-3 bg-[#8B5CF6] rounded-full" />
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-[#1a1a2e]">
                    Launch Immediately
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Start follow-up delivery now.
                  </p>
                </div>

                <div
                  onClick={() =>
                    setFormData({ ...formData, scheduleType: "SCHEDULED" })
                  }
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                    formData.scheduleType === "SCHEDULED"
                      ? "border-[#8B5CF6] bg-purple-50"
                      : "border-[#e2e8f0] bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        formData.scheduleType === "SCHEDULED"
                          ? "bg-[#8B5CF6] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <CalendarDays size={24} />
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData.scheduleType === "SCHEDULED"
                          ? "border-[#8B5CF6]"
                          : "border-gray-200"
                      }`}
                    >
                      {formData.scheduleType === "SCHEDULED" && (
                        <div className="w-3 h-3 bg-[#8B5CF6] rounded-full" />
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-[#1a1a2e]">
                    Schedule for Later
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Pick the best time for follow-up.
                  </p>
                </div>
              </div>

              {formData.scheduleType === "SCHEDULED" && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-[#f8fafc] rounded-3xl border border-[#f1f5f9] animate-in slide-in-from-top-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a2e]">
                      Pick Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 outline-none focus:border-[#8B5CF6]"
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a2e]">
                      Set Time
                    </label>
                    <input
                      type="time"
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 outline-none focus:border-[#8B5CF6]"
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-[#71717a] text-white rounded-2xl font-bold"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-[2] py-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#8B5CF6]/30 flex items-center justify-center gap-3"
                >
                  {initialCampaign ? (
                    <>
                      <RefreshCw size={24} /> Launch Follow-up Run
                    </>
                  ) : formData.scheduleType === "INSTANT" ? (
                    "Launch Campaign Now"
                  ) : (
                    "Schedule Campaign Launch"
                  )}
                </button>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard
            className="p-8 border-[#f1f5f9] bg-white shadow-sm"
            glow="none"
          >
            <h4 className="text-lg font-bold text-[#1a1a2e] mb-6">
              Campaign Snapshot
            </h4>
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1a1a2e]">
                  Industry Scope
                </span>
                <p className="text-sm text-gray-500 font-medium">
                  {formData.targetIndustry || "customers"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1a1a2e]">
                  Brand Voice
                </span>
                <p className="text-sm text-gray-500 font-medium">
                  {formData.tone}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#1a1a2e]">
                  Lead Selection
                </span>
                <p className="text-2xl font-black text-[#8B5CF6]">
                  {selectedLeadIds.size}
                </p>
              </div>
              {initialCampaign && (
                <div className="space-y-1 pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Re-run Strategy
                  </span>
                  <p className="text-sm font-bold text-purple-600">
                    Run count incremented to {initialCampaign.runCount + 1}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium italic mt-2">
                    Interested leads from Run #{initialCampaign.runCount} have
                    been automatically removed.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="p-8 bg-[#f5f0ff] rounded-3xl border border-[#e9e0ff] relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#8B5CF6]" />
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  Retargeting Intelligence
                </span>
              </div>
              <p className="text-xs text-[#8B5CF6] font-semibold leading-relaxed">
                "Follow-up campaigns perform 65% better when you explicitly
                exclude already-replied leads. This protects your brand
                reputation and focuses energy on the undecided."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreator;
