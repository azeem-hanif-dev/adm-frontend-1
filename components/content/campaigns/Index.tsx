import CampaignCreator from "@/components/CampaignCreator";
import CampaignMonitor from "@/components/CampaignMonitor";
import GlassCard from "@/components/common/GlassCard";
import Pagination from "@/components/common/pagination/Index";
import { TableSkeleton } from "@/components/common/skeleton/TableSkeleton";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCustomers } from "@/hooks/useCustomers";
import { Campaign, LeadStatus } from "@/types";
import {
  Clock,
  Eye,
  Filter,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { useState } from "react";

type CampaignView = "LIST" | "CREATE" | "MONITOR";

const Campagins = () => {
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | undefined>(
    undefined
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  // const [campaignSearch, setCampaignSearch] = useState("");
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [view, setView] = useState<CampaignView>("LIST");
  const {
    campaigns: campaignListing,
    loading,
    page,
    totalPages,
    setPage,
    refreshCampaigns,
    setCampaignSearch,
    campaignSearch,
  } = useCampaigns();
  const { leads, loading: loadingLeads, setLeads } = useCustomers();

  const handleReRun = (campaign: Campaign) => {
    setCampaignToEdit(campaign);
    setView("CREATE");
  };

  const handleCreate = () => {
    setCampaignToEdit(undefined);
    setView("CREATE");
  };

  const openMonitor = (id: string, data: Campaign) => {
    setCampaignToEdit(data);
    setActiveCampaignId(id);
    setView("MONITOR");
  };

  const closeMonitor = () => {
    setActiveCampaignId(null);
    setView("LIST");
  };

  const calculateProgress = (campaign: Campaign) => {
    const targetLeads = leads.filter((l) =>
      campaign.targetLeads?.includes(l.id)
    );
    const sent = targetLeads.filter(
      (l) => l.status === LeadStatus.SENT || l.status === LeadStatus.REPLIED
    ).length;
    return targetLeads.length > 0
      ? Math.round((sent / targetLeads.length) * 100)
      : 0;
  };

  const filteredCampaigns = campaignListing.filter((c) =>
    c.name.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  //   const handleSaveCampaign = (newCampaign: Campaign) => {
  //     setCampaigns((prev) => {
  //       const existingIdx = prev.findIndex((c) => c.id === newCampaign.id);
  //       if (existingIdx > -1) {
  //         const next = [...prev];
  //         next[existingIdx] = newCampaign;
  //         return next;
  //       }
  //       return [newCampaign, ...prev];
  //     });
  //     setCampaignToEdit(undefined);
  //     setActiveCampaignId(newCampaign.id);
  //     setView("MONITOR");
  //   };
  const handleSaveCampaign = async () => {
    setView("LIST");
    setCampaignToEdit(undefined);

    await refreshCampaigns();
  };

  return (
    <>
      {view === "CREATE" && (
        <CampaignCreator
          leads={leads}
          onSave={handleSaveCampaign}
          initialCampaign={campaignToEdit}
          onCancel={() => {
            setCampaignToEdit(undefined);
            setView("LIST");
          }}
        />
      )}
      {view === "LIST" && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-[42px] font-bold text-[#1a1a2e]">
                Campaigns
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                Manage and track your AI-powered outreach assets.
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-10 py-4 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white transition-all rounded-2xl font-bold shadow-lg shadow-[#8B5CF6]/20 flex items-center gap-2 text-base"
            >
              <Plus size={24} /> Create Campaign
            </button>
          </div>

          <GlassCard
            className="!p-0 border-[#f1f5f9] bg-white rounded-[32px] overflow-hidden shadow-sm"
            glow="none"
          >
            <div className="p-8 border-b border-[#f1f5f9] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-[#1a1a2e]">
                  All Running Campaigns
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#e2e8f0] rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 transition-all">
                  <Filter size={18} /> Filter
                </button>
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search campaign name..."
                    className="bg-white border border-[#e2e8f0] rounded-xl pl-12 pr-6 py-3 text-sm focus:border-[#8B5CF6] outline-none w-80 shadow-sm"
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#f1f5f9] text-gray-400 text-[11px] uppercase tracking-[0.15em] font-bold bg-[#fcfdfe]">
                    <th className="px-10 py-5">Campaign Name</th>
                    <th className="px-10 py-5">Customer Name</th>
                    <th className="px-10 py-5">Mail To</th>
                    <th className="px-10 py-5">Recipients</th>
                    <th className="px-10 py-5">Status</th>
                    <th className="px-10 py-5">Progress</th>
                    <th className="px-10 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {loading ? (
                    <TableSkeleton rows={6} />
                  ) : (
                    <>
                      {filteredCampaigns.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-24 text-center">
                            <Mail
                              size={64}
                              className="mx-auto text-gray-100 mb-4"
                            />
                            <p className="text-gray-400 text-lg font-medium">
                              No campaigns found. Ready to launch?
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredCampaigns.map((c) => {
                          const progress = calculateProgress(c);
                          const isCompleted =
                            progress === 100 || c.status === "Completed";
                          return (
                            <tr
                              key={c.id}
                              className="hover:bg-[#f8fafc]/50 transition-colors group cursor-pointer"
                              onClick={() => openMonitor(c.id, c)}
                            >
                              <td className="px-10 py-7">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-2xl bg-[#f5f0ff] text-[#8B5CF6] flex items-center justify-center text-xl font-bold border border-[#e9e0ff]">
                                    <Send size={24} />
                                  </div>
                                  <div>
                                    <p className="text-[15px] font-bold text-[#1a1a2e] mb-0.5">
                                      {c.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-[13px] text-gray-400 font-medium flex items-center gap-1.5">
                                        <Clock size={12} />{" "}
                                        {c.createdAt || "Instant"}
                                      </p>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                      <p className="text-[11px] font-black text-purple-600 uppercase tracking-widest">
                                        Run {c.runCount}
                                        {c.runCount === 1
                                          ? "st"
                                          : c.runCount === 2
                                          ? "nd"
                                          : c.runCount === 3
                                          ? "rd"
                                          : "th"}{" "}
                                        time
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                           
                             <td className="px-10 py-7">
                                <p className="text-[15px] text-gray-500 font-medium truncate max-w-[180px]">
                                  {c.customerName}
                                </p>
                              </td>
                              <td className="px-10 py-7">
                                <p className="text-[15px] text-gray-500 font-medium truncate max-w-[180px]">
                                  {c.mailFrom}
                                </p>
                              </td>
                                 <td className="px-10 py-7">
                                <p className="text-[15px] text-[#1a1a2e] font-bold">
                                  {c.targetLeads?.length} Contacts
                                </p>
                              </td>
                              <td className="px-10 py-7">
                                <span
                                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold inline-flex items-center gap-2 border ${
                                    c.status === "Sending"
                                      ? "bg-[#f0f5ff] text-[#3b82f6] border-[#dbeafe]"
                                      : c.status === "Scheduled"
                                      ? "bg-[#fffbeb] text-[#d97706] border-[#fef3c7]"
                                      : c.status === "Completed"
                                      ? "bg-green-50 text-green-600 border-green-100"
                                      : "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      c.status === "Sending"
                                        ? "bg-[#3b82f6] animate-pulse"
                                        : c.status === "Scheduled"
                                        ? "bg-[#d97706]"
                                        : c.status === "Completed"
                                        ? "bg-green-600"
                                        : "bg-[#64748b]"
                                    }`}
                                  />
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-10 py-7">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                                    <span>Completion</span>
                                    <span className="text-[#8B5CF6]">
                                      {progress}%
                                    </span>
                                  </div>
                                  <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#8B5CF6]"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-10 py-7 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isCompleted && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReRun(c);
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl text-xs font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                    >
                                      <RefreshCw size={14} /> Re-run
                                    </button>
                                  )}
                                  <button className="p-3 text-gray-300 hover:text-[#8B5CF6] transition-all bg-white rounded-xl border border-transparent hover:border-gray-100 shadow-sm">
                                    <Eye size={22} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </GlassCard>
        </div>
      )}

      {view === "MONITOR" && campaignToEdit && (
        <CampaignMonitor
          campaign={campaignToEdit}
          leads={leads}
          onUpdateLeads={setLeads}
          onClose={closeMonitor}
        />
      )}
    </>
  );
};

export default Campagins;
