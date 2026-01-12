const GAMMA_API_BASE = "https://gamma-api.polymarket.com";

export interface GammaMarket {
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
  // Multi-outcome event fields
  groupItemTitle?: string;
  groupItemThreshold?: string;
  negRisk?: boolean;
  negRiskMarketID?: string;
}

export interface GammaEvent {
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
  markets: GammaMarket[];
}

export interface MarketsResponse {
  data: GammaMarket[];
  next_cursor?: string;
}

export interface EventsResponse {
  data: GammaEvent[];
  next_cursor?: string;
}

async function fetchGamma<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${GAMMA_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const polymarketClient = {
  async getMarkets(params?: {
    limit?: string;
    offset?: string;
    active?: string;
    closed?: string;
    order?: string;
    ascending?: string;
  }): Promise<GammaMarket[]> {
    return fetchGamma<GammaMarket[]>("/markets", params);
  },

  async getMarket(id: string): Promise<GammaMarket> {
    return fetchGamma<GammaMarket>(`/markets/${id}`);
  },

  async getMarketBySlug(slug: string): Promise<GammaMarket> {
    const markets = await fetchGamma<GammaMarket[]>("/markets", { slug });
    if (!markets.length) {
      throw new Error(`Market not found: ${slug}`);
    }
    return markets[0];
  },

  async getEvents(params?: {
    limit?: string;
    offset?: string;
    active?: string;
    closed?: string;
    order?: string;
    ascending?: string;
  }): Promise<GammaEvent[]> {
    return fetchGamma<GammaEvent[]>("/events", params);
  },

  async getEvent(id: string): Promise<GammaEvent> {
    return fetchGamma<GammaEvent>(`/events/${id}`);
  },

  async searchMarkets(query: string): Promise<GammaMarket[]> {
    return fetchGamma<GammaMarket[]>("/markets", {
      _q: query,
      active: "true",
    });
  },
};
