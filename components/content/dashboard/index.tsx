import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Package,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  ChevronDown,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { Campaign, Lead, LeadStatus } from "@/types";
import { StatCard } from "@/components/common/cards/StateCards";
import GlassCard from "@/components/common/GlassCard";

// Mock data for the performance overview with two lines
const performanceData = [
  { name: "Jul 12", campaigns: 1200, replies: 200 },
  { name: "Jul 13", campaigns: 3200, replies: 600 },
  { name: "Jul 14", campaigns: 4500, replies: 1200 },
  { name: "Jul 14", campaigns: 2800, replies: 900 },
  { name: "Jul 15", campaigns: 3800, replies: 1100 },
  { name: "Jul 15", campaigns: 5200, replies: 1500 },
  { name: "Jul 15", campaigns: 11200, replies: 3200 }, // Peak
  { name: "Jul 16", campaigns: 5800, replies: 1800 },
  { name: "Jul 16", campaigns: 3200, replies: 1000 },
  { name: "Jul 17", campaigns: 4800, replies: 1400 },
  { name: "Jul 17", campaigns: 3600, replies: 900 },
  { name: "Jul 18", campaigns: 6200, replies: 2100 },
  { name: "Jul 18", campaigns: 1500, replies: 400 },
  { name: "Jul 18", campaigns: 2800, replies: 600 },
  { name: "Jul 19", campaigns: 2400, replies: 500 },
  { name: "Jul 19", campaigns: 6800, replies: 1900 },
  { name: "Jul 20", campaigns: 5200, replies: 1200 },
  { name: "Jul 20", campaigns: 7500, replies: 2200 },
  { name: "Jul 21", campaigns: 6200, replies: 1800 },
  { name: "Jul 21", campaigns: 4500, replies: 1100 },
  { name: "Jul 22", campaigns: 5800, replies: 1600 },
  { name: "Jul 22", campaigns: 4800, replies: 1300 },
  { name: "Jul 23", campaigns: 6200, replies: 1900 },
];

const ResponseItem = ({ name, message, time, avatar }: any) => (
  <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl hover:bg-[#f1f5f9] transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#1a1a2e]">{name}</h4>
        <p className="text-xs text-gray-500 line-clamp-1 max-w-[400px] mt-0.5">
          {message}
        </p>
      </div>
    </div>
    <span className="text-[11px] font-bold text-gray-400">{time}</span>
  </div>
);

const Dashboard: React.FC<{ leads: Lead[]; campaigns: Campaign[] }> = ({
  leads,
  campaigns,
}) => {
  // Metrics calculation
  const totalCampaigns = campaigns.length || 20;
  const totalSent =
    leads.filter(
      (l) => l.status === LeadStatus.SENT || l.status === LeadStatus.REPLIED
    ).length || 1000;
  const interested =
    leads.filter((l) => l.status === LeadStatus.REPLIED).length || 300;
  const notReplied =
    leads.filter((l) => l.status === LeadStatus.SENT).length || 700;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Totals Campaigns"
          value={totalCampaigns}
          icon={<Package size={24} className="text-[#facc15]" />}
          iconBg="bg-[#fef9c3]"
          trendValue="1.3%"
          trend="Up from past week"
          trendUp={true}
        />
        <StatCard
          title="Total Email Sent"
          value={totalSent}
          icon={<Clock size={24} className="text-[#f97316]" />}
          iconBg="bg-[#ffedd5]"
          trendValue="1.8%"
          trend="Up from yesterday"
          trendUp={true}
        />
        <StatCard
          title="Interested User's"
          value={interested}
          icon={<Users size={24} className="text-[#8B5CF6]" />}
          iconBg="bg-[#f5f3ff]"
          trendValue="8.5%"
          trend="Up from yesterday"
          trendUp={true}
        />
        <StatCard
          title="Not Replied Yet"
          value={notReplied}
          icon={<TrendingDown size={24} className="text-[#22c55e]" />}
          iconBg="bg-[#f0fdf4]"
          trendValue="4.3%"
          trend="Down from yesterday"
          trendUp={false}
        />
      </div>

      {/* Main Performance Chart */}
      <GlassCard className="p-8 border-none shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a2e]">
              Performance Overview
            </h2>
            <p className="text-sm font-medium text-gray-400 mt-1">
              Subscribers{" "}
              <span className="text-[#1a1a2e] font-bold">20944</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#1a1a2e] hover:bg-gray-50 transition-all">
              <Download size={16} /> Export
            </button>
            <button className="px-6 py-2.5 bg-[#8B5CF6] text-white rounded-xl text-xs font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8B5CF6]/20">
              Last 30 Days
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorCampaigns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.05} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                dy={15}
                interval={2}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                ticks={[0, 1000, 4000, 9000, 12000]}
                tickFormatter={(value) =>
                  value === 0 ? "0" : `${value / 1000}k`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ fontWeight: "bold" }}
                cursor={{
                  stroke: "#8B5CF6",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              {/* Campaign Line (Main) */}
              <Area
                type="monotone"
                dataKey="campaigns"
                stroke="#8B5CF6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCampaigns)"
                activeDot={{
                  r: 6,
                  fill: "#8B5CF6",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
              {/* Reply Line (New Requirement) */}
              <Area
                type="monotone"
                dataKey="replies"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorReplies)"
                activeDot={{
                  r: 4,
                  fill: "#3b82f6",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Recent Responses List */}
      <GlassCard className="p-8 border-none shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-[#1a1a2e]">
            Recent campaign responce
          </h3>
          <button className="text-sm font-bold text-[#8B5CF6] hover:underline">
            See All Responses
          </button>
        </div>

        <div className="space-y-4">
          <ResponseItem
            name="Nicholas Gordon"
            message="Lorem ipsum nisl sapien mi consectetur mi."
            time="10m"
            avatar="https://picsum.photos/100/100?seed=nicholas"
          />
          <ResponseItem
            name="Nina Perkins"
            message="Lorem ipsum nisl sapien mi consectetur mi."
            time="1hr"
            avatar="https://picsum.photos/100/100?seed=nina"
          />
          <ResponseItem
            name="Daniel Holland"
            message="Lorem ipsum nisl sapien mi consectetur mi."
            time="2hr"
            avatar="https://picsum.photos/100/100?seed=daniel"
          />
          <ResponseItem
            name="Franklin Thomas"
            message="Lorem ipsum nisl sapien mi consectetur mi."
            time="3hr"
            avatar="https://picsum.photos/100/100?seed=franklin"
          />
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
