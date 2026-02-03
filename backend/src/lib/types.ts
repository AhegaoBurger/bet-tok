export type Platform = "polymarket" | "kalshi" | "opinion" | "limitless";

export interface PlatformInfo {
  platform: Platform;
  platformUrl: string;
}

// Unified market type with platform info
export interface UnifiedMarket extends PlatformInfo {
  id: string;
  question: string;
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
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  category: string;
  volume24hr: string;
  // Polymarket-specific fields (optional)
  conditionId?: string;
  marketMakerAddress?: string;
  submitted_by?: string;
  groupItemTitle?: string;
  groupItemThreshold?: string;
  negRisk?: boolean;
  negRiskMarketID?: string;
  // Kalshi-specific fields (optional)
  ticker?: string;
  // Opinion-specific fields (optional)
  conditionIdOpinion?: string;
  questionId?: string;
}

// Unified event type with platform info
export interface UnifiedEvent extends PlatformInfo {
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
  markets: UnifiedMarket[];
  // Kalshi-specific fields (optional)
  ticker?: string;
  // Opinion-specific fields (optional)
  questionId?: string;
}
