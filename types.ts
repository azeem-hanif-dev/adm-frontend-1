export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  SENT = "SENT",
  REPLIED = "REPLIED",
  FAILED = "FAILED",
}

export interface Lead {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  phone?: string;
  city: string;
  country: string;
  leadFrom: string;
  industry: string;
  location: string;
  status: LeadStatus;
  tags: string[];
}

export interface Campaign {
  id: string;
  name: string;
  goal: string;
  mailFrom: string;
  ccMail?: string;
  tone: "Formal" | "Friendly" | "Sales" | "Professional";
  posterUrl: string | null;
  analyzedContent?: {
    headline: string;
    offer: string;
    cta: string;
    tone: string;
  };
  targetLeads: string[];
  status: "Draft" | "Sending" | "Completed" | "Paused" | "Scheduled";
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: number;
  runCount: number;
  customerName: string;
}

export interface Message {
  id: string;
  leadId: string;
  campaignId?: string;
  subject: string;
  preview: string;
  fullContent: string;
  timestamp: string;
  read: boolean;
  sentiment: "Interested" | "Question" | "Negative" | "Neutral";
  folder: "Primary" | "Follow-up" | "Spam";
}
