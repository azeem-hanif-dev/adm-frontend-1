import React, { useEffect, useState } from "react";
import { Lead, Campaign } from "./types";
// import { NAVIGATION, INITIAL_LEADS } from "./constants";
import { NAVIGATION } from "./constants";
import LeadsManager from "./components/LeadsManager";
import CampaignCreator from "./components/CampaignCreator";
import CampaignMonitor from "./components/CampaignMonitor";
import Inbox from "./components/Inbox";
import GlassCard from "./components/common/GlassCard";
import { Mail, Bell, Search, User } from "lucide-react";
import CampaignAnalytics from "./components/content/compaignAnalytics";
import Dashboard from "./components/content/dashboard";
import { useCustomers } from "./hooks/useCustomers";
import Campagins from "./components/content/campaigns/Index";

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const { leads, loading: loadingLeads, setLeads } = useCustomers();
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | undefined>(
    undefined
  );

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId);

  const handleSaveCampaign = (newCampaign: Campaign) => {
    setCampaigns((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === newCampaign.id);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = newCampaign;
        return next;
      }
      return [newCampaign, ...prev];
    });
    setShowCreator(false);
    setCampaignToEdit(undefined);
    setActiveCampaignId(newCampaign.id);
  };

  const renderContent = () => {
    if (activeCampaignId && activeCampaign) {
      return (
        <CampaignMonitor
          campaign={activeCampaign}
          leads={leads}
          onUpdateLeads={setLeads}
          onClose={() => setActiveCampaignId(null)}
        />
      );
    }

    if (showCreator) {
      return (
        <CampaignCreator
          leads={leads}
          onSave={handleSaveCampaign}
          onCancel={() => {
            setShowCreator(false);
            setCampaignToEdit(undefined);
          }}
          initialCampaign={campaignToEdit}
        />
      );
    }

    switch (activeNav) {
      case "dashboard":
        return <Dashboard leads={leads} campaigns={campaigns} />;
      case "leads":
        return <LeadsManager leads={leads} setLeads={setLeads} />;
      case "inbox":
        return <Inbox leads={leads} campaigns={campaigns} />;
      case "campaigns":
        return <Campagins />;
      case "analytics":
        return <CampaignAnalytics />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center animate-pulse">
              <User size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              Feature coming soon in NeoSend Enterprise.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Mail className="text-white" size={24} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter text-gray-900">
              ADM
            </span>
            <p className="text-[8px] uppercase tracking-widest text-purple-600 font-bold -mt-1">
              Enterprise AI
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAVIGATION.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setActiveNav(item.path);
                setShowCreator(false);
                setCampaignToEdit(undefined);
                setActiveCampaignId(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeNav === item.path && !showCreator && !activeCampaignId
                  ? "bg-purple-50 text-purple-700 font-bold shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
              }`}
            >
              <div
                className={`${
                  activeNav === item.path
                    ? "text-purple-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {item.icon}
              </div>
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <GlassCard className="!p-4 bg-purple-50 border-purple-100">
            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest mb-1">
              System Load
            </p>
            <div className="h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 animate-pulse"
                style={{ width: "24%" }}
              />
            </div>
            <p className="text-[10px] text-purple-400 mt-2 italic">
              Active AI Instances: 2/5
            </p>
          </GlassCard>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F9FAFB]">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white z-10 sticky top-0">
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-96 transition-colors focus-within:bg-white focus-within:border-purple-200">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Global search..."
              className="bg-transparent border-none focus:outline-none ml-3 text-sm w-full text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-purple-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-gray-100" />
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900">ADM user</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-purple-600">
                  CMO • Admin
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-200 border border-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-purple-200 transition-all">
                <img
                  src="https://picsum.photos/100/100?seed=usama"
                  alt="Profile"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Area */}
        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;
