import React from "react";
import {
  LayoutDashboard,
  Users,
  Send,
  BarChart3,
  Settings,
  Plus,
  Mail,
  MessageSquare,
} from "lucide-react";
import { LeadStatus } from "./types";

export const COLORS = {
  primary: "#8B5CF6",
  secondary: "#8CBE39",
  bgLight: "#F9FAFB",
};

export const NAVIGATION = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "dashboard" },
  {
    name: "Campaign Analytics",
    icon: <BarChart3 size={20} />,
    path: "analytics",
  },
  { name: "Leads", icon: <Users size={20} />, path: "leads" },
  { name: "Campaigns", icon: <Send size={20} />, path: "campaigns" },
  { name: "Inbox", icon: <MessageSquare size={20} />, path: "inbox" },
  { name: "Settings", icon: <Settings size={20} />, path: "settings" },
];

// export const INITIAL_LEADS = [
//   {
//     id: "1",
//     email: "azeemhanif327@gmail.com",
//     companyName: "test compaign",
//     contactName: "azeem hanif",
//     phone: "0335-4334355",
//     city: "Lahore",
//     country: "pak",
//     leadFrom: "Cappah",
//     industry: "Retail",
//     location: "Lahore, PK",
//     status: LeadStatus.NEW,
//     tags: [],
//   },
//   {
//     id: "2",
//     email: "Lynn42@hotmail.com",
//     companyName: "Superior",
//     contactName: "Dfe",
//     phone: "0335-4334356",
//     city: "Lahore",
//     country: "Pakistan",
//     leadFrom: "GreenWay",
//     industry: "Education",
//     location: "Lahore, PK",
//     status: LeadStatus.SENT,
//     tags: [],
//   },
//   {
//     id: "3",
//     email: "Lynn42@hotmail.com",
//     companyName: "Decent Store",
//     contactName: "Dfe",
//     phone: "0335-4334357",
//     city: "Lahore",
//     country: "Pakistan",
//     leadFrom: "Easycleanup",
//     industry: "Retail",
//     location: "Lahore, PK",
//     status: LeadStatus.NEW,
//     tags: [],
//   },
//   {
//     id: "4",
//     email: "Lynn42@hotmail.com",
//     companyName: "Al-Fatah",
//     contactName: "Dfe",
//     phone: "0335-4334358",
//     city: "Lahore",
//     country: "Pakistan",
//     leadFrom: "Cappah",
//     industry: "Retail",
//     location: "Lahore, PK",
//     status: LeadStatus.SENT,
//     tags: [],
//   },
// ];
