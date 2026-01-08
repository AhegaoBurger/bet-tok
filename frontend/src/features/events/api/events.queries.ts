import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { EventsService } from "./events.service";
import { QUERY_STALE_TIME } from "@/shared/constants";
import type { EventSortField } from "../types/event.types";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    order?: EventSortField;
    ascending?: boolean;
  }) => [...eventKeys.lists(), filters] as const,
  infinite: (filters?: {
    order?: EventSortField;
    ascending?: boolean;
    active?: boolean;
  }) => [...eventKeys.all, "infinite", filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export interface UseInfiniteEventsOptions {
  pageSize?: number;
  active?: boolean;
  order?: EventSortField;
  ascending?: boolean;
  enabled?: boolean;
}

export function useInfiniteEvents(options?: UseInfiniteEventsOptions) {
  const {
    pageSize = 20,
    active = true,
    order = "volume",
    ascending = false,
    enabled = true,
  } = options || {};

  return useInfiniteQuery({
    queryKey: eventKeys.infinite({ order, ascending, active }),
    queryFn: ({ pageParam = 0 }) =>
      EventsService.getEvents({
        limit: pageSize,
        offset: pageParam,
        active,
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

export function useEvent(id: string, enabled = true) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => EventsService.getEvent(id),
    staleTime: QUERY_STALE_TIME,
    enabled: enabled && !!id,
  });
}
