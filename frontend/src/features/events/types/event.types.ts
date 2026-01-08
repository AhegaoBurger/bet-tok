import type { Market, ParsedMarket } from "@/features/markets/types/market.types";

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  markets: Market[];
}

export interface EventOutcome {
  name: string;
  price: number;
  marketId: string;
}

export interface ParsedEvent extends Omit<Event, "markets"> {
  markets: ParsedMarket[];
  topOutcomes: EventOutcome[];
  totalOutcomesCount: number;
}

export interface EventsResponse {
  data: Event[];
}

export interface EventResponse {
  data: Event;
}

export type EventSortField = "volume" | "liquidity" | "creationDate" | "endDate";

export interface EventSortOption {
  label: string;
  value: EventSortField;
  ascending: boolean;
}

export const EVENT_SORT_OPTIONS: EventSortOption[] = [
  { label: "Volume (High to Low)", value: "volume", ascending: false },
  { label: "Liquidity", value: "liquidity", ascending: false },
  { label: "Newest First", value: "creationDate", ascending: false },
  { label: "Ending Soon", value: "endDate", ascending: true },
];

export const DEFAULT_EVENT_SORT: EventSortOption = EVENT_SORT_OPTIONS[0];
