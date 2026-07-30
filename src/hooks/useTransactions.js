import { apiClient } from "@/src/api/client";
import { useAppStore } from "@/src/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook combining TanStack Query with Zustand and API-backed transaction loading.
 * Falls back to mock data if backend fetch fails or if the user is not authenticated.
 */
export function useTransactions() {
  const setTransactions = useAppStore((state) => state.setTransactions);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userToken = useAppStore((state) => state.userToken);

  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/transactions/get");

        if (res.success && Array.isArray(res.transactions)) {
          return res.transactions.map((t) => ({
            id: t.id,
            title: t.merchant || "Manual Entry",
            merchant: t.merchant || "Manual Entry",
            amount: Number(t.amount) || 0,
            category: t.merchant_category || t.category || "Misc",
            type: t.type || "expense",
            is_cashback: Boolean(t.is_cashback || t.is_cashback === true),
            is_recurring: Boolean(t.is_recurring || t.isRecurring),
            raw_sms: t.raw_sms || "",
            date: new Date(t.date || Date.now()).toISOString(),
          }));
        }
      } catch (error) {
        console.log("[Transactions] backend fetch failed", error);
      }

      const { MOCK_HISTORY } = await import("@/src/utils/mockData");
      return MOCK_HISTORY;
    },
    enabled: Boolean(userToken),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Whenever TanStack Query resolves new data, hydrate Zustand.
  useEffect(() => {
    if (query.data) {
      setTransactions(query.data);
    }
  }, [query.data, setTransactions]);

  // If the user is authenticated but the query has not yet started, trigger it once the token is available.
  useEffect(() => {
    if (userToken && query.isIdle) {
      query.refetch();
    }
  }, [userToken, query]);

  // Load mock transactions while unauthenticated or when backend isn't available.
  useEffect(() => {
    if (!isAuthenticated && !query.isFetching && !query.data) {
      (async () => {
        const { MOCK_HISTORY } = await import("@/src/utils/mockData");
        setTransactions(MOCK_HISTORY);
      })();
    }
  }, [isAuthenticated, query.isFetching, query.data, setTransactions]);

  return query;
}
