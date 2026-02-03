import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { EventsService } from "./events.service";
import { QUERY_STALE_TIME } from "@/shared/constants";
import type { EventSortField } from "../types/event.types";
import type { Platform } from "@/shared/types/platform";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    closed?: boolean;
    order?: EventSortField;
    ascending?: boolean;
    platform?: Platform;
  }) => [...eventKeys.lists(), filters] as const,
  infinite: (filters?: {
    order?: EventSortField;
    ascending?: boolean;
    active?: boolean;
    closed?: boolean;
    platform?: Platform;
  }) => [...eventKeys.all, "infinite", filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export interface UseInfiniteEventsOptions {
  pageSize?: number;
  active?: boolean;
  closed?: boolean;
  order?: EventSortField;
  ascending?: boolean;
  enabled?: boolean;
  platform?: Platform;
}

export function useInfiniteEvents(options?: UseInfiniteEventsOptions) {
  const {
    pageSize = 20,
    active = true,
    closed = false,
    order = "volume",
    ascending = false,
    enabled = true,
    platform,
  } = options || {};

  return useInfiniteQuery({
    queryKey: eventKeys.infinite({ order, ascending, active, closed, platform }),
    queryFn: ({ pageParam = 0 }) =>
      EventsService.getEvents({
        limit: pageSize,
        offset: pageParam,
        active,
        closed,
        order,
        ascending,
        platform,
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

export function useEvent(id: string, enabled = true) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => EventsService.getEvent(id),
    staleTime: QUERY_STALE_TIME,
    enabled: enabled && !!id,
  });
}
