import { TrendingDown, TrendingUp } from "lucide-react";
import GlassCard from "../GlassCard";

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  trendUp,
  iconBg,
}: any) => (
  <GlassCard className="p-6 border-none shadow-sm flex flex-col justify-between h-[160px]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-[32px] font-bold text-[#1a1a2e] mt-2">{value}</h3>
      </div>
      <div
        className={`p-3 rounded-2xl ${iconBg} flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1 ${
          trendUp ? "text-green-500" : "text-red-500"
        }`}
      >
        {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="text-sm font-bold">{trendValue}</span>
      </div>
      <span className="text-gray-400 text-sm">{trend}</span>
    </div>
  </GlassCard>
);
