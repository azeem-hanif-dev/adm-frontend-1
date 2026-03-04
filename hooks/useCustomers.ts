import { useCallback, useEffect, useState } from "react";
import {
  fetchCustomers,
} from "@/services/customers.service";
import { Lead } from "@/types";

interface UseCustomersResult {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export const useCustomers = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCustomers({ search: customerSearch });
      setLeads(data);
    } catch {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    leads,
    loading,
    error,
    reload: loadCustomers,
    setLeads,
    customerSearch,
    setCustomerSearch,
  };
};
