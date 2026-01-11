import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { MarketsService } from "./markets.service";
import { QUERY_STALE_TIME } from "@/shared/constants";
import type { MarketSortField } from "../types/market.types";

// Query key factory
export const marketKeys = {
  all: ["markets"] as const,
  lists: () => [...marketKeys.all, "list"] as const,
  list: (filters?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    closed?: boolean;
    order?: MarketSortField;
    ascending?: boolean;
  }) => [...marketKeys.lists(), filters] as const,
  infinite: (filters?: {
    order?: MarketSortField;
    ascending?: boolean;
    active?: boolean;
    closed?: boolean;
  }) => [...marketKeys.all, "infinite", filters] as const,
  details: () => [...marketKeys.all, "detail"] as const,
  detail: (id: string) => [...marketKeys.details(), id] as const,
  search: (query: string) => [...marketKeys.all, "search", query] as const,
};

export interface UseMarketsOptions {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  order?: MarketSortField;
  ascending?: boolean;
  enabled?: boolean;
}

export function useMarkets(options?: UseMarketsOptions) {
  const {
    limit = 20,
    offset = 0,
    active = true,
    closed = false,
    order,
    ascending,
    enabled = true,
  } = options || {};

  return useQuery({
    queryKey: marketKeys.list({ limit, offset, active, closed, order, ascending }),
    queryFn: () =>
      MarketsService.getMarkets({ limit, offset, active, closed, order, ascending }),
    staleTime: QUERY_STALE_TIME,
    enabled,
  });
}

export interface UseInfiniteMarketsOptions {
  pageSize?: number;
  active?: boolean;
  closed?: boolean;
  order?: MarketSortField;
  ascending?: boolean;
  enabled?: boolean;
}

export function useInfiniteMarkets(options?: UseInfiniteMarketsOptions) {
  const {
    pageSize = 30,
    active = true,
    closed = false,
    order = "volume",
    ascending = false,
    enabled = true,
  } = options || {};

  return useInfiniteQuery({
    queryKey: marketKeys.infinite({ order, ascending, active, closed }),
    queryFn: ({ pageParam = 0 }) =>
      MarketsService.getMarkets({
        limit: pageSize,
        offset: pageParam,
        active,
        closed,
        order,
        ascending,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) {
        return undefined;
      }
      return allPages.flat().length;
    },
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
