import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../cards/StatChartCard";
import { useState, useEffect } from "react";
import GlassCard from "../GlassCard";
import {
  CampaignStatsResponse,
  getCampaignStats,
} from "@/services/campaign.service";
import { log } from "console";

type ChartData = {
  day: string;
  requests: number;
  delivered: number;
  bounces: number;
  clicked: number;
};
interface Props {
  campaignId: string;
}
// const data: ChartData[] = [
//   { day: "Mon", requests: 500, delivered: 300, bounces: 120, clicked: 80 },
//   { day: "Tue", requests: 3000, delivered: 1800, bounces: 400, clicked: 250 },
//   { day: "Wed", requests: 8000, delivered: 3500, bounces: 600, clicked: 420 },
//   { day: "Thu", requests: 0, delivered: 0, bounces: 0, clicked: 0 },
//   { day: "Fri", requests: 0, delivered: 0, bounces: 0, clicked: 0 },
//   { day: "Sat", requests: 12000, delivered: 8000, bounces: 900, clicked: 700 },
//   { day: "Sun", requests: 1000, delivered: 700, bounces: 200, clicked: 120 },
// ];
const chartStats = [
  { key: "requests", label: "REQUESTS", color: "#2F4F2F" },
  { key: "delivered", label: "DELIVERED", color: "#9ACD32" },
  { key: "bounces", label: "BOUNCES", color: "#8B0000" },
  { key: "clicked", label: "CLICKED", color: "#C71585" },
];

const CampaignAnalyticsChart = ({ campaignId }: Props) => {
  const actualId = typeof campaignId === "object" ? campaignId?.value : campaignId;

  const [stats, setStats] = useState<CampaignStatsResponse | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({
    requests: true,
    delivered: true,
    bounces: true,
    clicked: true,
  });
  useEffect(() => {
    const fetchStats = async () => {
      const response = await getCampaignStats(actualId);
      console.log("response graph", response.data);

      if (response.status && response.data) {
        setStats(response.data);

        setChartData([
          {
         day: response?.data?.campaign_name || "Campaign", // ✅ dynamic
            requests: response.data.requests,
            delivered: response.data.delivered,
            bounces: response.data.bounces,
            clicked: response.data.clicked,
          },
        ]);
      }
    };
    if (actualId) fetchStats();
  }, [actualId]);

  const toggleLine = (key: string) => {
    setActiveLines((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <GlassCard className="p-8 border-none shadow-sm">
      <div className="h-[400px] border rounded-md p-2 relative pt-24">
   <div className="grid grid-cols-5 gap-4 mb-4 absolute -top-5 right-10">
        {chartStats.map((stat) => (
          <div key={stat.key} onClick={() => toggleLine(stat.key)}>
            <StatCard
              label={stat.label}
              value={stats ? stats[stat.key as keyof CampaignStatsResponse] : 0} // ✅ dynamic
              color={stat.color}
              // active={activeLines[stat.key]}
            />
          </div>
        ))}

        {/* Spam reports */}
        <StatCard
          label="SPAM REPORT"
          value={stats ? stats.spamReports ?? "0.00%" : "0.00%"} // ✅ dynamic if available
        />
      </div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="requests"
              stroke="#2F4F2F"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="delivered"
              stroke="#9ACD32"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="bounces"
              stroke="#8B0000"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="clicked"
              stroke="#C71585"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default CampaignAnalyticsChart;
