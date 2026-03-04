import CampaignAnalyticsChart from "@/components/common/charts/CampaignAnalytics";
import Header from "@/components/common/hero/Header";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useState } from "react";

const CampaignAnalytics = () => {
  const { campaigns, loading } = useCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  const options = campaigns.map((c: any) => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <div>
      <Header
        title={"Campaigns Analytics"}
        subTitle="Make and manage your AI-powered outreach assets."
        options={options}
        placeholder={"Select Campaign"}
        onChange={(value: string) => setSelectedCampaign(value)}
        value={selectedCampaign}
      />
      <CampaignAnalyticsChart campaignId={selectedCampaign} />
    </div>
  );
};

export default CampaignAnalytics;
