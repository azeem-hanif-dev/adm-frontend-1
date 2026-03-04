import { LeadStatus } from "@/types";
import { API_HANDLER } from "@/utils/apiHandler";

interface CustomerApiResponse {
  _id: string;
  email: string;
  company_name: string;
  name: string;
  country: string;
}

interface FetchCustomersParams {
  search?: string;
  page?: number;
  per_page?: number;
}

const mapCustomerToLead = (c: CustomerApiResponse) => ({
  id: c._id,
  email: c.email,
  companyName: c.company_name,
  contactName: c.name,
  country: c.country,
  city: "",
  phone: "",
  leadFrom: "Cappah",
  industry: "",
  location: c.country,
  status: LeadStatus.NEW,
  tags: [],
});

export const fetchCustomers = async (params: FetchCustomersParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.per_page)
    queryParams.append("per_page", params.per_page.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `customers?${queryString}` : "customers";

  const response = await API_HANDLER<CustomerApiResponse[]>("GET", endpoint);

  return response.data.map((c) => ({
    id: c._id,
    email: c.email,
    companyName: c.company_name,
    contactName: c.name,
    country: c.country,
    city: "",
    phone: "",
    leadFrom: "Cappah",
    industry: "",
    location: c.country,
    status: LeadStatus.NEW,
    tags: [],
  }));
};
export const fetchDcsCustomers = async (params: FetchCustomersParams = {}) => {
  const response = await API_HANDLER<CustomerApiResponse[]>(
    "GET",
    "customers/dcs"
  );

  return response.data.map(mapCustomerToLead);
};

export const fetchGccLeads = async (params: FetchCustomersParams = {}) => {
  const response = await API_HANDLER<CustomerApiResponse[]>(
    "GET",
    "customers/gcc-leads"
  );

  return response.data.map(mapCustomerToLead);
};
export const fetchCustomersByType = async (
  type: string,
  params: FetchCustomersParams = {}
) => {
  switch (type) {
    case "customers":
      return fetchCustomers(params);

    case "dcs_customers":
      return fetchDcsCustomers(params);

    case "gcc_leads":
      return fetchGccLeads(params);

    default:
      return [];
  }
};
