import React, { useState, useEffect, useMemo } from "react";
import GlassCard from "./common/GlassCard";
import { Campaign, Lead, LeadStatus, Message } from "../types";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  X,
  Eye,
  Users,
  MessageSquare,
  Filter,
  ArrowUpRight,
  Search,
  Inbox,
  Calendar,
  Clock,
  Image as ImageIcon,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
} from "lucide-react";
import { generatePersonalizedEmail } from "../services/geminiService";
import Pagination from "./common/pagination/Index";

interface CampaignMonitorProps {
  campaign: Campaign;
  leads: Lead[];
  onUpdateLeads: (updatedLeads: Lead[]) => void;
  onClose: () => void;
}

const CampaignMonitor: React.FC<CampaignMonitorProps> = ({
  campaign,
  leads,
  onUpdateLeads,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "recipients" | "replies"
  >("overview");
  const [status, setStatus] = useState<Campaign["status"]>(campaign?.status);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingEmail, setViewingEmail] = useState<any>(null);
  const [recipientFilter, setRecipientFilter] = useState<
    "ALL" | "SENT" | "FAILED" | "REPLIED"
  >("ALL");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(leads?.length);

  const targetLeads = useMemo(
    () => leads?.filter((l) => campaign?.targetLeads?.includes(l.id)),
    [leads, campaign]
  );

  const campaignLeads = useMemo(
    () => leads?.filter((l) => campaign?.mailFrom?.includes(l.email)),
    [campaign]
  );

  const stats = useMemo(() => {
    const sentCount = targetLeads.filter(
      (l) => l.status === LeadStatus.SENT || l.status === LeadStatus.REPLIED
    ).length;
    const repliedCount = targetLeads.filter(
      (l) => l.status === LeadStatus.REPLIED
    ).length;
    const failedCount = targetLeads.filter(
      (l) => l.status === LeadStatus.FAILED
    ).length;
    const progress =
      targetLeads.length > 0 ? (sentCount / targetLeads.length) * 100 : 0;

    return { sentCount, repliedCount, failedCount, progress };
  }, [targetLeads]);

  const filteredRecipients = useMemo(() => {
    return campaignLeads.filter((l) => {
      const matchesSearch =
        l?.contactName?.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        l?.companyName?.toLowerCase().includes(recipientSearch.toLowerCase());
      const matchesFilter =
        recipientFilter === "ALL" ||
        (recipientFilter === "SENT" && l.status === LeadStatus.SENT) ||
        (recipientFilter === "FAILED" && l.status === LeadStatus.FAILED) ||
        (recipientFilter === "REPLIED" && l.status === LeadStatus.REPLIED);
      return matchesSearch && matchesFilter;
    });
  }, [leads, recipientSearch, recipientFilter]);

  const sendNextEmail = async () => {
    if (currentIndex >= targetLeads.length) {
      setStatus("Completed");
      return;
    }

    const currentLead = targetLeads[currentIndex];
    // Skip if already sent
    if (
      currentLead.status === LeadStatus.SENT ||
      currentLead.status === LeadStatus.REPLIED
    ) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const emailContent = await generatePersonalizedEmail(
        currentLead,
        campaign.analyzedContent || {
          headline: campaign?.name,
          offer: campaign?.goal,
        },
        campaign?.tone
      );

      const newLog = {
        id: Math.random().toString(),
        leadId: currentLead.id,
        leadName: currentLead.contactName,
        company: currentLead.companyName,
        subject: emailContent.subject,
        body: emailContent.body,
        timestamp: new Date().toLocaleTimeString(),
        status: "Success",
      };

      setLogs((prev) => [newLog, ...prev]);
      onUpdateLeads(
        leads.map((l) =>
          l.id === currentLead.id ? { ...l, status: LeadStatus.SENT } : l
        )
      );
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      onUpdateLeads(
        leads.map((l) =>
          l.id === currentLead.id ? { ...l, status: LeadStatus.FAILED } : l
        )
      );
      setCurrentIndex((prev) => prev + 1);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (status === "Sending" && !isGenerating) {
      const timer = setTimeout(sendNextEmail, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, currentIndex, isGenerating]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button
            onClick={onClose}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <X size={24} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a2e]">
              {campaign?.name}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span
                className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                  status === "Sending"
                    ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse"
                    : status === "Scheduled"
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : "bg-green-50 text-green-600 border-green-100"
                }`}
              >
                {status}
              </span>
              <span className="text-sm text-gray-400 font-medium flex items-center gap-1.5">
                <Calendar size={14} /> Created{" "}
                {new Date(campaign?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-2xl p-1.5 border border-[#e2e8f0] shadow-sm">
            {(["overview", "recipients", "replies"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {status !== "Completed" && (
            <button
              onClick={() =>
                setStatus(status === "Sending" ? "Paused" : "Sending")
              }
              className={`px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                status === "Sending"
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                  : "bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-[#8B5CF6]/20"
              }`}
            >
              {status === "Sending" ? (
                <>
                  <Pause size={18} fill="currentColor" /> Pause Outreach
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" /> Start Outreach
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Campaign Snapshot & Stats */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <GlassCard
                className="p-8 border-[#f1f5f9] bg-white text-center"
                glow="none"
              >
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">
                  Total Sent
                </p>
                <h4 className="text-4xl font-black text-[#1a1a2e]">
                  {/* {stats.sentCount} */}1
                </h4>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  Out of {leads.length} leads
                </p>
              </GlassCard>
              <GlassCard
                className="p-8 border-[#f1f5f9] bg-white text-center"
                glow="none"
              >
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">
                  Reply Rate
                </p>
                <h4 className="text-4xl font-black text-[#8B5CF6]">
                  {stats.sentCount > 0
                    ? Math.round((stats.repliedCount / stats.sentCount) * 100)
                    : 0}
                  %
                </h4>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {stats.repliedCount} Total Replies
                </p>
              </GlassCard>
              <GlassCard
                className="p-8 border-[#f1f5f9] bg-white text-center"
                glow="none"
              >
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">
                  Success Rate
                </p>
                <h4 className="text-4xl font-black text-green-600">
                  {stats.progress > 0
                    ? Math.round(
                        100 - (stats.failedCount / targetLeads.length) * 100
                      )
                    : 100}
                  %
                </h4>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {stats.failedCount} Delivery Issues
                </p>
              </GlassCard>
            </div>

            <GlassCard className="p-10 border-[#f1f5f9] bg-white" glow="none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#1a1a2e] flex items-center gap-3">
                  <Send size={24} className="text-[#8B5CF6]" /> Campaign
                  Identity
                </h3>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Mail From
                    </p>
                    <p className="text-sm font-bold text-[#1a1a2e]">
                      {campaign?.mailFrom}
                    </p>
                  </div>
                  {campaign?.scheduledDate && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Scheduled For
                      </p>
                      <p className="text-sm font-bold text-purple-600 flex items-center gap-2 justify-end">
                        <Calendar size={14} /> {campaign?.scheduledDate}{" "}
                        <Clock size={14} /> {campaign?.scheduledTime}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Primary Objective
                  </label>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-[#1a1a2e] font-medium leading-relaxed">
                    {campaign?.goal}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                      Brand Tone
                    </label>
                    <div className="bg-white border border-gray-100 px-5 py-3 rounded-xl font-bold text-[#1a1a2e] flex items-center gap-2">
                      {/* Fix: Sparkles is now imported and correctly used */}
                      <Sparkles size={16} className="text-purple-600" />{" "}
                      {campaign?.tone}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                      AI Analysis v2.5
                    </label>
                    <div className="bg-white border border-gray-100 px-5 py-3 rounded-xl font-bold text-[#1a1a2e] flex items-center gap-2 truncate">
                      <CheckCircle2 size={16} className="text-green-600" />{" "}
                      Ready for High Precision Outreach
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right: Poster & Visual Info */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <GlassCard
              className="p-0 border-[#f1f5f9] bg-white overflow-hidden"
              glow="none"
            >
              <div className="p-6 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                <ImageIcon size={18} className="text-gray-400" />
                <h4 className="text-sm font-bold text-[#1a1a2e]">
                  Visual Asset
                </h4>
              </div>
              <div className="p-6">
                {campaign?.posterUrl ? (
                  <img
                    src={campaign?.posterUrl}
                    className="w-full rounded-2xl shadow-sm border border-gray-100 object-cover aspect-[4/5]"
                    alt="Campaign Poster"
                  />
                ) : (
                  <div className="aspect-[4/5] bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-dashed border-gray-200">
                    <ImageIcon size={48} className="text-gray-200 mb-2" />
                    <p className="text-xs font-bold text-gray-400">
                      No Visual Attached
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            <div className="p-8 bg-[#f5f0ff] rounded-3xl border border-[#e9e0ff]">
              <h5 className="text-sm font-black text-[#8B5CF6] uppercase tracking-widest mb-4">
                Sending Integrity
              </h5>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-purple-700">
                    Campaign Health
                  </span>
                  <span className="text-xs font-black text-purple-700">
                    {Math.round(stats.progress)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-purple-100">
                  <div
                    className="h-full bg-[#8B5CF6] transition-all duration-1000"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-purple-400 italic">
                  Gemini AI is currently monitoring bounce rates and spam
                  reports in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "recipients" && (
        <GlassCard
          className="!p-0 border-[#f1f5f9] bg-white rounded-[32px] overflow-hidden"
          glow="none"
        >
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
            <div className="flex bg-white rounded-2xl p-1.5 border border-[#e2e8f0] shadow-sm w-fit">
              {(["ALL", "SENT", "FAILED", "REPLIED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRecipientFilter(f)}
                  className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    recipientFilter === f
                      ? "bg-[#8B5CF6] text-white shadow-md"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {f === "FAILED" ? "Not Sent" : f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search in campaign..."
                className="bg-white border border-[#e2e8f0] rounded-xl pl-12 pr-6 py-3 text-sm focus:border-[#8B5CF6] outline-none w-80 shadow-sm"
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#f1f5f9] text-gray-400 text-[11px] uppercase tracking-[0.15em] font-bold bg-[#fcfdfe]">
                  <th className="px-10 py-5">Recipient</th>
                  <th className="px-10 py-5">Company</th>
                  <th className="px-10 py-5">Industry</th>
                  <th className="px-10 py-5">Status</th>
                  <th className="px-10 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredRecipients.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#f5f0ff] text-[#8B5CF6] flex items-center justify-center font-bold border border-[#e9e0ff]">
                          {lead?.contactName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1a1a2e]">
                            {lead.contactName}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {lead.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-bold text-[#1a1a2e]">
                        {lead.companyName}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm text-gray-500 font-medium">
                        {lead.industry}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[12px] font-bold border flex items-center gap-2 w-fit ${
                          lead.status === LeadStatus.SENT
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : lead.status === LeadStatus.REPLIED
                            ? "bg-green-50 text-green-600 border-green-100"
                            : lead.status === LeadStatus.FAILED
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-gray-50 text-gray-500 border-gray-100"
                        }`}
                      >
                        {lead.status === LeadStatus.FAILED ? (
                          <AlertTriangle size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {lead.status === LeadStatus.SENT
                          ? "Delivered"
                          : lead.status === LeadStatus.FAILED
                          ? "Not Sent"
                          : lead.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="text-gray-300 hover:text-[#8B5CF6] p-2 transition-all">
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecipients.length === 0 && (
              <div className="py-24 text-center">
                <Search size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No records found.
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
      {activeTab === "replies" && (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <GlassCard className="p-8 border-[#f1f5f9] bg-white" glow="none">
              <h4 className="text-lg font-bold text-[#1a1a2e] mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#8B5CF6]" /> Reply Metrics
              </h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Inbound Sentiment
                    </span>
                    <span className="text-xs font-bold text-green-600">
                      Positive
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Most replies are asking about{" "}
                    <span className="font-bold text-[#1a1a2e]">
                      Logistics Pricing
                    </span>
                    . Consider updating your next batch offer.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <GlassCard
              className="p-8 border-[#f1f5f9] bg-white min-h-[400px] flex flex-col items-center justify-center text-center"
              glow="none"
            >
              <Inbox size={64} className="text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-[#1a1a2e]">
                Inbound Intelligence
              </h3>
              <p className="text-gray-400 text-sm mt-2 max-w-sm">
                Detailed conversation threads for this campaign can be found in
                the global Inbox module.
              </p>
              <button
                onClick={() => (window.location.hash = "#inbox")}
                className="mt-6 px-8 py-3 bg-[#8B5CF6] text-white font-bold rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition-all"
              >
                Go to Inbox
              </button>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignMonitor;
