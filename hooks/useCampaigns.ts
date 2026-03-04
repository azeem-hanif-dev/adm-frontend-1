import { CampaignDTO, getCampaignListing } from "@/services/campaign.service";
import { Campaign } from "@/types";
import { useEffect, useState } from "react";

export const mapCampaignDTOToCampaign = (dto: CampaignDTO): Campaign => ({
  id: dto.campaign_id,
  name: dto.campaign_name,
  // Backend not sending yet → defaults
  goal: dto.subject ?? "",
  ccMail: undefined,
  tone: "Professional",
  analyzedContent: undefined,
  targetLeads: [],

  // Mapped fields
  mailFrom: dto.email,
  customerName: dto.customer_name,
  posterUrl: dto.brochure_filename,
  status: dto.sent_at ? "Completed" : "Draft",

  // Derived / safe defaults
  scheduledDate: undefined,
  scheduledTime: undefined,
  createdAt: dto.sent_at ? new Date(dto.sent_at).getTime() : Date.now(),
  runCount: 1,
});

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [campaignSearch, setCampaignSearch] = useState("");

  const fetchCampaigns = async (pageNo = page) => {
    setLoading(true);

    const res = await getCampaignListing({
      page: pageNo,
      per_page: 10,
      search: campaignSearch,
    });

    if (res.status && res.data) {
      setCampaigns(res.data.campaigns.map(mapCampaignDTOToCampaign));
      setTotalPages(res.data.total_pages);
      setPage(res.data.current_page);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchCampaigns(1);
  }, [campaignSearch]);

  return {
    campaigns,
    loading,
    page,
    totalPages,
    setPage,
    campaignSearch,
    setCampaignSearch,
    refreshCampaigns: fetchCampaigns,
  };
};
