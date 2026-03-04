import { API_HANDLER } from "@/utils/apiHandler";

/* =======================
   TYPES
======================= */

export interface CampaignDTO {
  campaign_id: string;
  email: string;
  customer_name: string;
  campaign_name: string;
  subject: string;
  sent_at: string | null;
  brochure_filename: string | null;
}

export interface CampaignListingResponse {
  total_campaigns: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  campaigns: CampaignDTO[];
}
interface GetCampaignListingParams {
  page?: number;
  per_page?: number;
  search?: string;
}
export interface CampaignStatsResponse {
  campaign_name: string;
  company_type: string | null;
  total_customers: number;
  sent_count: number;
  failed_count: number;
  start_time: string | null;
  end_time: string | null;
  requests: number;
  delivered: number;
  clicked: number;
  bounces: number;
}
export interface SendCampaignPayload {
  name: string;
  goal: string;
  mailFrom: string;
  ccMail?: string;
  tone: string;
  posterFile?: File | null;
  targetLeadIds?: string[];
  scheduleType: "INSTANT" | "SCHEDULED";
  scheduledDate?: string;
  scheduledTime?: string;
  targetIndustry?: string;
}
export interface CreateCampaignPayload {
  campaign_name: string;
  campaign_prompt: string;
  subject: string;
  company_type: string;
  customers: {
    email: string;
    name: string;
    company_name: string;
    country: string;
  }[];
  brochure_image?: string | null;
  brochure_mime_type?: string | null;
}
/* =======================
   LISTING & STATS
======================= */

export const getCampaignListing = (params?: GetCampaignListingParams) => {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", params.page.toString());
  if (params?.per_page) query.append("per_page", params.per_page.toString());
  if (params?.search) query.append("search", params.search.toString());

  const endpoint = `campaigns/listing${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  return API_HANDLER<CampaignListingResponse>("GET", endpoint);
};

export const getCampaignStats = (id: string) => {
  return API_HANDLER<CampaignStatsResponse>("GET", `campaigns/stats/${id}`);
};

/* =======================
   SEND / CREATE CAMPAIGN
======================= */

export const sendCampaign = (payload: SendCampaignPayload, customers: any) => {
  const formData = new FormData();

  formData.append("campaign_name", payload.name);
  formData.append("subject", payload.name);
  formData.append("campaign_prompt", payload.goal);
  formData.append("mail_from", payload.mailFrom);
  formData.append("tone", payload.tone);
  formData.append("company_type", payload.targetIndustry || "customers");
  formData.append("target_leads", JSON.stringify(payload.targetLeadIds));
  formData.append("schedule_type", payload.scheduleType);
  formData.append("customers", customers);

  if (payload.ccMail) {
    formData.append("cc_mail", payload.ccMail);
  }

  if (payload.scheduleType === "SCHEDULED") {
    formData.append("scheduled_date", payload.scheduledDate || "");
    formData.append("scheduled_time", payload.scheduledTime || "");
  }

  if (payload.posterFile) {
    formData.append("file", payload.posterFile); 
  }

  return API_HANDLER("POST", "campaigns/send-with-file", formData);
};

export const createCampaign = (payload: CreateCampaignPayload) => {
  return API_HANDLER("POST", "campaigns/send", payload);
};
