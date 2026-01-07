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
