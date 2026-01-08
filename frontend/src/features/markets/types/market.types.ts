export interface Market {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  category: string;
  volume24hr: string;
}

export interface MarketOutcome {
  name: string;
  price: number;
}

export interface ParsedMarket extends Market {
  parsedOutcomes: MarketOutcome[];
}

export interface MarketsResponse {
  data: Market[];
}

export interface MarketResponse {
  data: Market;
}

// Sort types
export type MarketSortField = "volume" | "volume24hr" | "liquidity" | "createdAt" | "endDate";

export interface MarketSortOption {
  label: string;
  value: MarketSortField;
  ascending: boolean;
}

export const MARKET_SORT_OPTIONS: MarketSortOption[] = [
  { label: "Volume (High to Low)", value: "volume", ascending: false },
  { label: "24h Volume", value: "volume24hr", ascending: false },
  { label: "Liquidity", value: "liquidity", ascending: false },
  { label: "Newest First", value: "createdAt", ascending: false },
  { label: "Ending Soon", value: "endDate", ascending: true },
];

export const DEFAULT_SORT: MarketSortOption = MARKET_SORT_OPTIONS[0];
