import { useQuery } from "@tanstack/react-query";
import { MarketsService } from "./markets.service";
import { QUERY_STALE_TIME } from "@/shared/constants";

// Query key factory
export const marketKeys = {
  all: ["markets"] as const,
  lists: () => [...marketKeys.all, "list"] as const,
  list: (filters?: { limit?: number; offset?: number; active?: boolean }) =>
    [...marketKeys.lists(), filters] as const,
  details: () => [...marketKeys.all, "detail"] as const,
  detail: (id: string) => [...marketKeys.details(), id] as const,
  search: (query: string) => [...marketKeys.all, "search", query] as const,
};

export interface UseMarketsOptions {
  limit?: number;
  offset?: number;
  active?: boolean;
  enabled?: boolean;
}

export function useMarkets(options?: UseMarketsOptions) {
  const { limit = 20, offset = 0, active = true, enabled = true } = options || {};

  return useQuery({
    queryKey: marketKeys.list({ limit, offset, active }),
    queryFn: () => MarketsService.getMarkets({ limit, offset, active }),
    staleTime: QUERY_STALE_TIME,
    enabled,
  });
}

export function useMarket(id: string, enabled = true) {
  return useQuery({
    queryKey: marketKeys.detail(id),
    queryFn: () => MarketsService.getMarket(id),
    staleTime: QUERY_STALE_TIME,
    enabled: enabled && !!id,
  });
}

export function useSearchMarkets(query: string, enabled = true) {
  return useQuery({
    queryKey: marketKeys.search(query),
    queryFn: () => MarketsService.searchMarkets(query),
    staleTime: QUERY_STALE_TIME,
    enabled: enabled && query.length >= 2,
  });
}
